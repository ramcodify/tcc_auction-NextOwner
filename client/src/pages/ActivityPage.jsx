import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import CountdownTimer from '../components/auction/CountdownTimer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ActivityPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buying');
  const [data, setData] = useState({ buyer: null, seller: null });
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity', { credentials: 'include' });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="py-20">
          <LoadingState message="Loading your student activity..." description="Fetching bids and listings" />
        </div>
      </PageContainer>
    );
  }

  const buyer = data.buyer || {};
  const seller = data.seller || {};

  return (
    <PageContainer
      title="My Campus Activity"
      subtitle="Track your active bids, watched lots, outgoing listings, and auction closures in one place."
      actions={
        <div className="flex items-center gap-2">
          <Link to="/watchlist">
            <Button variant="outline" size="sm" icon={Bookmark}>
              Saved & Watchlist
            </Button>
          </Link>
          <Link to="/seller/dashboard">
            <Button variant="secondary" size="sm" icon={Gavel}>
              Seller Dashboard
            </Button>
          </Link>
          <Link to="/sell">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Sell Item
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Dual Mode Switcher */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('buying')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'buying'
                ? 'border-forest text-forest'
                : 'border-transparent text-olive hover:text-ink'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Buying Stream ({ (buyer.activeLeading?.length || 0) + (buyer.outbid?.length || 0) + (buyer.provisionalWins?.length || 0) + (buyer.reserved?.length || 0) })</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('selling')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'selling'
                ? 'border-forest text-forest'
                : 'border-transparent text-olive hover:text-ink'
            }`}
          >
            <Gavel className="w-4 h-4" />
            <span>Selling Stream ({ (seller.live?.length || 0) + (seller.awaitingDecision?.length || 0) + (seller.reserved?.length || 0) })</span>
          </button>
        </div>

        {/* Tab 1: Buying Activity */}
        {activeTab === 'buying' && (
          <div className="space-y-6">
            {/* 1. Provisional Wins (Awaiting Seller Decision) */}
            {buyer.provisionalWins?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-forest" /> Provisional Wins (Awaiting Seller Approval)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {buyer.provisionalWins.map((a) => (
                    <Card key={a._id} variant="stone" padding="md" className="border-forest/40">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="forest" size="sm">Winning Offer</Badge>
                        <span className="font-bold text-ink text-sm">₹{a.currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={`/auction/${a._id}`} className="text-xs font-bold text-ink hover:text-forest line-clamp-2">
                        {a.title}
                      </Link>
                      <p className="text-[11px] text-olive mt-1">Waiting for seller to approve the final clearing price.</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Reserved Items (Handover Pending) */}
            {buyer.reserved?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest" /> Reserved for Handover
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {buyer.reserved.map((a) => (
                    <Card key={a._id} variant="stone" padding="md" className="border-forest">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="forest" size="sm">Price Approved</Badge>
                        <span className="font-bold text-ink text-sm">₹{a.currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <Link to={`/auction/${a._id}`} className="text-xs font-bold text-ink hover:text-forest line-clamp-2">
                        {a.title}
                      </Link>
                      <p className="text-[11px] text-olive mt-1">Meet on campus to inspect item and confirm exchange.</p>
                      <div className="mt-2 pt-2 border-t border-border flex justify-end">
                        <Link to={`/auction/${a._id}`}>
                          <Button variant="primary" size="sm">Confirm Handover</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Active Bids (Leading) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Active Leading Bids ({buyer.activeLeading?.length || 0})
              </h3>
              {buyer.activeLeading?.length === 0 ? (
                <p className="text-xs text-olive">You currently hold no active leading bids.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {buyer.activeLeading.map((a) => (
                    <Card key={a._id} variant="stone" padding="md">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="forest" size="sm">Leading</Badge>
                        <CountdownTimer closesAt={a.closesAt} compact={true} />
                      </div>
                      <Link to={`/auction/${a._id}`} className="text-xs font-bold text-ink hover:text-forest line-clamp-2">
                        {a.title}
                      </Link>
                      <div className="pt-2 mt-2 border-t border-border flex justify-between text-xs">
                        <span className="text-olive">Your lead:</span>
                        <span className="font-bold text-ink">₹{a.currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Outbid Items */}
            {buyer.outbid?.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-[#9E392F] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Outbid Lots ({buyer.outbid.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {buyer.outbid.map((a) => (
                    <Card key={a._id} variant="paper" padding="md" className="border-[#9E392F]/30">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="alert" size="sm">Outbid</Badge>
                        <CountdownTimer closesAt={a.closesAt} compact={true} />
                      </div>
                      <Link to={`/auction/${a._id}`} className="text-xs font-bold text-ink hover:text-forest line-clamp-2">
                        {a.title}
                      </Link>
                      <div className="pt-2 mt-2 border-t border-border flex justify-between items-center text-xs">
                        <span className="font-bold text-ink">Current: ₹{a.currentPrice.toLocaleString('en-IN')}</span>
                        <Link to={`/auction/${a._id}`}>
                          <Button variant="outline" size="sm">Re-bid</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Selling Activity */}
        {activeTab === 'selling' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-xs text-olive">Overview of items you are auctioning</span>
              <Link to="/seller/dashboard">
                <Button variant="outline" size="sm" icon={ExternalLink}>Open Full Seller Dashboard</Button>
              </Link>
            </div>

            {/* Live Listings */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Live Auctions ({seller.live?.length || 0})
              </h3>
              {seller.live?.length === 0 ? (
                <Card variant="stone" padding="lg" className="text-center py-8">
                  <p className="text-xs text-olive">You have no active listings.</p>
                  <Link to="/sell" className="inline-block mt-2">
                    <Button variant="primary" size="sm">Create an Auction</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {seller.live.map((a) => (
                    <Card key={a._id} variant="stone" padding="md">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="forest" size="sm">Live</Badge>
                        <CountdownTimer closesAt={a.closesAt} compact={true} />
                      </div>
                      <Link to={`/auction/${a._id}`} className="text-xs font-bold text-ink hover:text-forest line-clamp-2">
                        {a.title}
                      </Link>
                      <div className="pt-2 mt-2 border-t border-border flex justify-between text-xs">
                        <span className="text-olive">{a.bidCount} bids</span>
                        <span className="font-bold text-ink">₹{a.currentPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ActivityPage;
