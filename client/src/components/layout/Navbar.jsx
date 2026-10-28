import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Bell,
  User as UserIcon,
  Bot,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Compass,
  Home,
  Activity,
  Layers,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../common/Button.jsx';
import Badge from '../common/Badge.jsx';
import { NotificationDropdown } from '../notification/NotificationPopup.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileDrawerOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/', end: true },
    { label: 'Explore', path: '/explore' },
    { label: 'Sell an item', path: '/sell' },
    { label: 'My activity', path: '/activity' }
  ];

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded bg-forest flex items-center justify-center text-paper group-hover:bg-forest-dark transition-colors">
              <Gavel className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-ink font-sans leading-none">
                NEXT<span className="text-forest font-semibold">owner</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-olive font-medium mt-0.5">
                Campus Auction
              </span>
            </div>
          </Link>

          {/* Full Desktop Navigation (md and up) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `
                  px-3 py-1.5 rounded text-xs font-medium transition-colors
                  ${isActive
                    ? 'bg-stone text-ink font-semibold'
                    : 'text-olive hover:text-ink hover:bg-stone/50'}
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Button with On-Screen Pop-up Window */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className={`
                  relative p-2 rounded transition-colors
                  ${notificationDropdownOpen ? 'bg-stone text-forest' : 'text-olive hover:text-ink hover:bg-stone'}
                `}
                title="Notifications"
                aria-label="Toggle notifications pop-up"
              >
                <Bell className="w-4 h-4" />
                {/* Subtle unread badge dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-forest ring-2 ring-paper" />
              </button>

              {/* On-Screen Notification Pop-up Window */}
              <NotificationDropdown
                isOpen={notificationDropdownOpen}
                onClose={() => setNotificationDropdownOpen(false)}
              />
            </div>

            {/* Desktop Auth State */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1 rounded bg-stone border border-border hover:bg-stone-hover transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-forest text-paper text-[11px] font-semibold flex items-center justify-center">
                      {getInitials(user.name)}
                    </div>
                    <span className="text-xs font-medium text-ink max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 rounded text-olive hover:text-[#9E392F] hover:bg-stone transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Header Right Profile / Login */}
            <div className="flex items-center gap-1.5 md:hidden">
              {user ? (
                <Link
                  to="/profile"
                  className="w-7 h-7 rounded-full bg-forest text-paper text-xs font-semibold flex items-center justify-center"
                  aria-label="Profile"
                >
                  {getInitials(user.name)}
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="primary" size="sm" className="text-xs px-2.5 py-1">
                    Log In
                  </Button>
                </Link>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                className="p-1.5 rounded text-ink hover:bg-stone transition-colors ml-1"
                aria-label="Toggle navigation drawer"
              >
                {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Accessible from top hamburger for all pages) */}
      {mobileDrawerOpen && (
        <div className="md:hidden border-t border-border bg-paper px-4 py-4 space-y-3">
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Home className="w-4 h-4 text-forest" /> Home
            </NavLink>
            <NavLink
              to="/explore"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Compass className="w-4 h-4 text-forest" /> Explore Auctions
            </NavLink>
            <NavLink
              to="/sell"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <PlusCircle className="w-4 h-4 text-forest" /> Sell an item
            </NavLink>
            <NavLink
              to="/activity"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Activity className="w-4 h-4 text-forest" /> My activity
            </NavLink>
            <NavLink
              to="/notifications"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Bell className="w-4 h-4 text-forest" /> Notifications
            </NavLink>
            <NavLink
              to="/watchlist"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Bookmark className="w-4 h-4 text-forest" />
              Watchlist & Saved Alerts
            </NavLink>
            <NavLink
              to="/seller/dashboard"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Gavel className="w-4 h-4 text-forest" /> Seller Dashboard
            </NavLink>
            <NavLink
              to="/foundation"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded text-sm text-ink hover:bg-stone font-medium"
            >
              <Layers className="w-4 h-4 text-forest" /> Component Library
            </NavLink>
          </div>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded bg-stone text-xs text-ink font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-forest text-paper text-[10px] font-semibold flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-[11px] text-olive">{user.email}</p>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-[#9E392F]"
                  onClick={handleLogout}
                  icon={LogOut}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileDrawerOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileDrawerOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
