import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, CreditCard, MapPin, MessageSquare, Package, RefreshCw, Send, Star } from 'lucide-react';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatOrderDateTime, parseOrderDate, OrderDateValue } from '../lib/orderDate';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigation } from '../context/NavigationContext';
import { PRODUCT_DETAILS } from '../context/CartContext';

interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  paymentMethod: string;
  paymentProvider?: string;
  totalAmount: number;
  status: string;
  createdAt: OrderDateValue;
  orderItems: { id: string; name: string; quantity: number; price: number }[];
}

interface CustomerReview {
  orderId: string;
  rating: number;
  comment: string;
}

export const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const { searchParams } = useNavigation();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [reviewsByOrderId, setReviewsByOrderId] = useState<Record<string, CustomerReview>>({});
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoadError, setReviewLoadError] = useState<string | null>(null);
  const [activeReviewOrderId, setActiveReviewOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const reviewSubmittingRef = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const customerOrders = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(customerOrders, (snapshot) => {
      const savedOrders = snapshot.docs.map((orderDoc) => {
        const data = orderDoc.data();
        return {
          id: orderDoc.id,
          orderNumber: data.orderNumber || orderDoc.id,
          customerName: data.customerName || user.displayName || 'Customer',
          customerAddress: data.customerAddress || '',
          paymentMethod: data.paymentMethod || 'cod',
          paymentProvider: data.paymentProvider,
          totalAmount: Number(data.totalAmount) || 0,
          status: data.status || 'pending',
          createdAt: data.createdAt || null,
          orderItems: Array.isArray(data.orderItems) ? data.orderItems : [],
        };
      });
      savedOrders.sort((a, b) => (parseOrderDate(b.createdAt)?.getTime() ?? 0) - (parseOrderDate(a.createdAt)?.getTime() ?? 0));
      setOrders(savedOrders);
      setLoading(false);
    }, (loadError) => {
      console.error('Could not load customer orders:', loadError);
      setError('Your saved orders could not be loaded. Check your connection and try again.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, refreshKey]);

  useEffect(() => {
    const requestedOrderId = searchParams.get('review');
    if (!requestedOrderId || loading || loadingReviews) return;

    const requestedOrder = orders.find((order) =>
      order.id === requestedOrderId &&
      order.status === 'delivered' &&
      order.orderItems.some((item) => item.id === PRODUCT_DETAILS.id || item.id === 'legacy-shampoo') &&
      !reviewsByOrderId[order.id]
    );
    if (requestedOrder) setActiveReviewOrderId(requestedOrder.id);
  }, [searchParams, loading, loadingReviews, orders, reviewsByOrderId]);

  useEffect(() => {
    if (!activeReviewOrderId) return;
    const frame = window.requestAnimationFrame(() => {
      const reviewForm = document.getElementById(`review-${activeReviewOrderId}`);
      reviewForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      reviewForm?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeReviewOrderId]);

  useEffect(() => {
    if (!user) {
      setLoadingReviews(false);
      return;
    }

    setLoadingReviews(true);
    setReviewLoadError(null);
    const customerReviews = query(collection(db, 'productReviews'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(customerReviews, (snapshot) => {
      const reviews = snapshot.docs.reduce<Record<string, CustomerReview>>((result, reviewDoc) => {
        const data = reviewDoc.data();
        if (typeof data.orderId === 'string' && typeof data.rating === 'number' && typeof data.comment === 'string') {
          result[data.orderId] = { orderId: data.orderId, rating: data.rating, comment: data.comment };
        }
        return result;
      }, {});
      setReviewsByOrderId(reviews);
      setReviewLoadError(null);
      setLoadingReviews(false);
    }, (loadError) => {
      console.error('Could not load customer reviews:', loadError);
      setReviewLoadError('We could not verify whether this order already has a review. Retry the check, or try submitting below.');
      setLoadingReviews(false);
    });

    return () => unsubscribe();
  }, [user, refreshKey]);

  const handleSubmitReview = async (order: CustomerOrder, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || reviewSubmittingRef.current) return;

    const comment = reviewComment.trim();
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Choose a star rating from 1 to 5.');
      return;
    }
    if (comment.length < 10 || comment.length > 1000) {
      setReviewError('Write a review between 10 and 1,000 characters.');
      return;
    }
    if (order.status !== 'delivered' || !order.orderItems.some((item) => item.id === PRODUCT_DETAILS.id || item.id === 'legacy-shampoo')) {
      setReviewError('A review is available only for a delivered shampoo order.');
      return;
    }

    reviewSubmittingRef.current = true;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await setDoc(doc(db, 'productReviews', order.id), {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: user.uid,
        displayName: user.displayName || order.customerName,
        rating: reviewRating,
        comment,
        createdAt: serverTimestamp(),
      });
      setActiveReviewOrderId(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (saveError) {
      console.error('Could not save customer review:', saveError);
      const errorCode = typeof saveError === 'object' && saveError !== null && 'code' in saveError
        ? saveError.code
        : null;
      setReviewError(errorCode === 'permission-denied'
        ? 'Review access was denied. Confirm the updated Firestore rules are published and that you are signed in to the account that placed this delivered order.'
        : 'Your review could not be submitted. Check your connection and try again.');
    } finally {
      reviewSubmittingRef.current = false;
      setSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-[70vh] bg-[#FAF8F5] px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-[#0B3D2E]" />
          <h1 className="font-serif text-2xl font-bold text-[#0B3D2E]">Sign in to view your orders</h1>
          <p className="mt-2 text-sm text-stone-600">Orders placed while signed in are saved to your account.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-xl bg-[#0B3D2E] px-5 py-3 text-sm font-bold text-white">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-[#0B3D2E]">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0B3D2E]">My Orders</h1>
            <p className="mt-1 text-sm text-stone-600">Saved receipts for {user.displayName || user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && !loadingReviews && (
          <div className="mt-6 space-y-3" aria-live="polite">
            {orders
              .filter((order) =>
                order.status === 'delivered' &&
                order.orderItems.some((item) => item.id === PRODUCT_DETAILS.id || item.id === 'legacy-shampoo') &&
                !reviewsByOrderId[order.id]
              )
              .map((order) => (
                <div key={order.id} role="status" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B3D2E] text-[#FCE082]">
                      <MessageSquare className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold text-[#0B3D2E]">Your shampoo order was delivered</p>
                      <p className="mt-1 text-sm text-stone-700">Order {order.orderNumber} is ready for a review.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveReviewOrderId(order.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#C9A227] px-4 py-2.5 text-sm font-bold text-[#0B3D2E] hover:bg-[#D8B138] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E] focus-visible:ring-offset-2 sm:w-auto"
                  >
                    <Star className="h-4 w-4" aria-hidden="true" />
                    Review this order
                  </button>
                </div>
              ))}
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-sm text-stone-600">Loading your saved orders...</p>
        ) : !error && orders.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-10 w-10 text-stone-400" />
            <h2 className="font-serif text-xl font-bold text-stone-800">No saved orders yet</h2>
            <p className="mt-2 text-sm text-stone-600">Orders you place while signed in will appear here.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-[#0B3D2E] px-5 py-3 text-sm font-bold text-white">
              Shop now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {orders.map((order) => {
              const displayDate = formatOrderDateTime(order.createdAt);

              return (
                <article key={order.id} className="py-6 first:pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-stone-500">Order receipt</p>
                      <h2 className="mt-1 break-all font-serif text-xl font-bold text-[#0B3D2E]">{order.orderNumber}</h2>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
                    <p className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />{displayDate}</p>
                    <p className="flex items-start gap-2"><CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />{order.paymentProvider === 'jazzcash' ? 'JazzCash' : order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Bank transfer'}</p>
                    {order.customerAddress && <p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />{order.customerAddress}</p>}
                  </div>
                  <div className="mt-4 border-t border-stone-200 pt-3">
                    {order.orderItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="flex justify-between gap-4 py-1.5 text-sm text-stone-700">
                        <span className="min-w-0 break-words">{item.name} × {item.quantity}</span>
                        <span className="shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-between border-t border-stone-200 pt-3 font-bold text-[#0B3D2E]">
                      <span>Total</span>
                      <span>Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                  {order.status === 'delivered' && order.orderItems.some((item) => item.id === PRODUCT_DETAILS.id || item.id === 'legacy-shampoo') && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      {reviewsByOrderId[order.id] ? (
                        <div className="flex items-start gap-2 text-sm text-emerald-800" role="status">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-semibold">Thanks for sharing your review!</p>
                            <div className="mt-1 flex items-center gap-1 text-amber-600" aria-label={`${reviewsByOrderId[order.id].rating} out of 5 stars`}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`h-4 w-4 ${star <= reviewsByOrderId[order.id].rating ? 'fill-current' : ''}`} aria-hidden="true" />
                              ))}
                            </div>
                            <p className="mt-1 text-stone-700">{reviewsByOrderId[order.id].comment}</p>
                          </div>
                        </div>
                      ) : loadingReviews ? (
                        <p className="text-sm text-stone-500">Checking review status...</p>
                      ) : (
                        <>
                          {reviewLoadError && (
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                              <span role="status">{reviewLoadError} You can still try submitting below.</span>
                              <button
                                type="button"
                                onClick={() => setRefreshKey((key) => key + 1)}
                                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                              >
                                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                                Retry check
                              </button>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReviewOrderId(activeReviewOrderId === order.id ? null : order.id);
                              setReviewError(null);
                            }}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3D2E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#07261C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-2"
                            aria-expanded={activeReviewOrderId === order.id}
                          >
                            <MessageSquare className="h-4 w-4" aria-hidden="true" />
                            {activeReviewOrderId === order.id ? 'Close review form' : 'Leave a review'}
                          </button>
                          {activeReviewOrderId === order.id && (
                            <form onSubmit={(event) => handleSubmitReview(order, event)} className="mt-4 space-y-3 rounded-xl bg-white p-4 ring-1 ring-stone-200">
                              <fieldset>
                                <legend className="text-sm font-semibold text-stone-800">How would you rate the shampoo?</legend>
                                <div className="mt-2 flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewRating(star)}
                                      className="flex h-11 w-11 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D2E]"
                                      aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                                      aria-pressed={reviewRating === star}
                                    >
                                      <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-current' : ''}`} aria-hidden="true" />
                                    </button>
                                  ))}
                                </div>
                              </fieldset>
                              <div>
                                <label htmlFor={`review-${order.id}`} className="block text-sm font-semibold text-stone-800">Your review</label>
                                <textarea
                                  id={`review-${order.id}`}
                                  value={reviewComment}
                                  onChange={(event) => setReviewComment(event.target.value.slice(0, 1000))}
                                  rows={4}
                                  minLength={10}
                                  maxLength={1000}
                                  required
                                  placeholder="Tell us about your experience with Patangia's Herbal Shampoo..."
                                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:border-[#0B3D2E] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                                  aria-describedby={`review-count-${order.id}`}
                                />
                                <p id={`review-count-${order.id}`} className="mt-1 text-right text-xs text-stone-500">{reviewComment.trim().length}/1000</p>
                              </div>
                              {reviewError && <p role="alert" className="text-sm text-red-700">{reviewError}</p>}
                              <button
                                type="submit"
                                disabled={submittingReview}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C9A227] px-5 py-2.5 text-sm font-bold text-[#0B3D2E] hover:bg-[#D8B138] disabled:cursor-wait disabled:opacity-60"
                              >
                                <Send className="h-4 w-4" aria-hidden="true" />
                                {submittingReview ? 'Submitting...' : 'Submit review'}
                              </button>
                            </form>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};