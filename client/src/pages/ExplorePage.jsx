import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookmarkPlus,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Dialog from '../components/common/Dialog.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import AuctionCard from '../components/auction/AuctionCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Filters state initialized from URL parameters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [closingSoon, setClosingSoon] = useState(searchParams.get('closingSoon') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'closing_soon');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Response data
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile filters drawer
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Save search alert dialog
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (category && category !== 'all') params.set('category', category);
      if (condition && condition !== 'all') params.set('condition', condition);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (closingSoon) params.set('closingSoon', 'true');
      if (sort) params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/auctions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load marketplace results');
      const data = await res.json();
      setAuctions(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 1 });
    } catch (err) {
      setError(err.message || 'Error fetching auctions.');
    } finally {
      setLoading(false);
    }
  };

  // Sync state with URL changes
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const catParam = searchParams.get('category') || 'all';
    const condParam = searchParams.get('condition') || 'all';
    const minP = searchParams.get('minPrice') || '';
    const maxP = searchParams.get('maxPrice') || '';
    const cs = searchParams.get('closingSoon') === 'true';
    const s = searchParams.get('sort') || 'closing_soon';
    const p = parseInt(searchParams.get('page') || '1', 10);

    setQuery(qParam);
    setCategory(catParam);
    setCondition(condParam);
    setMinPrice(minP);
    setMaxPrice(maxP);
    setClosingSoon(cs);
    setSort(s);
    setPage(p);
  }, [searchParams]);

  useEffect(() => {
    fetchAuctions();
  }, [query, category, condition, minPrice, maxPrice, closingSoon, sort, page]);

  const applyFilters = () => {
    const newParams = new URLSearchParams();
    if (query.trim()) newParams.set('q', query.trim());
    if (category && category !== 'all') newParams.set('category', category);
    if (condition && condition !== 'all') newParams.set('condition', condition);
    if (minPrice) newParams.set('minPrice', minPrice);
    if (maxPrice) newParams.set('maxPrice', maxPrice);
    if (closingSoon) newParams.set('closingSoon', 'true');
    if (sort) newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
    setFilterDrawerOpen(false);
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setCondition('all');
    setMinPrice('');
    setMaxPrice('');
    setClosingSoon(false);
    setSort('closing_soon');
    setSearchParams({});
    setFilterDrawerOpen(false);
  };

  const handleSaveSearch = async () => {
    if (!user) {
      alert('Please log in to save search alerts.');
      return;
    }

    setSaveLoading(true);
    setSaveSuccess('');
    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          keyword: query,
          category,
          condition,
          maxPrice: maxPrice ? Number(maxPrice) : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveSuccess('Search alert saved! You will receive notifications when matching items are posted.');
        setTimeout(() => {
          setSaveModalOpen(false);
          setSaveSuccess('');
        }, 2500);
      } else {
        alert(data.message || 'Failed to save search.');
      }
    } catch (err) {
      alert('Error saving search alert.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <PageContainer
      title="Explore Campus Auctions"
      subtitle="Discover live peer-to-peer listings filtered by course, category, condition, and price."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={BookmarkPlus}
            onClick={() => setSaveModalOpen(true)}
          >
            Save This Search
          </Button>
          <Link to="/sell">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Sell an Item
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by keyword, author, model..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              icon={Search}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* Mobile Filter Toggle */}
            <Button
              variant="secondary"
              size="sm"
              icon={Filter}
              className="lg:hidden"
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-olive hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  const p = new URLSearchParams(searchParams);
                  p.set('sort', e.target.value);
                  p.set('page', '1');
                  setSearchParams(p);
                }}
                className="bg-paper border border-border text-ink text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer"
              >
                <option value="closing_soon">Closing Soonest</option>
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="most_bids">Most Active Bids</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar + Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Panel (Col 1) */}
          <aside className="hidden lg:block space-y-6">
            <Card variant="stone" padding="md" className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-forest" /> Filter Listings
                </h3>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-olive hover:text-ink font-medium"
                >
                  Reset All
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-paper border border-border text-xs text-ink rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  <option value="all">All Categories</option>
                  <option value="cycle">Bicycles & Cycles</option>
                  <option value="calculator">Scientific Calculators</option>
                  <option value="books">Textbooks & Study Notes</option>
                  <option value="electronics">Electronics & Tech</option>
                  <option value="furniture">Dorm Furniture</option>
                  <option value="other">Other Campus Items</option>
                </select>
              </div>

              {/* Condition Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-paper border border-border text-xs text-ink rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest"
                >
                  <option value="all">Any Condition</option>
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Needs Repair</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-paper border border-border text-xs text-ink rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-paper border border-border text-xs text-ink rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Checkbox: Closing soon */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-ink pt-1">
                <input
                  type="checkbox"
                  checked={closingSoon}
                  onChange={(e) => setClosingSoon(e.target.checked)}
                  className="rounded border-border text-forest focus:ring-forest"
                />
                <span>Closing within 24 hours</span>
              </label>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </Card>

            {/* Offline Alert promo card */}
            <Card variant="paper" padding="md">
              <h4 className="text-xs font-semibold text-ink mb-1">Looking for a specific item?</h4>
              <p className="text-[11px] text-olive leading-relaxed mb-3">
                Save your keywords and budget limit. We will alert you immediately when a student publishes a match.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSaveModalOpen(true)}
              >
                Set Search Alert
              </Button>
            </Card>
          </aside>

          {/* Listings Grid (Cols 2-4) */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="py-20">
                <LoadingState message="Searching campus inventory..." description="Applying database filters" />
              </div>
            ) : error ? (
              <div className="py-16 text-center max-w-sm mx-auto space-y-3">
                <AlertCircle className="w-8 h-8 text-[#9E392F] mx-auto" />
                <h3 className="text-base font-semibold text-ink">Search Error</h3>
                <p className="text-xs text-olive leading-relaxed">{error}</p>
                <Button variant="primary" size="sm" onClick={fetchAuctions}>
                  Retry Search
                </Button>
              </div>
            ) : auctions.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-16">
                <p className="text-sm font-semibold text-ink mb-1">No Matching Auctions Found</p>
                <p className="text-xs text-olive max-w-md mx-auto mb-6 leading-relaxed">
                  No published listings currently match your filter criteria. Try adjusting the price range or resetting category filters.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset All Filters
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setSaveModalOpen(true)}>
                    Save Search Alert
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-olive">
                  <span>
                    Showing <strong>{auctions.length}</strong> of <strong>{pagination.total}</strong> active items
                  </span>
                  {category !== 'all' && (
                    <Badge variant="stone" size="sm" className="capitalize">
                      {category}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {auctions.map((auction) => (
                    <AuctionCard key={auction._id} auction={auction} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="pt-6 border-t border-border flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        const newPage = page - 1;
                        setPage(newPage);
                        const p = new URLSearchParams(searchParams);
                        p.set('page', String(newPage));
                        setSearchParams(p);
                      }}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-olive">
                      Page <strong>{page}</strong> of <strong>{pagination.pages}</strong>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.pages}
                      onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        const p = new URLSearchParams(searchParams);
                        p.set('page', String(newPage));
                        setSearchParams(p);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <Dialog
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filter Listings"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-olive hover:text-ink font-medium"
            >
              Reset All
            </button>
            <Button variant="primary" size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-ink block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-paper border border-border text-ink rounded p-2"
            >
              <option value="all">All Categories</option>
              <option value="cycle">Bicycles & Cycles</option>
              <option value="calculator">Scientific Calculators</option>
              <option value="books">Textbooks & Study Notes</option>
              <option value="electronics">Electronics & Tech</option>
              <option value="furniture">Dorm Furniture</option>
              <option value="other">Other Campus Items</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-ink block mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-paper border border-border text-ink rounded p-2"
            >
              <option value="all">Any Condition</option>
              <option value="new">Brand New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-ink block mb-1">Price Range (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-paper border border-border rounded p-2"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-paper border border-border rounded p-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={closingSoon}
              onChange={(e) => setClosingSoon(e.target.checked)}
              className="rounded border-border text-forest"
            />
            <span>Closing within 24 hours</span>
          </label>
        </div>
      </Dialog>

      {/* Save Search Modal */}
      <Dialog
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Search Alert"
        description="Receive in-app alerts whenever new campus listings match these parameters."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={saveLoading} onClick={handleSaveSearch}>
              Save Alert
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          {saveSuccess ? (
            <div className="p-3 rounded border border-forest/30 bg-forest/10 text-forest flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded bg-stone border border-border space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-olive">Keywords:</span>
                  <span className="font-semibold text-ink">{query || '(Any keyword)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Category:</span>
                  <span className="font-semibold text-ink capitalize">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-olive">Max Price:</span>
                  <span className="font-semibold text-ink">{maxPrice ? `₹${maxPrice}` : 'No limit'}</span>
                </div>
              </div>
              <p className="text-olive leading-relaxed">
                Saved searches run automatically in the background even when you are offline.
              </p>
            </>
          )}
        </div>
      </Dialog>
    </PageContainer>
  );
};

export default ExplorePage;
