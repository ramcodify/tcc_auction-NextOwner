import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Bike,
  Calculator,
  BookOpen,
  Laptop,
  Armchair,
  Layers,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import AuctionCard from '../components/auction/AuctionCard.jsx';
import SearchAutocomplete from '../components/common/SearchAutocomplete.jsx';

export const HomePage = () => {
  const [data, setData] = useState({
    liveAuctions: [],
    closingSoon: [],
    recentlyPublished: [],
    categoriesCount: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auctions/home');
      if (!res.ok) throw new Error('Failed to fetch marketplace data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Error connecting to auction database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const categories = [
    { id: 'cycle', label: 'Bicycles & Cycles', icon: Bike },
    { id: 'calculator', label: 'Calculators', icon: Calculator },
    { id: 'books', label: 'Textbooks & Notes', icon: BookOpen },
    { id: 'electronics', label: 'Electronics & Gear', icon: Laptop },
    { id: 'furniture', label: 'Dorm Furniture', icon: Armchair },
    { id: 'other', label: 'All Categories', icon: Layers }
  ];

  return (
    <PageContainer>
      {/* Marketplace Search & Hero Banner */}
      <section className="py-6 sm:py-10 border-b border-border">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <Badge variant="forest" size="sm">Campus Verified Marketplace</Badge>
            <span className="text-xs text-olive">Zero Middlemen • Safe Student Pickup</span>
          </div>

          <h1 className="editorial-heading text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15] mb-4">
            Buy, bid, and sell pre-owned gear across your campus.
          </h1>

          <p className="text-xs sm:text-sm text-olive leading-relaxed max-w-xl mb-6">
            Time-bound student auctions with transparent bidding, automatic proxy bids, last-minute extensions, and coordinated campus handovers.
          </p>

          {/* Search Form + Sell Action */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
            <div className="flex-1">
              <SearchAutocomplete
                placeholder="Search cycles, fx-991EX, algorithm textbooks, monitors..."
                value={searchQuery}
                onChange={(val) => setSearchQuery(val)}
                onSubmit={(val) => {
                  if (val.trim()) {
                    navigate(`/explore?q=${encodeURIComponent(val.trim())}`);
                  } else {
                    navigate('/explore');
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                Search
              </Button>
              <Link to="/sell" className="w-full sm:w-auto">
                <Button variant="primary" icon={PlusCircle} className="w-full">
                  Sell an Item
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="py-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Browse by Category</h2>
          <Link to="/explore" className="text-xs text-forest font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = data.categoriesCount[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                to={cat.id === 'other' ? '/explore' : `/explore?category=${cat.id}`}
                className="p-3 rounded border border-border bg-stone hover:bg-stone-hover transition-colors flex flex-col justify-between h-24 group"
              >
                <div className="w-7 h-7 rounded bg-forest/10 border border-forest/20 text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-paper transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-ink leading-tight truncate">{cat.label}</h3>
                  <span className="text-[10px] text-olive font-mono">{count} live</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Content Loading / Error / Data */}
      {loading ? (
        <div className="py-16">
          <LoadingState message="Loading campus marketplace..." description="Connecting to MongoDB live catalog" />
        </div>
      ) : error ? (
        <div className="py-12 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-[#9E392F] mx-auto" />
          <h3 className="text-base font-semibold text-ink">Unable to Load Auctions</h3>
          <p className="text-xs text-olive leading-relaxed">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchHomeData}>
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="space-y-12 py-8">
          {/* Section 1: Closing Soon Auctions */}
          {data.closingSoon.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9E392F] animate-pulse" />
                  <h2 className="text-base font-bold text-ink">Closing Soon</h2>
                  <span className="text-xs text-olive hidden sm:inline">— Last chance to place bids</span>
                </div>
                <Link to="/explore?closingSoon=true" className="text-xs text-forest font-semibold hover:underline">
                  See all closing soon
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.closingSoon.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Live Featured Auctions */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-ink">Active Campus Auctions</h2>
                <p className="text-xs text-olive mt-0.5">Most competitive current bidding lots</p>
              </div>
              <Link to="/explore" className="text-xs text-forest font-semibold hover:underline">
                Explore catalog
              </Link>
            </div>

            {data.liveAuctions.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-10">
                <p className="text-xs text-olive">No live auctions currently listed. Be the first to sell!</p>
                <Link to="/sell" className="inline-block mt-3">
                  <Button variant="primary" size="sm">Create First Listing</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.liveAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Recently Published */}
          {data.recentlyPublished.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <div>
                  <h2 className="text-base font-bold text-ink">Recently Published Items</h2>
                  <p className="text-xs text-olive mt-0.5">Fresh listings from student sellers</p>
                </div>
                <Link to="/explore?sort=newest" className="text-xs text-forest font-semibold hover:underline">
                  View latest
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.recentlyPublished.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Trust & Policy Assurance Footer Banner */}
      <section className="mt-8 pt-8 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-olive">
          <div className="p-4 rounded border border-border bg-stone/40">
            <h4 className="font-semibold text-ink mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest" />
              Verified Student Profiles
            </h4>
            <p className="text-[11px] leading-relaxed">
              Every bidder and seller holds a verified campus account. No anonymous bots or external third parties.
            </p>
          </div>
          <div className="p-4 rounded border border-border bg-stone/40">
            <h4 className="font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-forest" />
              30-Second Anti-Sniping Protection
            </h4>
            <p className="text-[11px] leading-relaxed">
              Bids in the final 30 seconds automatically extend the auction by 60 seconds, ensuring fair clearance.
            </p>
          </div>
          <div className="p-4 rounded border border-border bg-stone/40">
            <h4 className="font-semibold text-ink mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-forest" />
              Two-Party Handover Confirmation
            </h4>
            <p className="text-[11px] leading-relaxed">
              Items are inspected in person on campus before both parties confirm completion of the sale.
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default HomePage;
