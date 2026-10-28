import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, Filter, Gavel, BookOpen, Laptop, Armchair, Tag } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';

export const ExplorePage = () => {
  const sampleCategories = [
    { name: 'Textbooks & Study Guides', icon: BookOpen, count: 'Upcoming Phase 3' },
    { name: 'Electronics & Computing', icon: Laptop, count: 'Upcoming Phase 3' },
    { name: 'Dorm Furniture & Decor', icon: Armchair, count: 'Upcoming Phase 3' },
    { name: 'Bicycles & Campus Transport', icon: Compass, count: 'Upcoming Phase 3' },
  ];

  return (
    <PageContainer
      title="Explore Campus Auctions"
      subtitle="Discover peer-to-peer listings from fellow students on your campus."
      actions={
        <Link to="/sell">
          <Button variant="primary" size="sm" icon={Gavel}>
            Sell an item
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by textbook title, course code, laptop model..."
              icon={Search}
            />
          </div>
          <Button variant="secondary" icon={Filter} className="shrink-0">
            Filters
          </Button>
        </div>

        {/* Categories Showcase */}
        <div>
          <h2 className="text-base font-semibold text-ink mb-3">Browse by Campus Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card key={cat.name} variant="stone" padding="md" className="hover:bg-stone-hover transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-forest/10 border border-forest/20 text-forest flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-ink leading-snug">{cat.name}</h3>
                      <p className="text-[11px] text-olive mt-0.5">{cat.count}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Auction Engine Notice */}
        <Card variant="paper" padding="lg" className="border-dashed">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="forest" size="sm">Phase 3 Preview</Badge>
                <h3 className="text-sm font-semibold text-ink">Active Auction Pipeline</h3>
              </div>
              <p className="text-xs text-olive max-w-xl leading-relaxed">
                Live bidding with Socket.IO, countdown timers, proxy bids, and anti-sniping protection are being wired up in the immediate following phases.
              </p>
            </div>
            <Link to="/sell" className="shrink-0">
              <Button variant="outline" size="sm">
                Prepare a Listing
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ExplorePage;
