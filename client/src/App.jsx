import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { AssistantProvider } from './context/AssistantContext.jsx';
import { NotificationProvider, useNotifications } from './context/NotificationContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import AppShell from './components/layout/AppShell.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import AuctionDetailsPage from './pages/AuctionDetailsPage.jsx';
import CreateListingPage from './pages/CreateListingPage.jsx';
import SellerDashboardPage from './pages/SellerDashboardPage.jsx';
import ActivityPage from './pages/ActivityPage.jsx';
import WatchlistSavedSearchesPage from './pages/WatchlistSavedSearchesPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import FoundationShowcasePage from './pages/FoundationShowcasePage.jsx';
import SystemHealthPage from './pages/SystemHealthPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * Direct URL redirect for /notifications:
 * Eliminates separate page, automatically opening the Notification Popup over the home feed.
 */
const NotificationsPopupRedirect = () => {
  const { openNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    openNotifications();
    navigate('/', { replace: true });
  }, [openNotifications, navigate]);

  return null;
};

export const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AssistantProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppShell />}>
                  {/* Public Marketplace Views */}
                  <Route index element={<HomePage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="browse" element={<ExplorePage />} />
                  <Route path="auction/:id" element={<AuctionDetailsPage />} />
                  <Route path="assistant" element={<AssistantPage />} />
                  <Route path="foundation" element={<FoundationShowcasePage />} />
                  <Route path="health" element={<SystemHealthPage />} />

                  {/* Public Auth Routes */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password/:token" element={<ResetPasswordPage />} />

                  {/* Protected Student Operations */}
                  <Route
                    path="sell"
                    element={
                      <ProtectedRoute>
                        <CreateListingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="seller/dashboard"
                    element={
                      <ProtectedRoute>
                        <SellerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="activity"
                    element={
                      <ProtectedRoute>
                        <ActivityPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="watchlist"
                    element={
                      <ProtectedRoute>
                        <WatchlistSavedSearchesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="saved-searches"
                    element={
                      <ProtectedRoute>
                        <WatchlistSavedSearchesPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Notification Popup Redirect (No separate page needed) */}
                  <Route
                    path="notifications"
                    element={<NotificationsPopupRedirect />}
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AssistantProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
