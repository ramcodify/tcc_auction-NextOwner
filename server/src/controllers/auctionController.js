import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import AutoBid from '../models/AutoBid.js';
import Question from '../models/Question.js';
import Watchlist from '../models/Watchlist.js';
import { placeBid, resolveProxyBids } from '../services/biddingService.js';
import { matchNewAuctionAgainstSavedSearches } from '../services/savedSearchMatcher.js';
import { getIO, createNotification } from '../services/notificationService.js';

/**
 * Explore / Search marketplace auctions with filters and pagination
 */
export const getMarketplaceAuctions = async (req, res) => {
  try {
    const {
      q,
      category,
      condition,
      minPrice,
      maxPrice,
      closingSoon,
      sort = 'closing_soon',
      page = 1,
      limit = 12
    } = req.query;

    const filter = { status: 'live' };

    // Text / keyword search
    if (q && q.trim() !== '') {
      const trimmed = q.trim();
      filter.$or = [
        { title: new RegExp(trimmed, 'i') },
        { description: new RegExp(trimmed, 'i') }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Condition filter
    if (condition && condition !== 'all') {
      filter.condition = condition;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.currentPrice = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        filter.currentPrice.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filter.currentPrice.$lte = Number(maxPrice);
      }
    }

    // Closing soon filter (e.g., closing within 24 hours)
    if (closingSoon === 'true') {
      const now = new Date();
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      filter.closesAt = { $gte: now, $lte: next24h };
    }

    // Sort order
    let sortQuery = { closesAt: 1 }; // Default closing soonest
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'price_low') {
      sortQuery = { currentPrice: 1 };
    } else if (sort === 'price_high') {
      sortQuery = { currentPrice: -1 };
    } else if (sort === 'most_bids') {
      sortQuery = { bidCount: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * pageLimit;

    const [auctions, total] = await Promise.all([
      Auction.find(filter)
        .populate('sellerId', 'name campus')
        .sort(sortQuery)
        .skip(skip)
        .limit(pageLimit),
      Auction.countDocuments(filter)
    ]);

    return res.status(200).json({
      status: 'success',
      data: auctions,
      pagination: {
        page: pageNum,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    console.error('[getMarketplaceAuctions Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Curated auctions for the Home page
 */
export const getHomeAuctions = async (req, res) => {
  try {
    const now = new Date();
    const [liveAuctions, closingSoon, recentlyPublished, categoryStats] = await Promise.all([
      Auction.find({ status: 'live' })
        .populate('sellerId', 'name campus')
        .sort({ bidCount: -1, closesAt: 1 })
        .limit(8),
      Auction.find({ status: 'live', closesAt: { $gt: now } })
        .populate('sellerId', 'name campus')
        .sort({ closesAt: 1 })
        .limit(6),
      Auction.find({ status: 'live' })
        .populate('sellerId', 'name campus')
        .sort({ createdAt: -1 })
        .limit(6),
      Auction.aggregate([
        { $match: { status: 'live' } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    const categoriesCount = {};
    categoryStats.forEach((c) => {
      categoriesCount[c._id] = c.count;
    });

    return res.status(200).json({
      status: 'success',
      liveAuctions,
      closingSoon,
      recentlyPublished,
      categoriesCount
    });
  } catch (error) {
    console.error('[getHomeAuctions Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Fetch full auction details with public bid history and Q&A
 */
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('sellerId', 'name email campus phone bio')
      .populate('leadingBidderId', 'name campus');

    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    // Increment view counter
    auction.viewsCount = (auction.viewsCount || 0) + 1;
    await auction.save();

    // Fetch authoritative bid history (newest first)
    const bidHistory = await Bid.find({ auctionId: auction._id })
      .populate('bidderId', 'name campus')
      .sort({ createdAt: -1 });

    // Fetch questions & answers
    const questions = await Question.find({ auctionId: auction._id })
      .populate('askerId', 'name campus')
      .sort({ createdAt: -1 });

    // Check user watchlist & auto-bid status if logged in
    let isWatched = false;
    let userAutoBid = null;

    if (req.user) {
      const [watchDoc, autoBidDoc] = await Promise.all([
        Watchlist.findOne({ userId: req.user._id, auctionId: auction._id }),
        AutoBid.findOne({ userId: req.user._id, auctionId: auction._id, isActive: true })
      ]);
      isWatched = Boolean(watchDoc);
      if (autoBidDoc) {
        userAutoBid = {
          maxAmount: autoBidDoc.maxAmount,
          isActive: autoBidDoc.isActive
        };
      }
    }

    return res.status(200).json({
      status: 'success',
      auction,
      bidHistory,
      questions,
      isWatched,
      userAutoBid
    });
  } catch (error) {
    console.error('[getAuctionById Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Create a new auction listing
 */
export const createAuction = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      condition,
      startingPrice,
      minimumIncrement,
      closingDate,
      closingTime,
      photos
    } = req.body;

    if (!title || !category || !description || !condition || !startingPrice || !closingDate || !closingTime) {
      return res.status(400).json({
        status: 'error',
        message: 'Please complete all required fields.'
      });
    }

    const startPrice = Math.floor(Number(startingPrice));
    const minInc = minimumIncrement ? Math.floor(Number(minimumIncrement)) : 20;

    if (startPrice <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Starting price must be a positive integer.'
      });
    }

    // Combine closingDate and closingTime into ISO Date
    const closesAt = new Date(`${closingDate}T${closingTime}`);
    if (isNaN(closesAt.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid closing date or time format.'
      });
    }

    if (closesAt <= new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Closing date and time must be in the future.'
      });
    }

    // Process photo files (uploaded via multer or passed as image URLs/placeholders)
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (Array.isArray(photos) && photos.length > 0) {
      photoUrls = photos;
    } else if (typeof photos === 'string' && photos.trim()) {
      photoUrls = [photos.trim()];
    } else {
      photoUrls = ['/images/placeholder-item.svg'];
    }

    const auction = await Auction.create({
      sellerId: req.user._id,
      title: title.trim(),
      category,
      description: description.trim(),
      condition,
      photos: photoUrls,
      startingPrice: startPrice,
      minimumIncrement: minInc,
      currentPrice: startPrice,
      closesAt,
      originalClosesAt: closesAt,
      status: 'live'
    });

    // Check offline saved searches and alert matching students
    setImmediate(() => {
      matchNewAuctionAgainstSavedSearches(auction);
    });

    return res.status(201).json({
      status: 'success',
      message: 'Auction listing published successfully!',
      auction
    });
  } catch (error) {
    console.error('[createAuction Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Edit an eligible listing
 * Rule: When bids already exist, starting price and deadline cannot be altered.
 */
export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    // Verify ownership
    if (auction.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'You are not authorized to edit this listing.' });
    }

    if (['completed', 'cancelled', 'rejected', 'reserved'].includes(auction.status)) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot edit an auction that is already ${auction.status}.`
      });
    }

    const { title, description, condition, category, photos } = req.body;

    if (title) auction.title = title.trim();
    if (description) auction.description = description.trim();
    if (condition) auction.condition = condition;
    if (category) auction.category = category;

    // Photos
    if (req.files && req.files.length > 0) {
      const newPhotos = req.files.map((file) => `/uploads/${file.filename}`);
      auction.photos = newPhotos;
    } else if (Array.isArray(photos) && photos.length > 0) {
      auction.photos = photos;
    }

    // Only allow price/deadline adjustments if ZERO bids have been placed
    if (auction.bidCount === 0) {
      if (req.body.startingPrice) {
        const sp = Math.floor(Number(req.body.startingPrice));
        if (sp > 0) {
          auction.startingPrice = sp;
          auction.currentPrice = sp;
        }
      }
      if (req.body.minimumIncrement) {
        auction.minimumIncrement = Math.max(5, Math.floor(Number(req.body.minimumIncrement)));
      }
      if (req.body.closingDate && req.body.closingTime) {
        const newClosesAt = new Date(`${req.body.closingDate}T${req.body.closingTime}`);
        if (newClosesAt > new Date()) {
          auction.closesAt = newClosesAt;
          auction.originalClosesAt = newClosesAt;
        }
      }
    }

    await auction.save();

    return res.status(200).json({
      status: 'success',
      message: 'Listing updated successfully.',
      auction
    });
  } catch (error) {
    console.error('[updateAuction Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Cancel an auction with explicit confirmation reason
 */
export const cancelAuction = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    if (auction.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'You are not authorized to cancel this auction.' });
    }

    if (auction.status === 'completed') {
      return res.status(400).json({ status: 'error', message: 'Cannot cancel a completed sale.' });
    }

    auction.status = 'cancelled';
    auction.isCancelled = true;
    auction.cancellationReason = cancellationReason || 'Cancelled by seller';
    await auction.save();

    // Notify leading bidder if one existed
    if (auction.leadingBidderId) {
      createNotification({
        userId: auction.leadingBidderId,
        title: 'Auction Cancelled',
        message: `"${auction.title}" was cancelled by the seller. Reason: ${auction.cancellationReason}`,
        type: 'system',
        relatedAuctionId: auction._id,
        link: `/explore`
      });
    }

    const io = getIO();
    if (io) {
      io.to(`auction:${auction._id}`).emit('auction_cancelled', {
        auctionId: auction._id,
        message: 'This auction has been cancelled by the seller.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Auction cancelled successfully.'
    });
  } catch (error) {
    console.error('[cancelAuction Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Place a manual bid (using core biddingService)
 */
export const submitBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await placeBid({
      auctionId: req.params.id,
      bidderId: req.user._id,
      amount
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Configure / Update automatic proxy bidding limit
 */
export const configureAutoBid = async (req, res) => {
  try {
    const { maxAmount } = req.body;
    const numericMax = Math.floor(Number(maxAmount));

    if (isNaN(numericMax) || numericMax <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid maximum amount is required.' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.status !== 'live') {
      return res.status(400).json({ status: 'error', message: 'Auction is not accepting bids.' });
    }

    if (auction.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ status: 'error', message: 'Sellers cannot configure auto-bids on their own items.' });
    }

    // Upsert AutoBid
    const autoBid = await AutoBid.findOneAndUpdate(
      { auctionId: auction._id, bidderId: req.user._id },
      { maxAmount: numericMax, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Trigger proxy resolution
    setImmediate(() => {
      resolveProxyBids(auction._id, req.user._id);
    });

    return res.status(200).json({
      status: 'success',
      message: `Automatic proxy bidding configured up to ₹${numericMax.toLocaleString('en-IN')}.`,
      autoBid: {
        maxAmount: autoBid.maxAmount,
        isActive: autoBid.isActive
      }
    });
  } catch (error) {
    console.error('[configureAutoBid Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Ask a question on an auction
 */
export const submitQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ status: 'error', message: 'Question content cannot be empty.' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    const qDoc = await Question.create({
      auctionId: auction._id,
      askerId: req.user._id,
      question: question.trim()
    });

    await qDoc.populate('askerId', 'name campus');

    // Notify seller
    createNotification({
      userId: auction.sellerId,
      title: 'New Question on Your Auction',
      message: `${req.user.name} asked: "${qDoc.question.substring(0, 60)}..."`,
      type: 'new_question',
      relatedAuctionId: auction._id,
      link: `/auction/${auction._id}`
    });

    return res.status(201).json({
      status: 'success',
      question: qDoc
    });
  } catch (error) {
    console.error('[submitQuestion Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Seller answer a question
 */
export const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ status: 'error', message: 'Answer cannot be empty.' });
    }

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    if (auction.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'Only the seller can answer questions.' });
    }

    const qDoc = await Question.findById(req.params.qId);
    if (!qDoc) {
      return res.status(404).json({ status: 'error', message: 'Question not found' });
    }

    qDoc.answer = answer.trim();
    qDoc.answeredAt = new Date();
    await qDoc.save();

    // Notify asker
    createNotification({
      userId: qDoc.askerId,
      title: 'Question Answered',
      message: `The seller answered your question on "${auction.title}".`,
      type: 'new_question',
      relatedAuctionId: auction._id,
      link: `/auction/${auction._id}`
    });

    return res.status(200).json({
      status: 'success',
      question: qDoc
    });
  } catch (error) {
    console.error('[answerQuestion Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Seller Decision: Approve or Reject the provisional winner's bid
 */
export const handleSellerDecision = async (req, res) => {
  try {
    const { decision, handoverNotes } = req.body; // 'approved' or 'rejected'
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    if (auction.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'error', message: 'Only the seller can decide the auction outcome.' });
    }

    if (auction.status !== 'awaiting_approval') {
      return res.status(400).json({
        status: 'error',
        message: `Auction is in status "${auction.status}". Cannot decide.`
      });
    }

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ status: 'error', message: 'Decision must be "approved" or "rejected".' });
    }

    auction.sellerDecision = decision;
    auction.decisionAt = new Date();

    if (decision === 'approved') {
      auction.status = 'reserved';
      if (handoverNotes) auction.handoverNotes = handoverNotes.trim();
      await auction.save();

      // Notify winner
      createNotification({
        userId: auction.leadingBidderId,
        title: 'Winning Price Approved! Item Reserved',
        message: `The seller approved your winning bid of ₹${auction.currentPrice.toLocaleString('en-IN')} for "${auction.title}". Coordinate handover!`,
        type: 'seller_decision',
        relatedAuctionId: auction._id,
        link: `/auction/${auction._id}`
      });

      return res.status(200).json({
        status: 'success',
        message: 'Winning price approved. Item is now reserved for pickup.',
        auction
      });
    } else {
      auction.status = 'rejected';
      await auction.save();

      // Notify winner
      createNotification({
        userId: auction.leadingBidderId,
        title: 'Auction Offer Declined',
        message: `The seller declined the final bid of ₹${auction.currentPrice.toLocaleString('en-IN')} for "${auction.title}".`,
        type: 'seller_decision',
        relatedAuctionId: auction._id,
        link: `/auction/${auction._id}`
      });

      return res.status(200).json({
        status: 'success',
        message: 'Winning offer declined. Auction marked as rejected.',
        auction
      });
    }
  } catch (error) {
    console.error('[handleSellerDecision Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Handover confirmation by buyer or seller
 */
export const confirmHandover = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ status: 'error', message: 'Auction not found' });
    }

    if (auction.status !== 'reserved') {
      return res.status(400).json({
        status: 'error',
        message: `Item must be in "reserved" state to confirm handover (Current: ${auction.status}).`
      });
    }

    const userId = req.user._id.toString();
    const isSeller = auction.sellerId.toString() === userId;
    const isBuyer = auction.leadingBidderId && auction.leadingBidderId.toString() === userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ status: 'error', message: 'Only the buyer or seller can confirm handover.' });
    }

    if (isSeller) {
      auction.sellerConfirmed = true;
      auction.sellerConfirmedAt = new Date();
    }
    if (isBuyer) {
      auction.buyerConfirmed = true;
      auction.buyerConfirmedAt = new Date();
    }

    // If both confirmed, sale is officially completed
    if (auction.sellerConfirmed && auction.buyerConfirmed) {
      auction.status = 'completed';
    }

    await auction.save();

    return res.status(200).json({
      status: 'success',
      message: auction.status === 'completed'
        ? 'Both parties confirmed handover. Sale successfully completed!'
        : 'Your handover confirmation was recorded. Waiting for the other party.',
      auction
    });
  } catch (error) {
    console.error('[confirmHandover Error]', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
