import SavedSearch from '../models/SavedSearch.js';
import { createNotification } from './notificationService.js';

/**
 * Match a newly published auction against offline student saved searches.
 */
export const matchNewAuctionAgainstSavedSearches = async (auction) => {
  try {
    const savedSearches = await SavedSearch.find({
      userId: { $ne: auction.sellerId }
    });

    const notifiedUserIds = new Set();

    for (const saved of savedSearches) {
      if (notifiedUserIds.has(saved.userId.toString())) continue;

      // Category check
      if (saved.category && saved.category !== 'all' && saved.category !== auction.category) {
        continue;
      }

      // Condition check
      if (saved.condition && saved.condition !== 'all' && saved.condition !== auction.condition) {
        continue;
      }

      // Max price check
      if (saved.maxPrice && auction.startingPrice > saved.maxPrice) {
        continue;
      }

      // Keyword check
      if (saved.keyword && saved.keyword.trim() !== '') {
        const kw = saved.keyword.toLowerCase().trim();
        const inTitle = auction.title.toLowerCase().includes(kw);
        const inDesc = auction.description.toLowerCase().includes(kw);
        if (!inTitle && !inDesc) {
          continue;
        }
      }

      // Matched!
      notifiedUserIds.add(saved.userId.toString());

      await createNotification({
        userId: saved.userId,
        title: 'New Matching Listing!',
        message: `A new listing matching your saved alert was posted: "${auction.title}" (Starting at ₹${auction.startingPrice.toLocaleString('en-IN')}).`,
        type: 'saved_search_match',
        relatedAuctionId: auction._id,
        link: `/auction/${auction._id}`
      });
    }
  } catch (error) {
    console.error('[SavedSearchMatcher Error]', error.message);
  }
};
