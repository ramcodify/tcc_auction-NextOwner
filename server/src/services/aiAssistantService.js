import Auction from '../models/Auction.js';

/**
 * Intelligent AI Assistant service for NEXTowner campus marketplace.
 * Connects natural language requests directly to real MongoDB auction data.
 * Strictly enforces:
 *  1. Budget constraints (never suggests or bids more than the student's budget)
 *  2. Explicit user consent (never places bids without student approval)
 *  3. Student privacy (never exposes private limits, contact info, or passwords)
 */
export const processAIChat = async ({ message, user = null }) => {
  const queryText = (message || '').toLowerCase().trim();

  // 1. Detect Bidding Request Intent (e.g. "bid on cycle", "suggest a bid", "auto-bid up to 2000", "I want to bid")
  const isBidIntent =
    /(?:bid\s*(?:on|for|up\s*to)?|auto\s*bid|proxy\s*bid|suggest\s*a\s*bid|want\s*to\s*bid|place\s*a\s*bid|help\s*me\s*bid)/i.test(queryText);

  if (isBidIntent) {
    // Extract target item keyword (cycle, calculator, book, chair, etc.)
    let targetKeyword = '';
    if (queryText.includes('cycle') || queryText.includes('bike') || queryText.includes('bicycle')) {
      targetKeyword = 'cycle';
    } else if (queryText.includes('calc') || queryText.includes('calculator')) {
      targetKeyword = 'calculator';
    } else if (queryText.includes('book') || queryText.includes('textbook') || queryText.includes('algo')) {
      targetKeyword = 'book';
    } else if (queryText.includes('chair') || queryText.includes('furniture')) {
      targetKeyword = 'chair';
    } else if (queryText.includes('headphone') || queryText.includes('monitor') || queryText.includes('electronic')) {
      targetKeyword = 'electronic';
    }

    // Extract student's specified budget / limit (e.g. "under 2000", "up to ₹1,800", "budget 1500", "for 1600")
    const budgetMatch = queryText.match(/(?:under|up to|below|max|budget of|for|at)?\s*(?:₹|rs\.?|inr)?\s*([\d,]{2,8})/i);
    const specifiedBudget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : null;

    // Search for matching live auction
    const queryFilter = { status: 'live' };
    if (targetKeyword) {
      queryFilter.$or = [
        { title: new RegExp(targetKeyword, 'i') },
        { category: new RegExp(targetKeyword, 'i') },
        { description: new RegExp(targetKeyword, 'i') }
      ];
    }

    const matchedAuction = await Auction.findOne(queryFilter).sort({ currentPrice: 1, closesAt: 1 });

    if (matchedAuction) {
      // Calculate next valid minimum bid
      const nextMinBid =
        matchedAuction.bidCount === 0
          ? matchedAuction.startingPrice
          : matchedAuction.currentPrice + matchedAuction.minimumIncrement;

      // Determine ceiling limit based on budget
      let authorizedLimit = specifiedBudget || nextMinBid;

      // STRICT RULE 1: Never bid more than the student's budget
      if (specifiedBudget && nextMinBid > specifiedBudget) {
        return {
          reply: `⚠️ **Budget Limit Exceeded:**\nI found **"${matchedAuction.title}"**, but the current price is **₹${matchedAuction.currentPrice.toLocaleString('en-IN')}** and the next valid bid is **₹${nextMinBid.toLocaleString('en-IN')}**.\n\nSince this is higher than your stated budget of **₹${specifiedBudget.toLocaleString('en-IN')}**, I will **not** place any bid. NEXTowner rules strictly prevent bidding beyond your authorized budget.`,
          auctions: [formatAuctionResult(matchedAuction)]
        };
      }

      // If authorizedLimit is below the next minimum bid, adjust to valid next bid within budget
      if (authorizedLimit < nextMinBid) {
        authorizedLimit = nextMinBid;
      }

      // STRICT RULE 2: Always ask for explicit permission before placing any bid
      return {
        reply: `Here is my suggested bid proposal for **"${matchedAuction.title}"**:\n• **Current Price:** ₹${matchedAuction.currentPrice.toLocaleString('en-IN')}\n• **Suggested Next Bid:** ₹${nextMinBid.toLocaleString('en-IN')}\n• **Your Authorized Budget Ceiling:** ₹${authorizedLimit.toLocaleString('en-IN')}\n\n🛡️ **Student Permission Required:**\nAs per NEXTowner policy, I will **never** bid without your explicit consent or exceed your budget. Please review the proposal below and click **Confirm Auto-Bid** to authorize this action.`,
        actionProposal: {
          type: 'CONFIRM_AUTOBID',
          auctionId: matchedAuction._id,
          title: matchedAuction.title,
          maxAmount: authorizedLimit,
          suggestedBid: nextMinBid,
          currentPrice: matchedAuction.currentPrice,
          closesAt: matchedAuction.closesAt
        },
        auctions: [formatAuctionResult(matchedAuction)]
      };
    }
  }

  // 2. Natural Language Search & Filtering (e.g. "Find me a cycle under ₹2,000")
  const filter = { status: 'live' };
  let sort = { closesAt: 1 }; // Default to closing soonest

  // Category detection
  if (queryText.includes('cycle') || queryText.includes('bicycle') || queryText.includes('bike')) {
    filter.category = 'cycle';
  } else if (queryText.includes('calc') || queryText.includes('calculator') || queryText.includes('fx')) {
    filter.category = 'calculator';
  } else if (queryText.includes('book') || queryText.includes('textbook') || queryText.includes('notes') || queryText.includes('study')) {
    filter.category = 'books';
  } else if (queryText.includes('electronic') || queryText.includes('laptop') || queryText.includes('phone') || queryText.includes('headphone') || queryText.includes('charger') || queryText.includes('monitor')) {
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

  // Price budget detection (e.g. "under ₹2,000", "below 1500", "within 2,000", "less than 2000")
  let studentBudget = null;
  const priceMatch = queryText.match(/(?:under|below|less than|max|up to|within|budget of)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
  if (priceMatch) {
    studentBudget = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    filter.currentPrice = { $lte: studentBudget };
  }

  // Sorting detection
  if (queryText.includes('newest') || queryText.includes('recent') || queryText.includes('latest')) {
    sort = { createdAt: -1 };
  } else if (queryText.includes('closing soon') || queryText.includes('ending soon') || queryText.includes('urgently')) {
    sort = { closesAt: 1 };
  } else if (queryText.includes('cheapest') || queryText.includes('lowest price')) {
    sort = { currentPrice: 1 };
  }

  // Search keyword if specific words present and category wasn't explicitly flagged
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
      reply: `I couldn't find any active campus listings strictly matching "${message}" within that criteria.\n\nHere are active campus auctions closing soon that might interest you:`,
      auctions: fallbackAuctions.map(formatAuctionResult)
    };
  }

  // Format budget-conscious reply
  let replyText = `Found **${matchingAuctions.length}** campus auction(s) matching your request`;
  if (studentBudget) {
    replyText += ` within your budget of **₹${studentBudget.toLocaleString('en-IN')}**:`;
  } else {
    replyText += `:`;
  }
  replyText += `\n\n💡 *Tip: If you would like to bid on any of these, ask me "Bid on the ${filter.category || 'item'} within my budget" and I will prepare a proposal for your approval.*`;

  return {
    reply: replyText,
    auctions: matchingAuctions.map(formatAuctionResult)
  };
};

/**
 * Format auction result to ensure student privacy.
 * Strictly excludes private proxy bid maximums, personal phone numbers, or passwords.
 */
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
  seller: a.sellerId?.name ? a.sellerId.name.split(' ')[0] : 'Campus Student' // Privacy: only first name
});

export default processAIChat;
