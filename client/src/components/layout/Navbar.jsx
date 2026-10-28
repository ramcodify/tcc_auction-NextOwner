import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Gavel, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Badge from '../common/Badge.jsx';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ loading: true, connected: false, message: 'Checking...' });
  const location = useLocation();

  const checkConnection = async () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/health/db');
      const data = await res.json();
      if (res.ok && data.status === 'healthy') {
        setDbStatus({
          loading: false,
          connected: true,
          message: 'MongoDB Connected',
          details: data.database
        });
      } else {
        setDbStatus({
          loading: false,
          connected: false,
          message: data.message || 'Database disconnected',
          details: data.database
        });
      }
    } catch (err) {
      setDbStatus({
        loading: false,
        connected: false,
        message: 'Backend API unreachable'
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Foundation & Overview', path: '/' },
    { label: 'Component Library', path: '/foundation' },
    { label: 'System Health', path: '/health' },
    { label: 'Browse Auctions', path: '/browse', badge: 'Phase 3' },
    { label: 'Sell Item', path: '/sell', badge: 'Phase 2' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-forest flex items-center justify-center text-paper group-hover:bg-forest-dark transition-colors">
              <Gavel className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-ink font-sans leading-none">
                NEXT<span className="text-forest font-semibold">owner</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-olive font-medium mt-0.5">
                Campus Auction
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5
                  ${isActive
                    ? 'bg-stone text-ink font-semibold'
                    : 'text-olive hover:text-ink hover:bg-stone/50'}
                `}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-stone-hover text-olive rounded">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action / System Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              title={dbStatus.message}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-stone border border-border text-xs cursor-pointer select-none"
              onClick={checkConnection}
            >
              {dbStatus.loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-olive" />
              ) : dbStatus.connected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-[#9E392F]" />
              )}
              <span className="text-ink font-medium">
                {dbStatus.loading ? 'Checking...' : dbStatus.connected ? 'DB Online' : 'DB Offline'}
              </span>
              <button
                type="button"
                className="text-olive hover:text-ink ml-1 p-0.5 rounded"
                title="Refresh Status"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded text-ink hover:bg-stone transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-paper px-4 pt-3 pb-5 space-y-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium
                  ${isActive
                    ? 'bg-stone text-ink font-semibold'
                    : 'text-ink hover:bg-stone/60'}
                `}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="olive" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </div>

          <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs text-olive">
            <span>Database Status:</span>
            <span className={`font-medium ${dbStatus.connected ? 'text-forest' : 'text-[#9E392F]'}`}>
              {dbStatus.message}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
