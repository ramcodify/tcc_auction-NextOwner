import Auction from '../models/Auction.js';

/**
 * Intelligent AI Assistant service for NEXTowner campus marketplace.
 * Connects natural language requests directly to real MongoDB auction data.
 */
export const processAIChat = async ({ message, user = null }) => {
  const queryText = (message || '').toLowerCase().trim();

  // 1. Detect Intent: Automatic Bidding or Manual Bidding Action Request
  const autoBidMatch = queryText.match(/(?:auto\s*bid|proxy\s*bid|bid\s*up\s*to|maximum\s*bid|bid\s*on)\s*(?:the\s*)?(.*?)\s*(?:up\s*to|for|at)?\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (autoBidMatch) {
    const rawTarget = autoBidMatch[1].trim();
    const targetAmount = parseInt(autoBidMatch[2], 10);

    // Search for matching live auction
    let matchedAuction = null;
    if (rawTarget) {
      matchedAuction = await Auction.findOne({
        status: 'live',
        $or: [
          { title: new RegExp(rawTarget, 'i') },
          { category: new RegExp(rawTarget, 'i') }
        ]
      }).sort({ closesAt: 1 });
    }

    if (matchedAuction) {
      return {
        reply: `I found **"${matchedAuction.title}"** (Current Price: ₹${matchedAuction.currentPrice.toLocaleString('en-IN')}).\n\nWould you like me to configure an automatic proxy bid with a maximum limit of **₹${targetAmount.toLocaleString('en-IN')}**?`,
        actionProposal: {
          type: 'CONFIRM_AUTOBID',
          auctionId: matchedAuction._id,
          title: matchedAuction.title,
          maxAmount: targetAmount,
          currentPrice: matchedAuction.currentPrice,
          closesAt: matchedAuction.closesAt
        },
        auctions: [formatAuctionResult(matchedAuction)]
      };
    }
  }

  // 2. Extract Category, Price, and Condition filters from natural language
  const filter = { status: 'live' };
  let sort = { closesAt: 1 }; // Default to closing soon

  // Category detection
  if (queryText.includes('cycle') || queryText.includes('bicycle') || queryText.includes('bike')) {
    filter.category = 'cycle';
  } else if (queryText.includes('calc') || queryText.includes('calculator') || queryText.includes('fx')) {
    filter.category = 'calculator';
  } else if (queryText.includes('book') || queryText.includes('textbook') || queryText.includes('notes') || queryText.includes('study')) {
    filter.category = 'books';
  } else if (queryText.includes('electronic') || queryText.includes('laptop') || queryText.includes('phone') || queryText.includes('headphone') || queryText.includes('charger')) {
    filter.category = 'electronics';
  } else if (queryText.includes('furniture') || queryText.includes('chair') || queryText.includes('table') || queryText.includes('desk') || queryText.includes('bed')) {
    filter.category = 'furniture';
  }

  // Condition detection
  if (queryText.includes('like new') || queryText.includes('mint')) {
    filter.condition = { $in: ['new', 'like_new'] };
  } else if (queryText.includes('good condition') || queryText.includes('decent')) {
    filter.condition = { $in: ['new', 'like_new', 'good'] };
  }

  // Price detection (e.g. "under 2000", "below ₹500", "under 1500")
  const priceMatch = queryText.match(/(?:under|below|less than|max|up to|within)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceMatch) {
    const maxBudget = parseInt(priceMatch[1], 10);
    filter.currentPrice = { $lte: maxBudget };
  }

  // Sorting detection
  if (queryText.includes('newest') || queryText.includes('recent') || queryText.includes('latest')) {
    sort = { createdAt: -1 };
  } else if (queryText.includes('closing soon') || queryText.includes('ending soon') || queryText.includes('urgently')) {
    sort = { closesAt: 1 };
  } else if (queryText.includes('cheapest') || queryText.includes('lowest price')) {
    sort = { currentPrice: 1 };
  }

  // Search keyword if specific words present
  const stopWords = ['find', 'me', 'a', 'an', 'the', 'show', 'search', 'for', 'under', 'below', 'in', 'good', 'condition', 'items', 'auctions'];
  const keywords = queryText
    .split(/\s+/)
    .filter((w) => !stopWords.includes(w) && w.length > 2 && isNaN(w));

  if (keywords.length > 0 && !filter.category) {
    filter.$or = [
      { title: new RegExp(keywords.join('|'), 'i') },
      { description: new RegExp(keywords.join('|'), 'i') }
    ];
  }

  // Execute database query
  const matchingAuctions = await Auction.find(filter)
    .populate('sellerId', 'name campus')
    .sort(sort)
    .limit(6);

  if (matchingAuctions.length === 0) {
    // If no exact match, return general closing soon listings
    const fallbackAuctions = await Auction.find({ status: 'live' })
      .populate('sellerId', 'name campus')
      .sort({ closesAt: 1 })
      .limit(4);

    return {
      reply: `I couldn't find any active listings strictly matching "${message}". Here are active auctions on campus closing soon:`,
      auctions: fallbackAuctions.map(formatAuctionResult)
    };
  }

  return {
    reply: `Found **${matchingAuctions.length}** campus auction(s) matching your request:`,
    auctions: matchingAuctions.map(formatAuctionResult)
  };
};

const formatAuctionResult = (a) => ({
  id: a._id,
  title: a.title,
  category: a.category,
  condition: a.condition,
  currentPrice: a.currentPrice,
  startingPrice: a.startingPrice,
  bidCount: a.bidCount,
  closesAt: a.closesAt,
  photo: a.photos && a.photos.length > 0 ? a.photos[0] : null,
  seller: a.sellerId?.name || 'Student'
});
