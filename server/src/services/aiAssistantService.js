import Auction from '../models/Auction.js';
import User from '../models/User.js';

/**
 * Intelligent AI Assistant service for NEXTowner campus marketplace.
 * Connects natural language requests directly to real MongoDB auction data.
 * Strictly enforces:
 *  1. Budget constraints (never suggests or bids more than the student's budget)
 *  2. Explicit user consent (never places bids without student approval)
 *  3. Student privacy (never exposes private limits, contact info, or passwords)
 *  4. Intelligent query understanding (handles FAQs, rules, greetings, and live item search)
 */
export const processAIChat = async ({ message, user = null }) => {
  const rawMessage = (message || '').trim();
  const queryText = rawMessage.toLowerCase();
  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'there';

  // Helper to extract budget numbers (e.g., "under 2000", "under 2k", "₹2,500", "below 1500")
  const parseBudget = (text) => {
    const kMatch = text.match(/(?:under|below|less than|max|up to|within|budget of|for|at)?\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      return Math.round(parseFloat(kMatch[1]) * 1000);
    }
    const numMatch = text.match(/(?:under|below|less than|max|up to|within|budget of|for|at)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
    if (numMatch) {
      const val = parseInt(numMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(val) && val > 0 && val < 500000) {
        return val;
      }
    }
    return null;
  };

  // Check if query contains search keywords or budget
  const hasItemKeywords = /(?:cycle|bike|bicycle|calc|calculator|casio|book|textbook|notes|clrs|chair|table|desk|furniture|laptop|headphone|earphone|monitor|charger|electronics?)/i.test(queryText);
  const hasSearchIntent = /(?:find|search|show|looking\s+for|want\s+to\s+buy|need\s+a|any\s+(?:available|items?)|what\s+(?:cycles?|books?|items?)|browse|cheapest|closing\s+soon)/i.test(queryText);

  // =========================================================================
  // 1. POLITE CLOSURES & ACKNOWLEDGEMENTS
  // =========================================================================
  if (/^(thanks|thank\s*you|thx|ty|great|awesome|perfect|ok|okay|cool|got\s*it|bye|goodbye|see\s*ya)\b/i.test(queryText)) {
    return {
      reply: `You're very welcome, ${studentFirstName}! 😊\n\nFeel free to ask me anytime to search campus items, check your budget, or explain auction rules. Happy bidding!`
    };
  }

  // =========================================================================
  // 2. GREETINGS & CAPABILITIES (Only if not asking to find an item)
  // =========================================================================
  const isGreetingOnly =
    /^(hi|hello|hey|good\s*(?:morning|afternoon|evening)|yo|sup|hola|namaste|start)\b/i.test(queryText) ||
    /^(who\s*are\s*you|what\s*are\s*you|what\s*is\s*this|help|what\s*can\s*you\s*do|what\s*do\s*you\s*do|how\s+can\s+you\s+help)\b/i.test(queryText) ||
    queryText === 'menu';

  if (isGreetingOnly && !hasItemKeywords && !hasSearchIntent) {
    const featuredAuctions = await Auction.find({ status: 'live' })
      .populate('sellerId', 'name campus')
      .sort({ closesAt: 1 })
      .limit(3);

    return {
      reply: `Hello ${studentFirstName}! 👋 Welcome to **NEXTowner**, your campus peer-to-peer auction marketplace.\n\nHere is what I can do for you:\n• **Find Items By Budget:** Ask *"Find me a cycle under ₹2,000"* or *"Calculators under 800"*\n• **Assist With Bidding:** Say *"I want to bid on the cycle"* to prepare a safe proposal\n• **Explain Rules:** Ask *"How does bidding work?"* or *"What is the 30-second anti-sniping rule?"*\n• **Selling & Handover:** Ask *"How do I sell an item?"* or *"How does handover work?"*\n\nHere are active campus listings closing soon:`,
      auctions: featuredAuctions.map(formatAuctionResult)
    };
  }

  // =========================================================================
  // 3. PLATFORM FAQS & MECHANISM EXPLANATIONS
  // =========================================================================

  // A. What is NEXTowner / About the app
  if (/(?:what\s+is\s+nextowner|about\s+nextowner|tell\s+me\s+about\s+nextowner|what\s+is\s+this\s+app|about\s+this\s+platform|how\s+does\s+nextowner\s+work)/i.test(queryText)) {
    return {
      reply: `🎓 **Welcome to NEXTowner:**\n\nNEXTowner is a verified student-to-student auction platform for our campus!\n\n**Core Highlights:**\n• **Single Unified Account:** Buy or sell anytime with one verified student profile.\n• **Fair Market Discovery:** Time-bound auctions ensure fair prices for cycles, textbooks, electronics, and dorm gear.\n• **Anti-Sniping Engine:** Bids placed in the final 30 seconds automatically extend the timer by 60 seconds so bots cannot steal items.\n• **Safe On-Campus Handover:** Meet in person at verified campus locations (Library, Student Center) with direct UPI/cash payment—zero online escrow risk.`
    };
  }

  // B. Anti-sniping / 30-Second Extension (checked before general bidding rules)
  if (/(?:anti[- ]?snip(?:ing)?|30\s*sec(?:ond)?(?:\s*rule)?|timer\s+exten(?:d|sion)|why\s+did\s+(?:the\s+)?(?:auction|time)\s+extend|sniper\s+protection)/i.test(queryText)) {
    return {
      reply: `⚡ **The 30-Second Anti-Sniping Rule:**\n\nOn NEXTowner, if any student places a bid within the **final 30 seconds** of an auction, the deadline is automatically extended by **60 seconds**.\n\n**Why this exists:**\n• **Stops Bot Sniping:** Prevents automated scripts from submitting bids at 00:01.\n• **Fair Play:** Gives genuine student bidders a fair chance to place a counter-offer.\n• **True Value:** Ensures student sellers receive fair campus market value for their items.`
    };
  }

  // C. How does bidding work?
  if (
    /(?:how\s+(?:does\s+)?(?:bidding|to\s+bid|a\s+bid)\s+work|explain\s+bidding|bidding\s+rules|how\s+do\s+bids\s+work|how\s+to\s+place\s+a\s+bid|how\s+do\s+i\s+bid)/i.test(queryText) &&
    !/(?:bid\s+(?:on|for|\d+)|place\s+a\s+bid\s+on|i\s+want\s+to\s+bid)/i.test(queryText)
  ) {
    return {
      reply: `🔨 **How Bidding Works on NEXTowner:**\n\n1. **Starting Price & Increment:** Every listing starts at a reserve price. Each new bid must meet the lot's minimum increment (e.g., +₹20, +₹30, or +₹50).\n2. **Real-time Live Sync:** Bids update instantly across all student screens without refreshing via WebSocket.\n3. **Anti-Sniping Protection:** If a bid is placed in the final 30 seconds, the timer automatically extends by 60 seconds.\n4. **Proxy Auto-Bidding:** You can set a secret budget ceiling. The system bids minimally on your behalf to maintain the lead without exceeding your limit.\n5. **Auction Closure:** When the timer ends, the seller reviews the winning price before coordinating the in-person campus handover.`
    };
  }

  // D. How to sell / create a listing
  if (/(?:how\s+(?:do\s+i|to)\s+(?:sell|list|create\s+listing|post)|selling\s+process|list\s+an\s+item|how\s+to\s+post|how\s+can\s+i\s+sell|sell\s+something)/i.test(queryText)) {
    return {
      reply: `📦 **Selling an Item on NEXTowner:**\n\nListing an item takes less than 2 minutes:\n1. Click **Sell Item** in the top navigation bar.\n2. Choose a category (*cycle, calculator, books, electronics, furniture*).\n3. Upload clear photos (you can preview them full size before publishing).\n4. Set your starting reserve price, minimum increment, and closing deadline.\n5. Once live, campus buyers place bids. When closed, approve the winning offer and arrange an in-person exchange on campus!`
    };
  }

  // E. Handover & Payment / Safety / Meeting spots
  if (/(?:handover|how\s+(?:does\s+)?(?:handover|payment)\s+work|how\s+(?:do\s+i|to)\s+(?:pay|get\s+the\s+item|meet)|payment\s+methods?|where\s+(?:to\s+)?meet|exchange\s+process|upi\s+or\s+cash|is\s+payment\s+online)/i.test(queryText)) {
    return {
      reply: `🤝 **Campus Handover & Payment Policy:**\n\nNEXTowner transactions happen in-person on campus to eliminate online scam risks:\n1. **Price Approval:** After the auction timer ends, the seller reviews and confirms the winning bid.\n2. **Contact Exchange:** Both students receive verified campus contact information.\n3. **Meet on Campus:** Agree on a safe, public campus spot (Library foyer, Student Center, or Cafeteria).\n4. **Inspect & Pay:** The buyer inspects the item in person. Payment is completed directly via UPI or Cash.\n5. **Confirm Handover:** Both students mark the handover as completed on their dashboard.`
    };
  }

  // F. Cancelling a bid
  if (/(?:can\s+i\s+cancel\s+(?:a\s+)?bid|retract\s+bid|cancel\s+my\s+bid|delete\s+bid|made\s+a\s+mistake\s+on\s+bid)/i.test(queryText)) {
    return {
      reply: `⚠️ **Bid Policy:**\n\nTo ensure fairness and prevent market disruption, **submitted bids cannot be retracted or cancelled**.\n\n• If you are outbid by another student, you have no obligation.\n• If you hold the winning bid when the lot closes, the seller reviews and confirms the final price before handover.`
    };
  }

  // G. What is Auto-Bid / Proxy Bidding?
  if (/(?:what\s+is\s+(?:auto[- ]?bid|proxy\s*bid)|how\s+does\s+(?:auto[- ]?bid|proxy)\s+work|explain\s+(?:auto[- ]?bid|proxy))/i.test(queryText)) {
    return {
      reply: `🤖 **Automatic Proxy Bidding Explained:**\n\nAuto-bidding lets you set your secret budget ceiling for an item:\n1. The system automatically places the **minimum valid bid** required to keep you in the lead.\n2. If another student bids, the system places another increment for you—only up to your authorized ceiling.\n3. **Privacy First:** Your secret ceiling is **never** shared with the seller or competing bidders.\n4. You never pay more than necessary to maintain the lead!`
    };
  }

  // H. What happens after winning?
  if (/(?:what\s+happens\s+(?:if|after|when)\s+(?:i\s+win|winning)|i\s+won\s+an\s+auction|after\s+winning)/i.test(queryText)) {
    return {
      reply: `🎉 **What Happens When You Win an Auction:**\n\n1. **Winning Notification:** You will receive a notification and status update on your dashboard.\n2. **Seller Confirmation:** The seller reviews and confirms the final closing price.\n3. **Campus Handover Details:** Once confirmed, both buyer and seller get access to contact details to agree on a public campus meeting location.\n4. **Inspection & Payment:** Inspect the item in person, pay directly via UPI/Cash, and mark the order complete!`
    };
  }

  // I. Disputes / Seller or Buyer didn't show up / Cancellations
  if (/(?:what\s+if\s+(?:the\s+)?(?:seller|buyer)\s+(?:doesn'?t|does\s+not)\s+(?:show|come|pay|respond)|dispute|cancel\s+handover|scam|report|fraud)/i.test(queryText)) {
    return {
      reply: `🛡️ **Buyer & Seller Protection:**\n\n• **Zero Upfront Payment:** You only pay after physically inspecting the item in person on campus.\n• **Verified Student Profiles:** All users are verified campus peers.\n• **No-Show Policy:** If a buyer or seller fails to meet up within the agreed window, either party can cancel the handover or report the issue on their dashboard with no penalty.`
    };
  }

  // J. What if nobody bids?
  if (/(?:what\s+if\s+(?:nobody|no\s+one)\s+bids|no\s+bids|unsold\s+items?)/i.test(queryText)) {
    return {
      reply: `⏳ **Unsold Listings:**\n\nIf an auction closes with zero bids, the listing expires as unsold. The seller can relist it anytime with an adjusted starting price or longer duration from their dashboard.`
    };
  }

  // K. Contacting seller / buyer
  if (/(?:how\s+(?:can\s+i|to)\s+contact\s+(?:the\s+)?(?:seller|buyer)|can\s+i\s+message\s+(?:the\s+)?seller|seller\s+contact)/i.test(queryText)) {
    return {
      reply: `📞 **Contacting Campus Members:**\n\nTo prevent spam and offline manipulation during an active auction, direct contact info (phone/email) is released **after** the auction closes and the winning offer is approved. Both students can then coordinate the campus meetup.`
    };
  }

  // L. Reserve price & Minimum increment
  if (/(?:what\s+is\s+(?:the\s+)?reserve\s+price|starting\s+price|what\s+is\s+(?:the\s+)?minimum\s+increment|bid\s+increment)/i.test(queryText)) {
    return {
      reply: `🏷️ **Reserve Price & Increment:**\n\n• **Starting (Reserve) Price:** The minimum price the seller accepts to start the auction.\n• **Minimum Increment:** The minimum step required for each subsequent bid (e.g., +₹20, +₹30, or +₹50). This prevents penny-bidding wars and keeps bidding fair.`
    };
  }

  // M. Editing or deleting listings
  if (/(?:can\s+i\s+edit\s+(?:my\s+)?(?:listing|auction)|delete\s+(?:my\s+)?(?:listing|auction)|cancel\s+(?:my\s+)?auction)/i.test(queryText)) {
    return {
      reply: `✏️ **Managing Your Listings:**\n\n• **Before Bids:** You can manage your listings from your profile dashboard.\n• **Active Bids Protection:** Once bids are placed, starting price and core details cannot be altered to protect the integrity of existing bids.`
    };
  }

  // N. Student Eligibility & Verification
  if (/(?:who\s+can\s+(?:join|use|sign\s*up)|student\s+verification|do\s+i\s+need\s+a\s+student\s+id|college\s+email|how\s+to\s+register)/i.test(queryText)) {
    return {
      reply: `🎓 **Campus Eligibility:**\n\nNEXTowner is built exclusively for verified students and campus community members.\n• When registering, use your student email and campus ID.\n• This keeps our marketplace safe, trusted, and free from external commercial scalpers.`
    };
  }

  // O. Privacy & Data Protection
  if (/(?:is\s+my\s+(?:account|data|bid|info)\s+private|privacy|security|is\s+it\s+safe)/i.test(queryText)) {
    return {
      reply: `🔒 **Student Privacy & Safety:**\n\n• **Protected Ceilings:** Your auto-bid ceiling is strictly confidential and never displayed to sellers or rivals.\n• **Private Contact Details:** Personal contact information is only revealed between confirmed buyer and seller after auction closure.\n• **Campus Only:** No public strangers—all participants are authenticated students.`
    };
  }


  // =========================================================================
  // 4. ACTION INTENT: PREPARING A BID PROPOSAL (Explicit Consent Required)
  // =========================================================================
  const isBidAction =
    /(?:i\s+want\s+to\s+bid|place\s+(?:a\s+)?bid|bid\s+(?:on|for|up\s*to|\d+)|suggest\s+a\s+bid|help\s+me\s+bid|auto[- ]?bid\s+on)/i.test(queryText) &&
    !/(?:how\s+(?:does|to)|explain|what\s+is|can\s+i\s+cancel)/i.test(queryText);

  if (isBidAction) {
    // Extract target item keyword
    let targetKeyword = '';
    if (queryText.includes('cycle') || queryText.includes('bike') || queryText.includes('bicycle')) {
      targetKeyword = 'cycle';
    } else if (queryText.includes('calc') || queryText.includes('calculator') || queryText.includes('casio') || queryText.includes('fx')) {
      targetKeyword = 'calculator';
    } else if (queryText.includes('book') || queryText.includes('textbook') || queryText.includes('algo') || queryText.includes('notes') || queryText.includes('clrs')) {
      targetKeyword = 'book';
    } else if (queryText.includes('chair') || queryText.includes('furniture') || queryText.includes('table') || queryText.includes('desk')) {
      targetKeyword = 'chair';
    } else if (queryText.includes('headphone') || queryText.includes('monitor') || queryText.includes('electronic') || queryText.includes('laptop')) {
      targetKeyword = 'electronic';
    }

    // Extract student's specified budget / limit (e.g. "under 2000", "up to ₹1,800", "for 1600", "2k")
    const specifiedBudget = parseBudget(queryText);

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

      let authorizedLimit = specifiedBudget || nextMinBid;

      // STRICT RULE 1: Never bid more than the student's budget
      if (specifiedBudget && nextMinBid > specifiedBudget) {
        return {
          reply: `⚠️ **Budget Limit Exceeded:**\nI found **"${matchedAuction.title}"**, but the current price is **₹${matchedAuction.currentPrice.toLocaleString('en-IN')}** and the next valid bid is **₹${nextMinBid.toLocaleString('en-IN')}**.\n\nSince this exceeds your stated budget of **₹${specifiedBudget.toLocaleString('en-IN')}**, I will **not** suggest or place any bid. NEXTowner rules strictly prevent bidding beyond your authorized budget.`,
          auctions: [formatAuctionResult(matchedAuction)]
        };
      }

      if (authorizedLimit < nextMinBid) {
        authorizedLimit = nextMinBid;
      }

      // STRICT RULE 2: Always ask for explicit permission before placing any bid
      return {
        reply: `Here is my suggested bid proposal for **"${matchedAuction.title}"**:\n• **Current Price:** ₹${matchedAuction.currentPrice.toLocaleString('en-IN')}\n• **Suggested Next Bid:** ₹${nextMinBid.toLocaleString('en-IN')}\n• **Authorized Budget Ceiling:** ₹${authorizedLimit.toLocaleString('en-IN')}\n\n🛡️ **Student Permission Required:**\nAs per NEXTowner policy, I will **never** bid without your explicit consent or exceed your budget. Review the proposal below and click **Confirm Auto-Bid** to authorize this action.`,
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

  // =========================================================================
  // 5. NATURAL LANGUAGE AUCTION SEARCH & FILTERING
  // =========================================================================
  const filter = { status: 'live' };
  let sort = { closesAt: 1 }; // Default to closing soonest

  // Category detection
  let detectedCategory = null;
  if (queryText.includes('cycle') || queryText.includes('bicycle') || queryText.includes('bike')) {
    filter.category = 'cycle';
    detectedCategory = 'cycle';
  } else if (queryText.includes('calc') || queryText.includes('calculator') || queryText.includes('casio') || queryText.includes('fx')) {
    filter.category = 'calculator';
    detectedCategory = 'calculator';
  } else if (queryText.includes('book') || queryText.includes('textbook') || queryText.includes('notes') || queryText.includes('study') || queryText.includes('clrs')) {
    filter.category = 'books';
    detectedCategory = 'books';
  } else if (queryText.includes('electronic') || queryText.includes('laptop') || queryText.includes('phone') || queryText.includes('headphone') || queryText.includes('earphone') || queryText.includes('charger') || queryText.includes('monitor')) {
    filter.category = 'electronics';
    detectedCategory = 'electronics';
  } else if (queryText.includes('furniture') || queryText.includes('chair') || queryText.includes('table') || queryText.includes('desk') || queryText.includes('bed')) {
    filter.category = 'furniture';
    detectedCategory = 'furniture';
  }

  // Condition detection
  if (queryText.includes('like new') || queryText.includes('mint')) {
    filter.condition = { $in: ['new', 'like_new'] };
  } else if (queryText.includes('good condition') || queryText.includes('decent')) {
    filter.condition = { $in: ['new', 'like_new', 'good'] };
  }

  // Price budget detection (e.g. "under ₹2,000", "below 1500", "under 2k", "less than 2000")
  const studentBudget = parseBudget(queryText);
  if (studentBudget) {
    filter.currentPrice = { $lte: studentBudget };
  }

  // Sorting detection
  if (queryText.includes('newest') || queryText.includes('recent') || queryText.includes('latest')) {
    sort = { createdAt: -1 };
  } else if (queryText.includes('closing soon') || queryText.includes('ending soon') || queryText.includes('urgent')) {
    sort = { closesAt: 1 };
  } else if (queryText.includes('cheapest') || queryText.includes('lowest price')) {
    sort = { currentPrice: 1 };
  }

  // Search keyword extraction (filtering out common filler words)
  const stopWords = [
    'find', 'me', 'a', 'an', 'the', 'show', 'search', 'for', 'under', 'below',
    'in', 'good', 'condition', 'items', 'auctions', 'what', 'is', 'available',
    'any', 'some', 'please', 'can', 'you', 'i', 'need', 'want', 'to', 'buy',
    'browse', 'all', 'everything', 'give', 'list', 'there', 'have', 'looking',
    'which', 'tell', 'are', 'price', 'cost', 'rate', 'budget'
  ];

  const keywords = queryText
    .split(/\s+/)
    .filter((w) => !stopWords.includes(w) && w.length > 2 && isNaN(w));

  // If specific non-category keywords exist (e.g. "dell", "sony", "casio", "clrs"), filter by them
  if (keywords.length > 0 && !filter.category) {
    filter.$or = [
      { title: new RegExp(keywords.join('|'), 'i') },
      { description: new RegExp(keywords.join('|'), 'i') }
    ];
  }

  // Execute database query with budget filter
  const matchingAuctions = await Auction.find(filter)
    .populate('sellerId', 'name campus')
    .sort(sort)
    .limit(6);

  if (matchingAuctions.length === 0) {
    // If no match under budget, check if there are listings in that category above budget
    if (detectedCategory && studentBudget) {
      const categoryAuctions = await Auction.find({ status: 'live', category: detectedCategory })
        .populate('sellerId', 'name campus')
        .sort({ currentPrice: 1 })
        .limit(3);

      if (categoryAuctions.length > 0) {
        const lowestPrice = categoryAuctions[0].currentPrice;
        return {
          reply: `Active ${detectedCategory} listings currently start at **₹${lowestPrice.toLocaleString('en-IN')}**, which is slightly above your budget of **₹${studentBudget.toLocaleString('en-IN')}**.\n\nHere are available options on campus in case you want to check them out:`,
          auctions: categoryAuctions.map(formatAuctionResult)
        };
      }
    }

    // General fallback: return closing soon listings
    const fallbackAuctions = await Auction.find({ status: 'live' })
      .populate('sellerId', 'name campus')
      .sort({ closesAt: 1 })
      .limit(4);

    return {
      reply: `I couldn't find any active campus auctions matching **"${rawMessage}"**${studentBudget ? ` within ₹${studentBudget.toLocaleString('en-IN')}` : ''}.\n\nHere are popular campus lots closing soon that you can bid on right now:`,
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
  replyText += `\n\n💡 *Tip: If you'd like to bid on any of these, ask me "Bid on the ${filter.category || 'item'}" and I will prepare a proposal for your approval.*`;

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
