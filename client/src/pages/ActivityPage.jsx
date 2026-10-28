import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShoppingBag, Gavel, ArrowRight, Clock, PlusCircle } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const ActivityPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buying');

  return (
    <PageContainer
      title="My Campus Activity"
      subtitle="Track your active bids, watched lots, outgoing listings, and auction closures in one place."
      actions={
        <Link to="/sell">
          <Button variant="primary" size="sm" icon={PlusCircle}>
            Create New Listing
          </Button>
        </Link>
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
            <span>My Bids & Purchases (Buyer)</span>
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
            <span>My Listings & Sales (Seller)</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'buying' ? (
          <Card variant="stone" padding="lg" className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-ink">No Active Bids Yet</h3>
            <p className="text-xs text-olive max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
              When you participate in campus auctions, your live bids, winning statuses, and handover coordination tokens will appear here.
            </p>
            <Link to="/explore">
              <Button variant="primary" size="md" icon={ArrowRight}>
                Explore Active Auctions
              </Button>
            </Link>
          </Card>
        ) : (
          <Card variant="stone" padding="lg" className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center mb-3">
              <Gavel className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-ink">No Active Listings Yet</h3>
            <p className="text-xs text-olive max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
              Ready to sell textbook sets, dorm appliances, or electronics? Create your first auction listing to start receiving student bids.
            </p>
            <Link to="/sell">
              <Button variant="primary" size="md" icon={PlusCircle}>
                List an Item for Auction
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default ActivityPage;
