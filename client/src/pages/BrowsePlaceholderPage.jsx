import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Clock, ArrowRight } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const BrowsePlaceholderPage = () => {
  return (
    <PageContainer
      title="Browse Auctions"
      subtitle="The marketplace catalog where students discover textbooks, electronics, dorm essentials, and campus gear."
    >
      <Card variant="stone" padding="lg" className="text-center max-w-xl mx-auto py-12">
        <div className="w-12 h-12 rounded bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center mb-4">
          <Gavel className="w-6 h-6" />
        </div>
        <Badge variant="forest" size="sm" className="mb-3">Scheduled for Phase 3</Badge>
        <h2 className="text-xl font-bold text-ink mb-2">Auction Listings & Catalog</h2>
        <p className="text-xs text-olive max-w-md mx-auto leading-relaxed mb-6">
          Per development roadmap, auction listing creation, categories, search filtering, and live countdowns will be fully implemented in Phase 3.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md">
              Return to Foundation Overview
            </Button>
          </Link>
          <Link to="/foundation">
            <Button variant="outline" size="md">
              View Design Components
            </Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
};

export default BrowsePlaceholderPage;
