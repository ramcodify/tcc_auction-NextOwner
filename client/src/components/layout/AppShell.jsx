import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import BottomNav from './BottomNav.jsx';
import SessionExpiredBanner from './SessionExpiredBanner.jsx';

export const AppShell = () => {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <SessionExpiredBanner />
      <Navbar />
      {/* On mobile, add pb-20 to ensure bottom navigation does not obscure page contents */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default AppShell;
