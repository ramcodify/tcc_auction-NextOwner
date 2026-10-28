import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import FoundationShowcasePage from './pages/FoundationShowcasePage.jsx';
import SystemHealthPage from './pages/SystemHealthPage.jsx';
import BrowsePlaceholderPage from './pages/BrowsePlaceholderPage.jsx';
import SellPlaceholderPage from './pages/SellPlaceholderPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="foundation" element={<FoundationShowcasePage />} />
          <Route path="health" element={<SystemHealthPage />} />
          <Route path="browse" element={<BrowsePlaceholderPage />} />
          <Route path="sell" element={<SellPlaceholderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
