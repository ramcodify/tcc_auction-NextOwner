import React from 'react';
import { Bot, Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const AssistantPage = () => {
  return (
    <PageContainer
      title="AI Campus Assistant"
      subtitle="Intelligent campus market guide to estimate item pricing, draft listing descriptions, and locate course materials."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card variant="stone" padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-forest text-paper flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="forest" size="sm">Phase 11 Feature</Badge>
                <span className="text-xs text-olive">Architecture Ready</span>
              </div>
              <h3 className="text-base font-semibold text-ink">
                NEXTowner Intelligent Valuation & Search
              </h3>
              <p className="text-xs text-olive mt-1 leading-relaxed">
                The AI assistant will integrate directly with campus course catalogs, historical auction clearance rates, and product condition indicators to help both buyers and sellers negotiate fair student prices.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="paper" padding="md">
            <h4 className="text-xs font-semibold text-ink mb-1">For Buyers</h4>
            <p className="text-[11px] text-olive leading-relaxed">
              Ask natural language queries like "Find required textbooks for CS 101 ending this weekend under $30".
            </p>
          </Card>

          <Card variant="paper" padding="md">
            <h4 className="text-xs font-semibold text-ink mb-1">For Sellers</h4>
            <p className="text-[11px] text-olive leading-relaxed">
              Upload photos of your dorm gear to auto-generate item titles, suggested starting bids, and condition descriptions.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AssistantPage;
