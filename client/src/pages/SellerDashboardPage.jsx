import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  User,
  ArrowRight,
  ShieldCheck,
  Phone
} from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import CountdownTimer from '../components/auction/CountdownTimer.jsx';

export const SellerDashboardPage = () => {
  const [data, setData] = useState({
    live: [],
    awaitingDecision: [],
    reserved: [],
    completed: [],
    unsold: [],
    cancelled: [],
    rejected: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('decision');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSellerData = async () => {
    try {
      const res = await fetch('/api/activity', { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.seller) {
        setData(json.seller);
        // Default to decision tab if any waiting, else live
        if (json.seller.awaitingDecision?.length > 0) setActiveTab('decision');
        else if (json.seller.live?.length > 0) setActiveTab('live');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleDecision = async (auctionId, decision) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ decision })
      });
      if (res.ok) {
        await fetchSellerData();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      alert('Error updating decision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmHandover = async (auctionId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/auctions/${auctionId}/handover-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        await fetchSellerData();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      alert('Error confirming handover');
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'decision', label: 'Awaiting Decision', count: data.awaitingDecision?.length || 0, alert: true },
    { id: 'live', label: 'Active Listings', count: data.live?.length || 0 },
    { id: 'reserved', label: 'Reserved / Handover', count: data.reserved?.length || 0 },
    { id: 'completed', label: 'Completed Sales', count: data.completed?.length || 0 },
    { id: 'unsold', label: 'Unsold', count: data.unsold?.length || 0 }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="py-20">
          <LoadingState message="Loading seller listings..." description="Connecting to student inventory" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Seller Operations Dashboard"
      subtitle="Manage your auction lifecycles, approve winning price bids, and coordinate campus handovers."
      actions={
        <Link to="/sell">
          <Button variant="primary" size="sm" icon={PlusCircle}>
            Create New Listing
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border overflow-x-auto gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-forest text-forest'
                  : 'border-transparent text-olive hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  tab.alert && tab.count > 0
                    ? 'bg-[#9E392F] text-paper'
                    : 'bg-stone text-olive'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab 1: Awaiting Decision */}
        {activeTab === 'decision' && (
          <div className="space-y-4">
            {data.awaitingDecision.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-12">
                <CheckCircle2 className="w-8 h-8 text-forest mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-ink">All Decisions Handled</h3>
                <p className="text-xs text-olive mt-1">No closed auctions currently require approval.</p>
              </Card>
            ) : (
              data.awaitingDecision.map((auction) => (
                <Card key={auction._id} variant="stone" padding="md" className="border-forest/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="forest" size="sm">Action Required</Badge>
                        <span className="text-xs text-olive font-mono">Closed {new Date(auction.closesAt).toLocaleDateString()}</span>
                      </div>
                      <Link to={`/auction/${auction._id}`} className="text-sm font-bold text-ink hover:text-forest">
                        {auction.title}
                      </Link>
                      <div className="text-xs text-olive mt-1">
                        Leading Bid: <strong className="text-ink font-sans">₹{auction.currentPrice.toLocaleString('en-IN')}</strong> by{' '}
                        <strong>{auction.leadingBidderId?.name || 'Provisional Winner'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={actionLoading}
                        onClick={() => handleDecision(auction._id, 'approved')}
                      >
                        Approve Price
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={actionLoading}
                        onClick={() => handleDecision(auction._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Live Listings */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            {data.live.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-12">
                <p className="text-xs text-olive">You have no active listings right now.</p>
                <Link to="/sell" className="inline-block mt-3">
                  <Button variant="primary" size="sm">Create an Auction</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.live.map((a) => (
                  <Card key={a._id} variant="stone" padding="md" className="flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="forest" size="sm">Live</Badge>
                        <CountdownTimer closesAt={a.closesAt} compact={true} />
                      </div>
                      <Link to={`/auction/${a._id}`} className="text-xs font-bold text-ink hover:text-forest line-clamp-2 mb-2">
                        {a.title}
                      </Link>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between items-baseline text-xs">
                      <span className="text-olive">{a.bidCount} bids placed</span>
                      <span className="font-bold text-ink">₹{a.currentPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reserved / Handover */}
        {activeTab === 'reserved' && (
          <div className="space-y-4">
            {data.reserved.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-12">
                <p className="text-xs text-olive">No items currently reserved for handover.</p>
              </Card>
            ) : (
              data.reserved.map((auction) => (
                <Card key={auction._id} variant="stone" padding="md" className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <Badge variant="forest" size="sm" className="mb-1">Reserved for Pickup</Badge>
                      <h3 className="text-sm font-bold text-ink">{auction.title}</h3>
                      <p className="text-xs text-olive mt-0.5">
                        Winning price: <strong>₹{auction.currentPrice.toLocaleString('en-IN')}</strong> • Winner: {auction.leadingBidderId?.name}
                      </p>
                    </div>
                    <Button
                      variant={auction.sellerConfirmed ? 'secondary' : 'primary'}
                      size="sm"
                      isLoading={actionLoading}
                      disabled={auction.sellerConfirmed}
                      onClick={() => handleConfirmHandover(auction._id)}
                    >
                      {auction.sellerConfirmed ? 'Handover Confirmed ✓' : 'Confirm Handover & Complete'}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Completed */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {data.completed.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-12">
                <p className="text-xs text-olive">No completed sales yet.</p>
              </Card>
            ) : (
              data.completed.map((a) => (
                <Card key={a._id} variant="paper" padding="md" className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-ink">{a.title}</h4>
                    <p className="text-olive">Sold at ₹{a.currentPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <Badge variant="forest" size="sm">Completed Sale</Badge>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Unsold */}
        {activeTab === 'unsold' && (
          <div className="space-y-4">
            {data.unsold.length === 0 ? (
              <Card variant="stone" padding="lg" className="text-center py-12">
                <p className="text-xs text-olive">No unsold listings.</p>
              </Card>
            ) : (
              data.unsold.map((a) => (
                <Card key={a._id} variant="stone" padding="md" className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-ink">{a.title}</h4>
                    <p className="text-olive">Closed with 0 bids</p>
                  </div>
                  <Link to={`/sell?relist=${a._id}`}>
                    <Button variant="outline" size="sm">Relist Item</Button>
                  </Link>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default SellerDashboardPage;
