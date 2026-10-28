import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Bell,
  Trash2,
  ExternalLink,
  PlusCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Dialog from '../components/common/Dialog.jsx';
import AuctionCard from '../components/auction/AuctionCard.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';

export const WatchlistSavedSearchesPage = () => {
  const [activeTab, setActiveTab] = useState('watchlist');
  const [watchlist, setWatchlist] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  // New saved search modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('all');
  const [newMaxPrice, setNewMaxPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [watchRes, searchRes] = await Promise.all([
        fetch('/api/watchlist', { credentials: 'include' }),
        fetch('/api/saved-searches', { credentials: 'include' })
      ]);
      const [watchJson, searchJson] = await Promise.all([
        watchRes.json(),
        searchRes.json()
      ]);

      if (watchRes.ok) setWatchlist(watchJson.data || []);
      if (searchRes.ok) setSavedSearches(searchJson.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveWatch = async (auctionId) => {
    try {
      const res = await fetch(`/api/watchlist/${auctionId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        setWatchlist((prev) => prev.filter((a) => a._id !== auctionId));
      }
    } catch (err) {
      alert('Error updating watchlist');
    }
  };

  const handleDeleteSearch = async (searchId) => {
    try {
      const res = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setSavedSearches((prev) => prev.filter((s) => s._id !== searchId));
      }
    } catch (err) {
      alert('Error deleting search alert');
    }
  };

  const handleCreateSearch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          keyword: newKeyword,
          category: newCategory,
          maxPrice: newMaxPrice ? Number(newMaxPrice) : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSavedSearches([data.data, ...savedSearches]);
        setModalOpen(false);
        setNewKeyword('');
        setNewMaxPrice('');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating search alert');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="py-20">
          <LoadingState message="Loading your watched items and alerts..." description="Fetching from MongoDB" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Watchlist & Saved Searches"
      subtitle="Track live auction countdowns and configure offline keyword alerts for campus items."
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setModalOpen(true)}
        >
          New Search Alert
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Tab Buttons */}
        <div className="flex border-b border-border gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`pb-3 px-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'watchlist'
                ? 'border-forest text-forest'
                : 'border-transparent text-olive hover:text-ink'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Watched Auctions ({watchlist.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved_searches')}
            className={`pb-3 px-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'saved_searches'
                ? 'border-forest text-forest'
                : 'border-transparent text-olive hover:text-ink'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Saved Search Alerts ({savedSearches.length})</span>
          </button>
        </div>

        {/* Tab 1: Watched Auctions */}
        {activeTab === 'watchlist' && (
          <div>
            {watchlist.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-16">
                <Bookmark className="w-8 h-8 text-forest mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-semibold text-ink">Your Watchlist is Empty</h3>
                <p className="text-xs text-olive max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
                  Click the bookmark icon on any auction card to follow countdowns, price changes, and new bids.
                </p>
                <Link to="/explore">
                  <Button variant="primary" size="sm">Explore Catalog</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {watchlist.map((auction) => (
                  <AuctionCard
                    key={auction._id}
                    auction={auction}
                    isInitiallyWatched={true}
                    onWatchToggle={handleRemoveWatch}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Searches */}
        {activeTab === 'saved_searches' && (
          <div className="space-y-4">
            {savedSearches.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-16">
                <Bell className="w-8 h-8 text-forest mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-semibold text-ink">No Saved Search Alerts</h3>
                <p className="text-xs text-olive max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
                  Never miss textbooks, scientific calculators, or cycle deals. Configure an alert and we will notify you when students list matching items.
                </p>
                <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                  Create Alert Now
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSearches.map((search) => (
                  <Card key={search._id} variant="stone" padding="md" className="flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="forest" size="sm" className="capitalize">
                          {search.category || 'All Categories'}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => handleDeleteSearch(search._id)}
                          className="text-olive hover:text-[#9E392F] p-1"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-ink">
                        {search.keyword ? `"${search.keyword}"` : 'Any matching items'}
                      </h4>

                      <p className="text-xs text-olive mt-1">
                        Budget Limit: <strong>{search.maxPrice ? `Up to ₹${search.maxPrice}` : 'No limit'}</strong>
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border flex justify-between items-center text-xs">
                      <span className="text-[11px] text-olive font-mono">
                        Saved {new Date(search.createdAt).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/explore?q=${encodeURIComponent(search.keyword || '')}&category=${search.category || 'all'}&maxPrice=${search.maxPrice || ''}`}
                        className="text-forest font-semibold hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Run Search <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Search Modal */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Search Alert"
        description="We'll notify you whenever a student publishes a listing matching this criteria."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={submitting} onClick={handleCreateSearch}>
              Save Alert
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSearch} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-ink block mb-1">Keywords</label>
            <input
              type="text"
              placeholder="e.g. fx-991EX, mountain cycle, algorithms..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="w-full bg-paper border border-border rounded px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-ink block mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full bg-paper border border-border rounded px-3 py-2 text-xs"
            >
              <option value="all">All Categories</option>
              <option value="cycle">Bicycles & Cycles</option>
              <option value="calculator">Scientific Calculators</option>
              <option value="books">Textbooks & Notes</option>
              <option value="electronics">Electronics & Tech</option>
              <option value="furniture">Dorm Furniture</option>
              <option value="other">Other Campus Gear</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-ink block mb-1">Maximum Price Limit (₹, Optional)</label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={newMaxPrice}
              onChange={(e) => setNewMaxPrice(e.target.value)}
              className="w-full bg-paper border border-border rounded px-3 py-2 text-xs"
            />
          </div>
        </form>
      </Dialog>
    </PageContainer>
  );
};

export default WatchlistSavedSearchesPage;
