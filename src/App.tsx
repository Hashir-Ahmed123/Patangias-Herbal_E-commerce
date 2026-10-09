/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SuccessPage } from './pages/SuccessPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { StoreSettingsProvider } from './context/StoreSettingsContext';

const AdminPage = React.lazy(() => import('./pages/AdminPage').then(({ AdminPage }) => ({ default: AdminPage })));

const AppRoutes: React.FC = () => {
  const { pathname } = useNavigation();

  // Route matching
  const renderCurrentPage = () => {
    switch (pathname) {
      case '/cart':
        return <CartPage />;
      case '/checkout':
        return <CheckoutPage />;
      case '/success':
        return <SuccessPage />;
      case '/login':
        return <LoginPage />;
      case '/account':
        return <AccountPage />;
      case '/admin':
        return (
          <Suspense fallback={<div className="min-h-screen bg-[#F4F6F3] p-6 text-sm text-stone-600">Loading dashboard...</div>}>
            <AdminPage />
          </Suspense>
        );
      case '/':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FAF8F5] text-stone-900 selection:bg-[#C9A227] selection:text-white">
      {pathname !== '/admin' && <Navbar />}
      <div className="flex-1">
        {renderCurrentPage()}
      </div>
      {pathname !== '/admin' && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <NavigationProvider>
      <AuthProvider>
        <StoreSettingsProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </StoreSettingsProvider>
      </AuthProvider>
    </NavigationProvider>
  );
}
