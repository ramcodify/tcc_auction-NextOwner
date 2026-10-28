import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, ShieldCheck } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const SellPlaceholderPage = () => {
  return (
    <PageContainer
      title="Sell on NEXTowner"
      subtitle="Single student account workflow: list your items, set reserve prices, and manage bids."
    >
      <Card variant="stone" padding="lg" className="text-center max-w-xl mx-auto py-12">
        <div className="w-12 h-12 rounded bg-forest/10 border border-forest/20 text-forest mx-auto flex items-center justify-center mb-4">
          <PlusCircle className="w-6 h-6" />
        </div>
        <Badge variant="olive" size="sm" className="mb-3">Scheduled for Phase 2 & 3</Badge>
        <h2 className="text-xl font-bold text-ink mb-2">Listing Creation Workflow</h2>
        <p className="text-xs text-olive max-w-md mx-auto leading-relaxed mb-6">
          The seller submission flow connects directly to student accounts and MongoDB schemas in the upcoming phases.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md">
              Return to Foundation Overview
            </Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
};

export default SellPlaceholderPage;
