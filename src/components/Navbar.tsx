import React, { useEffect, useState } from 'react';
import { ShoppingBag, User as UserIcon, LogOut, Menu, X, Bell, MessageSquare, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigation, Link } from '../context/NavigationContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ReviewNotification {
  id: string;
  orderNumber: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { pathname, navigate } = useNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState<ReviewNotification[]>([]);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());
  const [loadingReviewNotifications, setLoadingReviewNotifications] = useState(true);
  const [reviewNotificationsError, setReviewNotificationsError] = useState(false);
  const pendingReviewNotifications = deliveredOrders.filter((order) => !reviewedOrderIds.has(order.id));
  const visiblePendingReviewNotifications = loadingReviewNotifications || reviewNotificationsError
    ? []
    : pendingReviewNotifications;

  useEffect(() => {
    if (!user) {
      setDeliveredOrders([]);
      setReviewedOrderIds(new Set());
      setLoadingReviewNotifications(false);
      setReviewNotificationsError(false);
      return;
    }

    setLoadingReviewNotifications(true);
    setReviewNotificationsError(false);
    const customerOrders = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const customerReviews = query(collection(db, 'productReviews'), where('userId', '==', user.uid));
    let ordersLoaded = false;
    let reviewsLoaded = false;

    const updateLoadingState = () => {
      if (ordersLoaded && reviewsLoaded) setLoadingReviewNotifications(false);
    };

    const unsubscribeOrders = onSnapshot(customerOrders, (snapshot) => {
      const eligibleDeliveredOrders = snapshot.docs.flatMap((orderDoc) => {
        const data = orderDoc.data();
        const hasShampoo = Array.isArray(data.orderItems) &&
          data.orderItems.some((item) => item?.id === 'patangias-herbal-shampoo' || item?.id === 'legacy-shampoo');
        return data.status === 'delivered' && hasShampoo
          ? [{ id: orderDoc.id, orderNumber: typeof data.orderNumber === 'string' ? data.orderNumber : orderDoc.id }]
          : [];
      });
      setDeliveredOrders(eligibleDeliveredOrders);
      ordersLoaded = true;
      updateLoadingState();
    }, (error) => {
      console.error('Could not load delivered-order notifications:', error);
      setReviewNotificationsError(true);
      setLoadingReviewNotifications(false);
    });

    const unsubscribeReviews = onSnapshot(customerReviews, (snapshot) => {
      setReviewedOrderIds(new Set(snapshot.docs.map((reviewDoc) => reviewDoc.id)));
      reviewsLoaded = true;
      updateLoadingState();
    }, (error) => {
      console.error('Could not check submitted reviews for notifications:', error);
      setReviewNotificationsError(true);
      setLoadingReviewNotifications(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeReviews();
    };
  }, [user]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B3D2E] text-white shadow-lg border-b border-[#C9A227]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex shrink-0 items-center group">
            <img
              src="/Gemini_Generated_Image_f4gnxvf4gnxvf4gn-removebg-preview.png"
              alt="Patangia's Herbal Shampoo"
              className="h-11 w-auto max-w-[42vw] object-contain transition-transform group-hover:scale-[1.02] sm:h-14 sm:max-w-none"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => handleNavClick('/')}
              className={`transition-colors hover:text-[#C9A227] ${
                pathname === '/' ? 'text-[#C9A227] font-semibold' : 'text-stone-200'
              }`}
            >
              Home
            </button>
            <a
              href="#benefits"
              onClick={(e) => {
                if (pathname !== '/') {
                  e.preventDefault();
                  navigate('/#benefits');
                }
              }}
              className="text-stone-200 hover:text-[#C9A227] transition-colors"
            >
              Benefits
            </a>
            <a
              href="#ingredients"
              onClick={(e) => {
                if (pathname !== '/') {
                  e.preventDefault();
                  navigate('/#ingredients');
                }
              }}
              className="text-stone-200 hover:text-[#C9A227] transition-colors"
            >
              12 Ingredients
            </a>
            <a
              href="#reviews"
              onClick={(e) => {
                if (pathname !== '/') {
                  e.preventDefault();
                  navigate('/#reviews');
                }
              }}
              className="text-stone-200 hover:text-[#C9A227] transition-colors"
            >
              Customer Reviews
            </a>
            <a
              href="#faq"
              onClick={(e) => {
                if (pathname !== '/') {
                  e.preventDefault();
                  navigate('/#faq');
                }
              }}
              className="text-stone-200 hover:text-[#C9A227] transition-colors"
            >
              FAQs
            </a>
          </nav>

          {/* Right Actions: Cart, User Profile / Login */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  aria-label={visiblePendingReviewNotifications.length > 0
                    ? `Notifications: ${visiblePendingReviewNotifications.length} shampoo reviews to write`
                    : 'Notifications'}
                  aria-expanded={notificationsOpen}
                  aria-haspopup="true"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-[#124D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCE082]"
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {visiblePendingReviewNotifications.length > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9A227] px-1 text-[10px] font-black leading-none text-[#0B3D2E]">
                      {visiblePendingReviewNotifications.length > 9 ? '9+' : visiblePendingReviewNotifications.length}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div
                    role="dialog"
                    aria-label="Notifications"
                    className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-stone-200 bg-white text-stone-900 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                      <h2 className="text-sm font-bold text-[#0B3D2E]">Notifications</h2>
                      {visiblePendingReviewNotifications.length > 0 && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">
                          {visiblePendingReviewNotifications.length} to review
                        </span>
                      )}
                    </div>
                    {loadingReviewNotifications ? (
                      <div className="flex items-center gap-2 px-4 py-5 text-sm text-stone-600" role="status">
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Checking your delivered orders...
                      </div>
                    ) : reviewNotificationsError ? (
                      <p className="px-4 py-5 text-sm text-red-700" role="alert">
                        Notifications could not be checked. Refresh the page and try again.
                      </p>
                    ) : visiblePendingReviewNotifications.length > 0 ? (
                      <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
                        {visiblePendingReviewNotifications.map((order) => (
                          <li key={order.id}>
                            <Link
                              href={`/account?review=${encodeURIComponent(order.id)}`}
                              onClick={() => setNotificationsOpen(false)}
                              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-emerald-50 focus-visible:bg-emerald-50"
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#0B3D2E]">
                                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-stone-900">Your shampoo was delivered</span>
                                <span className="mt-0.5 block text-xs leading-5 text-stone-600">
                                  Order {order.orderNumber} · Tap to leave a review
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-4 py-5 text-sm text-stone-600">
                        You’re all caught up. Delivery and review updates will appear here.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-[#124D3B] hover:bg-[#18634D] text-white border border-[#C9A227]/40 transition-all flex items-center gap-2 group"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#FCE082] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {totalItems > 0 && (
                <span className="bg-[#C9A227] text-[#0B3D2E] text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#124D3B] hover:bg-[#18634D] border border-[#C9A227]/40 text-xs font-medium text-stone-100 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0B3D2E] flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      (user.displayName?.[0] || user.email?.[0] || 'U')
                    )}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate text-stone-200">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-stone-800 shadow-2xl py-2 border border-stone-100 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-medium text-stone-500">Signed in as</p>
                      <p className="text-xs font-bold text-[#0B3D2E] truncate">{user.email || user.displayName}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2.5 text-xs font-semibold text-[#0B3D2E] hover:bg-stone-50"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl bg-[#C9A227] hover:bg-[#D8B138] text-[#0B3D2E] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-200 hover:text-white hover:bg-[#124D3B]"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#07261C] border-t border-[#C9A227]/20 px-4 pt-4 pb-6 space-y-3">
          <button
            onClick={() => handleNavClick('/')}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-200 hover:bg-[#0B3D2E] hover:text-[#C9A227]"
          >
            Home
          </button>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-200 hover:bg-[#0B3D2E] hover:text-[#C9A227]"
          >
            Benefits
          </a>
          <a
            href="#ingredients"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-200 hover:bg-[#0B3D2E] hover:text-[#C9A227]"
          >
            12 Ingredients
          </a>
          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-200 hover:bg-[#0B3D2E] hover:text-[#C9A227]"
          >
            Customer Reviews
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-stone-200 hover:bg-[#0B3D2E] hover:text-[#C9A227]"
          >
            FAQs
          </a>
          {user && (
            <div className="pt-3 border-t border-stone-700/50">
              <button
                onClick={() => handleNavClick('/account')}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#FCE082] hover:bg-[#0B3D2E]"
              >
                My Orders
              </button>
              <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-stone-300 truncate max-w-[200px]">
                {user.email}
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-xs text-red-400 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
                </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
