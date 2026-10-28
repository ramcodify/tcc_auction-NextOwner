import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, ShieldCheck, Database, Smartphone, Laptop, Sparkles, ExternalLink } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Dialog from '../components/common/Dialog.jsx';

export const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const colorPalette = [
    { name: 'Warm Paper', hex: '#F7F5F0', role: 'Page background & base contrast', bgClass: 'bg-[#F7F5F0] border-border' },
    { name: 'Forest Green', hex: '#315B43', role: 'Primary buttons, active indicators', bgClass: 'bg-[#315B43] text-paper' },
    { name: 'Ink', hex: '#20231F', role: 'Headings, primary body typography', bgClass: 'bg-[#20231F] text-paper' },
    { name: 'Stone', hex: '#E8E5DB', role: 'Surface cards, panels, badges', bgClass: 'bg-[#E8E5DB] text-ink border-border' },
    { name: 'Muted Olive', hex: '#77776D', role: 'Secondary copy, borders, subtle captions', bgClass: 'bg-[#77776D] text-paper' },
  ];

  const breakpoints = [
    { label: 'Mobile (360px)', icon: Smartphone, desc: 'Single-column fluid flow, hamburger navigation, compact button targets.' },
    { label: 'Tablet (768px)', icon: Smartphone, desc: 'Dual-column adaptive grids, inline search, touch-friendly padding.' },
    { label: 'Laptop (1024px)', icon: Laptop, desc: 'Multi-column dashboard, full navigation bar, expanded cards.' },
    { label: 'Desktop (1440px)', icon: Laptop, desc: 'Constrained max-w-7xl centered container, generous reading gutters.' },
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <div className="py-8 md:py-14 border-b border-border">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="forest" size="sm">Phase 1 Complete</Badge>
            <span className="text-xs text-olive">NEXTowner Foundation</span>
          </div>

          <h1 className="editorial-heading text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.15] mb-4">
            A restrained campus auction platform designed for circular student living.
          </h1>

          <p className="text-sm sm:text-base text-olive leading-relaxed max-w-2xl mb-8">
            Built from scratch with React, Vite, Node.js, Express, and MongoDB. Structured for real-time Socket.IO bidding, student-to-student trust, and purposeful material reuse.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/foundation">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Explore Component Library
              </Button>
            </Link>
            <Link to="/health">
              <Button variant="secondary" size="lg" icon={Database}>
                Check Database Health
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsModalOpen(true)}
            >
              Test Modal Dialog
            </Button>
          </div>
        </div>
      </div>

      {/* Palette Tokens Section */}
      <section className="py-10 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-ink font-sans">
              Curated Color Palette
            </h2>
            <p className="text-xs text-olive mt-0.5">
              Strictly applied without neon accents, glows, or synthetic gradients.
            </p>
          </div>
          <span className="text-xs text-olive mt-2 sm:mt-0 font-mono">
            5 Design System Tokens
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {colorPalette.map((c) => (
            <div
              key={c.hex}
              className="p-4 rounded border border-border bg-stone/30 flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">{c.name}</span>
                <div className={`w-6 h-6 rounded border ${c.bgClass}`} />
              </div>
              <div>
                <p className="text-xs font-mono font-medium text-ink">{c.hex}</p>
                <p className="text-[11px] text-olive mt-1 leading-snug">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Responsive Breakpoint Verification Section */}
      <section className="py-10 border-b border-border">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-ink font-sans">
            Responsive Layout Testing Matrix
          </h2>
          <p className="text-xs text-olive mt-0.5">
            Verified across specified viewport widths from 360px mobile to 1440px desktop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {breakpoints.map((bp) => {
            const Icon = bp.icon;
            return (
              <Card key={bp.label} variant="stone" padding="md" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-ink">{bp.label}</span>
                    <Icon className="w-4 h-4 text-forest" />
                  </div>
                  <p className="text-xs text-olive leading-relaxed">
                    {bp.desc}
                  </p>
                </div>
                <div className="pt-3 mt-4 border-t border-border/60">
                  <span className="text-[11px] font-medium text-forest flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Responsive
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Development Roadmap Alignment */}
      <section className="py-10">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-ink font-sans">
            Foundation Readiness
          </h2>
          <p className="text-xs text-olive mt-0.5">
            Architecture and component building blocks prepared for upcoming phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="stone" padding="md">
            <CardHeader>
              <CardTitle as="h3">Phase 1 Foundation</CardTitle>
              <CardDescription>Design system, layout & health APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-ink space-y-2 list-disc list-inside">
                <li>Vite + React 18 frontend with Tailwind tokens</li>
                <li>Express backend with Mongoose connection pooling</li>
                <li>Live database health and error diagnostics</li>
                <li>Clean sans-serif UI typography & editorial headers</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Badge variant="forest" size="sm">Active Phase</Badge>
            </CardFooter>
          </Card>

          <Card variant="paper" padding="md">
            <CardHeader>
              <CardTitle as="h3">Phase 2: Authentication</CardTitle>
              <CardDescription>Campus email login & student profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-olive space-y-2 list-disc list-inside">
                <li>Unified student account (buyer and seller)</li>
                <li>Campus domain verification</li>
                <li>Session & JWT auth infrastructure</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Badge variant="olive" size="sm">Next Phase</Badge>
            </CardFooter>
          </Card>

          <Card variant="paper" padding="md">
            <CardHeader>
              <CardTitle as="h3">Phase 3: Auction Listings</CardTitle>
              <CardDescription>Product catalog, image uploads & search</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-olive space-y-2 list-disc list-inside">
                <li>Product creation with reserve & starting bids</li>
                <li>Item condition grading & categories</li>
                <li>Socket.IO live auction countdown engine</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Badge variant="olive" size="sm">Upcoming</Badge>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Interactive Modal Dialog Verification */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reusable Dialog Verification"
        description="Testing accessibility, keyboard escape binding, and design system tokens."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
              Understood
            </Button>
          </>
        }
      >
        <p className="text-xs text-ink leading-relaxed">
          This dialog component conforms to the NEXTowner design requirements. It uses restrained stone/paper surfaces, thin dividers, a quiet backdrop, and automatic escape key dismissal.
        </p>
      </Dialog>
    </PageContainer>
  );
};

export default HomePage;
