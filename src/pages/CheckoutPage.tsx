import React, { useRef, useState } from 'react';
import { 
  Truck, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  Lock,
  Package,
  Info,
  MapPin,
  Banknote
} from 'lucide-react';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DELIVERY_CHARGE, PRODUCT_DETAILS, TESTING_PACK_DETAILS, getBundleDiscountForCount, getBundlePriceForCount, getOriginalBundlePriceForCount, useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, Link } from '../context/NavigationContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

type CheckoutField = 'fullName' | 'phone' | 'address' | 'area';
type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

const getCheckoutErrorCode = (error: unknown) => (
  typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : null
);

export const CheckoutPage: React.FC = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { settings } = useStoreSettings();

  // Karachi delivery address
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city] = useState('Karachi');
  const [area, setArea] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash'>('cod');
  
  const [copiedBank, setCopiedBank] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [showReceiptPrompt, setShowReceiptPrompt] = useState(false);
  const orderAttemptRef = useRef<{ id: string; number: string } | null>(null);
  const isSubmittingRef = useRef(false);
  const [pendingOrder, setPendingOrder] = useState<{
    orderNumber: string;
    fullName: string;
    paymentMethod: 'cod' | 'jazzcash';
    subtotal: number;
    deliveryCharge: number;
    total: number;
  } | null>(null);

  const bottleQuantity = items.find((item) => item.id === PRODUCT_DETAILS.id)?.quantity ?? 0;
  const bundlePrice = getBundlePriceForCount(bottleQuantity);
  const discount = getBundleDiscountForCount(bottleQuantity);
  const itemsSubtotal = bundlePrice + Math.max(0, totalPrice - bundlePrice);
  const finalTotal = itemsSubtotal + DELIVERY_CHARGE;
  const hasUnsupportedPhoneCharacters = /[^0-9+()\s-]/.test(phone);

  const clearFieldError = (field: CheckoutField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setErrorMessage(null);
  };

  const handleCopyAccount = async () => {
    setCopyError(null);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard access is unavailable in this browser.');
      }
      await navigator.clipboard.writeText(settings.jazzCashNumber);
      setCopiedBank(true);
      window.setTimeout(() => setCopiedBank(false), 2500);
    } catch (error) {
      console.error('Could not copy JazzCash account number:', error);
      setCopiedBank(false);
      setCopyError('Could not copy the number. Please select and copy it manually.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setErrorMessage(null);

    const validationErrors: CheckoutFieldErrors = {};
    const trimmedName = fullName.trim();
    const trimmedAddress = address.trim();
    const trimmedArea = area.trim();
    const normalizedPhone = phone.replace(/\D/g, '').replace(/^00/, '');

    if (trimmedName.length < 2) {
      validationErrors.fullName = 'Enter your full name (at least 2 characters).';
    } else if (trimmedName.length > 100) {
      validationErrors.fullName = 'Name must be 100 characters or fewer.';
    } else if (!/^[\p{L}\p{M}\s.'’\-]+$/u.test(trimmedName)) {
      validationErrors.fullName = 'Use letters, spaces, apostrophes, periods, or hyphens in your name.';
    }

    if (hasUnsupportedPhoneCharacters) {
      validationErrors.phone = 'Remove letters and unsupported symbols from the mobile number.';
    } else if (!/^03\d{9}$/.test(normalizedPhone) && !/^923\d{9}$/.test(normalizedPhone)) {
      validationErrors.phone = 'Enter an 11-digit Pakistani mobile number, e.g. 0300 1234567 or +92 300 1234567.';
    }

    if (trimmedAddress.length < 5) {
      validationErrors.address = 'Enter a complete street or house address (at least 5 characters).';
    } else if (trimmedAddress.length > 300) {
      validationErrors.address = 'Address must be 300 characters or fewer.';
    } else if ([trimmedAddress, trimmedArea, 'Karachi'].join(', ').length > 300) {
      validationErrors.address = 'Address, area, and city together must be 300 characters or fewer.';
    }

    if (trimmedArea.length < 2) {
      validationErrors.area = 'Enter your Karachi area or district.';
    } else if (trimmedArea.length > 100) {
      validationErrors.area = 'Area must be 100 characters or fewer.';
    }

    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage('Please correct the highlighted fields before placing your order.');
      return;
    }

    if (city.trim().toLowerCase() !== 'karachi') {
      setErrorMessage('Delivery is currently available only in Karachi.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add product to proceed.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const orderAttempt = orderAttemptRef.current ?? (() => {
        const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
        return {
          id: `order_${Date.now()}_${randomFiveDigits}`,
          number: `PAT-${randomFiveDigits}`,
        };
      })();
      orderAttemptRef.current = orderAttempt;
      const orderNumber = orderAttempt.number;

      const fullCustomerAddress = [address.trim(), area.trim(), 'Karachi'].join(', ');

      const orderPayload = {
        orderNumber,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerAddress: fullCustomerAddress,
        customerCity: city.trim(),
        orderItems: items.map((item) => {
          const isShampoo = item.id === PRODUCT_DETAILS.id;
          const lineTotal = isShampoo ? getBundlePriceForCount(item.quantity) : item.price * item.quantity;
          const originalLineTotal = isShampoo ? getOriginalBundlePriceForCount(item.quantity) : item.originalPrice * item.quantity;

          return {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            originalPrice: item.originalPrice,
            lineTotal,
            originalLineTotal,
            bundleDiscount: Math.max(0, originalLineTotal - lineTotal),
          };
        }),
        itemsSubtotal,
        bundleDiscount: discount,
        deliveryCharge: DELIVERY_CHARGE,
        paymentMethod: paymentMethod === 'jazzcash' ? 'bank_transfer' : 'cod',
        paymentProvider: paymentMethod,
        totalAmount: finalTotal,
        status: 'pending',
        quantity: totalItems,
        orderNotes: orderNotes.trim(),
        createdAt: serverTimestamp(),
        ...(user?.uid ? { userId: user.uid } : {}),
        ...(user?.email ? { userEmail: user.email } : {}),
      };

      let saveTimeout: number | undefined;
      try {
        await Promise.race([
          setDoc(doc(db, 'orders', orderAttempt.id), orderPayload),
          new Promise<void>((_, reject) => {
            saveTimeout = window.setTimeout(() => {
              reject(Object.assign(new Error('Firestore did not confirm the order in time.'), { code: 'timeout' }));
            }, 15000);
          }),
        ]);
      } finally {
        if (saveTimeout !== undefined) window.clearTimeout(saveTimeout);
      }
      orderAttemptRef.current = null;

      const orderInfo = {
        orderNumber,
        fullName: fullName.trim(),
        paymentMethod,
        subtotal: itemsSubtotal,
        deliveryCharge: DELIVERY_CHARGE,
        total: finalTotal,
      };

      setPendingOrder(orderInfo);

      setShowReceiptPrompt(true);
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const errorCode = getCheckoutErrorCode(err);
      if (errorCode === 'permission-denied') {
        setErrorMessage(`The store could not accept this ${paymentMethod === 'jazzcash' ? 'JazzCash' : 'Cash on Delivery'} order. Please check your details and try again. Your cart is safe.`);
      } else if (errorCode === 'timeout' || errorCode === 'deadline-exceeded') {
        setErrorMessage(`We could not confirm whether the order was saved. Wait a moment before retrying; this order reference${orderAttemptRef.current ? ` (${orderAttemptRef.current.number})` : ''} will be reused to prevent a duplicate.`);
      } else if (errorCode === 'unavailable' || errorCode === 'network-request-failed' || !navigator.onLine) {
        setErrorMessage(`Your connection interrupted order confirmation. Reconnect and retry; the same order reference${orderAttemptRef.current ? ` (${orderAttemptRef.current.number})` : ''} will be reused. Your cart is safe.`);
      } else if (errorCode === 'resource-exhausted') {
        setErrorMessage('The order service is temporarily busy. Please wait a minute and retry; your cart is safe.');
      } else {
        setErrorMessage('We could not save your order because of an unexpected checkout error. Please retry, or contact us if it continues. Your cart is safe.');
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleContinueAfterReceipt = () => {
    if (!pendingOrder) return;

    clearCart();
    navigate(`/success?id=${pendingOrder.orderNumber}&name=${encodeURIComponent(pendingOrder.fullName)}&city=Karachi&subtotal=${pendingOrder.subtotal}&delivery=${pendingOrder.deliveryCharge}&total=${pendingOrder.total}&pay=${pendingOrder.paymentMethod}`);
    setShowReceiptPrompt(false);
    setPendingOrder(null);
    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#0B3D2E]">No Items to Checkout</h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-2 mb-6">
          Your cart is currently empty.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#0B3D2E] text-white font-bold py-3 px-6 rounded-xl text-sm"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#0B3D2E]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B3D2E] mt-2">
            Fast Checkout &amp; Delivery
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Please enter your Karachi delivery address below. Cash on delivery is available in Karachi.
          </p>
        </div>

        {/* User Login Notification */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <span>
              <strong>Checking out as a Guest:</strong> Login is optional. If you pay via JazzCash, please take a screenshot of your payment receipt before sending it on WhatsApp for confirmation.
            </span>
          </div>
        )}

        {errorMessage && (
          <div role="alert" aria-live="assertive" className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form noValidate onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Delivery Details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Customer & Address Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-[#0B3D2E] text-[#FCE082] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0B3D2E]">
                    Delivery Address in Karachi
                  </h3>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    Karachi delivery • Rs. 150 flat fee
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name (پورا نام) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="e.g. Muhammad Ali"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value.replace(/[^\p{L}\p{M}\s.'’\-]/gu, '').slice(0, 100)); clearFieldError('fullName'); }}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={fieldErrors.fullName ? 'checkout-name-error' : undefined}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] ${fieldErrors.fullName ? 'border-red-500 bg-red-50/40' : 'border-stone-300 bg-stone-50/50'}`}
                />
                {fieldErrors.fullName && <p id="checkout-name-error" role="alert" className="mt-1 text-xs text-red-700">{fieldErrors.fullName}</p>}
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Mobile Number for Courier / WhatsApp (موبائل نمبر) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={18}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="0300 1234567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.slice(0, 18)); clearFieldError('phone'); }}
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] ${fieldErrors.phone ? 'border-red-500 bg-red-50/40' : 'border-stone-300 bg-stone-50/50'}`}
                />
                {fieldErrors.phone && <p id="checkout-phone-error" role="alert" className="mt-1 text-xs text-red-700">{fieldErrors.phone}</p>}
                {hasUnsupportedPhoneCharacters && !fieldErrors.phone && <p role="status" className="mt-1 text-xs text-amber-700">Enter numbers only; spaces, +, hyphens, and parentheses are allowed for formatting.</p>}
                <span className="text-[11px] text-stone-500 mt-1 block">
                  The courier will call or WhatsApp this number before arriving with your parcel.
                </span>
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Complete Street / House Address (مکان نمبر، گلی، اپارٹمنٹ) *
                </label>
                <textarea
                  rows={2}
                  required
                  minLength={5}
                  maxLength={300}
                  autoComplete="street-address"
                  placeholder="House / Apartment #, Street #, Block / Sector, Landmark..."
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError('address'); }}
                  aria-invalid={Boolean(fieldErrors.address)}
                  aria-describedby={fieldErrors.address ? 'checkout-address-error' : undefined}
                  className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] ${fieldErrors.address ? 'border-red-500 bg-red-50/40' : 'border-stone-300 bg-stone-50/50'}`}
                />
                {fieldErrors.address && <p id="checkout-address-error" role="alert" className="mt-1 text-xs text-red-700">{fieldErrors.address}</p>}
              </div>

              {/* Karachi area and city */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Area / District (علاقہ) *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="address-level2"
                    placeholder="e.g. Gulshan-e-Iqbal"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      setFieldErrors((current) => ({ ...current, area: undefined, address: undefined }));
                      setErrorMessage(null);
                    }}
                    aria-invalid={Boolean(fieldErrors.area)}
                    aria-describedby={fieldErrors.area ? 'checkout-area-error' : undefined}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] ${fieldErrors.area ? 'border-red-500 bg-red-50/40' : 'border-stone-300 bg-stone-50/50'}`}
                  />
                  {fieldErrors.area && <p id="checkout-area-error" role="alert" className="mt-1 text-xs text-red-700">{fieldErrors.area}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    City (شہر) *
                  </label>
                  <input
                    type="text"
                    required
                    value="Karachi"
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm text-stone-700 bg-stone-100 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  maxLength={250}
                  placeholder="e.g. Call before delivery, deliver after 2 PM..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] text-xs text-stone-900 bg-stone-50/50"
                />
              </div>

            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <span className="w-6 h-6 rounded-full bg-[#0B3D2E] text-[#FCE082] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-serif font-bold text-lg text-[#0B3D2E]">
                  Select Payment Method
                </h3>
              </div>

              {/* Cash On Delivery Option */}
              <label 
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod' 
                    ? 'border-[#0B3D2E] bg-emerald-50/40 ring-1 ring-[#0B3D2E]' 
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-[#0B3D2E] focus:ring-[#0B3D2E]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0B3D2E] flex items-center gap-2">
                      <Banknote className="h-4 w-4" aria-hidden="true" />
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Pay the cash amount to courier rider at your doorstep when you inspect your parcel. 100% risk-free.
                  </p>
                </div>
              </label>

              {/* JazzCash Option */}
              <label 
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
                  paymentMethod === 'jazzcash' 
                    ? 'border-[#0B3D2E] bg-emerald-50/40 ring-1 ring-[#0B3D2E]' 
                    : 'border-stone-200 hover:border-stone-300'
                } ${settings.jazzCashNumber ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="jazzcash"
                  checked={paymentMethod === 'jazzcash'}
                  disabled={!settings.jazzCashNumber}
                  onChange={() => setPaymentMethod('jazzcash')}
                  className="mt-1 text-[#0B3D2E] focus:ring-[#0B3D2E]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#0B3D2E] flex items-center gap-2">
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      JazzCash
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Digital Payment
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {settings.jazzCashNumber
                      ? 'Pay through JazzCash and send the transaction screenshot after placing your order.'
                      : 'JazzCash will be available after payment details are configured by the store admin.'}
                  </p>
                </div>
              </label>

              {/* JazzCash Info Box when selected */}
              {paymentMethod === 'jazzcash' && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                  <p className="font-bold text-[#0B3D2E]">Please pay via JazzCash to:</p>
                  <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-stone-500">Account Title: <strong>PATANGIA'S HERBAL</strong></p>
                      <p className="text-xs font-mono font-bold text-[#0B3D2E]">Mobile Number: {settings.jazzCashNumber}</p>
                      <p className="text-[10px] text-stone-400">Use your order total as the payment amount.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold hover:bg-stone-100 flex items-center gap-1"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  {copyError && <p role="alert" className="text-[11px] text-red-700">{copyError}</p>}
                  <p className="text-[11px] text-stone-500 italic">
                    * After placing order, send the JazzCash screenshot on WhatsApp ({settings.whatsappNumber}) along with your Order ID.
                  </p>
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xl sticky top-28 space-y-5">
              <h3 className="font-serif font-bold text-xl text-[#0B3D2E] pb-3 border-b border-stone-100">
                Your Order Summary
              </h3>

              {/* Items summary */}
              <div className="space-y-3">
                {items.map((it) => {
                  const itemOriginalPrice = it.id === PRODUCT_DETAILS.id ? getOriginalBundlePriceForCount(it.quantity) : it.originalPrice;
                  const itemDisplayPrice = it.id === PRODUCT_DETAILS.id ? getBundlePriceForCount(it.quantity) : it.price * it.quantity;

                  return (
                    <div key={it.id} className="flex items-center gap-3 py-2 border-b border-stone-100">
                      <img src={it.image} alt={it.name} className="w-12 h-12 object-contain rounded-lg bg-stone-50 p-1 border" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-stone-900">{it.name}</h4>
                        <p className="text-[11px] text-stone-500">Qty: {it.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-[#0B3D2E]">
                        Rs. {itemDisplayPrice.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-stone-600 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Bundle Savings</span>
                    <span>- Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Flat Delivery (Karachi)</span>
                  <span className="font-semibold text-stone-900">Rs. {DELIVERY_CHARGE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-stone-200">
                  <span className="text-sm font-bold text-stone-900">Total Payable</span>
                  <span className="font-serif text-2xl font-black text-[#0B3D2E]">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C9A227] hover:bg-[#D8B138] text-[#0B3D2E] font-black py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0B3D2E] border-t-transparent rounded-full animate-spin"></span>
                    Placing Your Order...
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Place Order (Rs. {finalTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

              <div className="text-center space-y-1.5 pt-2">
                <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Genuine Herbal Product with 7-Day Money Back Guarantee
                </p>
                <p className="text-[10px] text-stone-400">
                  We will call or WhatsApp you to confirm your address before dispatch.
                </p>
              </div>

            </div>
          </div>

        </form>

      </div>

      {showReceiptPrompt && pendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0B3D2E]">Take a screenshot</h3>
                <p className="text-[11px] text-stone-500">Order #{pendingOrder.orderNumber}</p>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-6">
              Please screenshot this order confirmation before continuing. Keep the order number and total visible so you can refer to them later.
            </p>

            <div className="mt-4 flex justify-between gap-4 rounded-xl bg-stone-50 px-4 py-3 text-sm">
              <span className="text-stone-600">Order total</span>
              <strong className="text-[#0B3D2E]">Rs. {pendingOrder.total.toLocaleString()}</strong>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
              <strong>{pendingOrder.paymentMethod === 'jazzcash' ? 'JazzCash:' : 'Cash on delivery:'}</strong>{' '}
              {pendingOrder.paymentMethod === 'jazzcash'
                ? 'Take a separate screenshot of your JazzCash payment receipt and send it on WhatsApp with this order number.'
                : 'Keep this order confirmation screenshot until your delivery is complete.'}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleContinueAfterReceipt}
                className="w-full bg-[#0B3D2E] text-white py-2.5 rounded-xl font-bold hover:bg-[#07261C]"
              >
                Continue to order confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
