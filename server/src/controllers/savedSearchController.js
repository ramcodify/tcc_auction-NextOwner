import SavedSearch from '../models/SavedSearch.js';

export const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: searches });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createSavedSearch = async (req, res) => {
  try {
    const { keyword, category, condition, maxPrice } = req.body;

    const saved = await SavedSearch.create({
      userId: req.user._id,
      keyword: keyword?.trim() || '',
      category: category || 'all',
      condition: condition || 'all',
      maxPrice: maxPrice ? Math.floor(Number(maxPrice)) : null
    });

    return res.status(201).json({
      status: 'success',
      message: 'Search alert saved. You will be notified when matching items are published.',
      data: saved
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteSavedSearch = async (req, res) => {
  try {
    await SavedSearch.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    return res.status(200).json({ status: 'success', message: 'Saved search alert removed.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
