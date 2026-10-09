import React from 'react';
import { CheckCircle2, MessageSquare, Package, ArrowRight, Truck, Home, PhoneCall, Banknote, CreditCard } from 'lucide-react';
import { useNavigation, Link } from '../context/NavigationContext';
import { toWhatsAppNumber, useStoreSettings } from '../context/StoreSettingsContext';

export const SuccessPage: React.FC = () => {
  const { searchParams } = useNavigation();
  const { settings, loading: loadingSettings, error: settingsError } = useStoreSettings();

  const orderId = searchParams.get('id') || 'PAT-10825';
  const customerName = searchParams.get('name') || 'Customer';
  const totalAmount = searchParams.get('total') || '0';
  const deliveryCharge = Number(searchParams.get('delivery') ?? 150);
  const itemsSubtotal = Number(searchParams.get('subtotal') ?? Math.max(0, Number(totalAmount) - deliveryCharge));
  const city = searchParams.get('city') || 'your city';
  const paymentMethod = searchParams.get('pay') || 'cod';

  const whatsappMessage = encodeURIComponent(
    `Salam PATANGIA'S HERBAL Team! I just placed order #${orderId}.\nItems subtotal: Rs. ${itemsSubtotal.toLocaleString()}\nDelivery fee: Rs. ${deliveryCharge.toLocaleString()}\nTotal: Rs. ${Number(totalAmount).toLocaleString()}\nPlease confirm my parcel dispatch to ${city}.`
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-20 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl text-center">
        
        {/* Animated Celebration Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-[#0B3D2E]/10 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider mb-2">
          Order Confirmed Successfully!
        </span>

        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0B3D2E]">
          Shukriya, {customerName}!
        </h1>
        
        <p className="text-stone-600 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg mx-auto">
          Your order has been received and is being prepared for delivery to {city}.
        </p>

        {/* Order Details Card */}
        <div className="bg-[#FAF8F5] rounded-2xl p-5 my-6 border border-stone-200 text-left space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200/70">
            <span className="text-xs text-stone-500 font-medium">Order Number:</span>
            <span className="font-mono text-sm sm:text-base font-black text-[#0B3D2E] bg-white px-2.5 py-0.5 rounded border border-stone-200">
              {orderId}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-200/70">
            <span className="text-xs text-stone-500 font-medium">Items Subtotal:</span>
            <span className="text-sm font-bold text-stone-800">
              Rs. {itemsSubtotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-200/70">
            <span className="text-xs text-stone-500 font-medium">Delivery Fee:</span>
            <span className="text-sm font-bold text-stone-800">
              Rs. {deliveryCharge.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-200/70">
            <span className="text-xs text-stone-500 font-medium">Total Payable:</span>
            <span className="text-base font-extrabold text-[#0B3D2E]">
              Rs. {Number(totalAmount).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-stone-200/70">
            <span className="text-xs text-stone-500 font-medium">Payment Mode:</span>
            <span className="inline-flex items-center justify-end gap-1.5 text-xs font-bold text-stone-800">
              {paymentMethod === 'cod' ? (
                <>
                  <Banknote className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Cash on Delivery (Pay to courier rider)
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />
                  JazzCash Online Payment
                </>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-500 font-medium">Delivery Coverage:</span>
            <span className="text-xs font-bold text-emerald-700">
              Karachi only
            </span>
          </div>
        </div>

        {/* Next Steps Guide */}
        <div className="text-left bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200/60 space-y-2 mb-6">
          <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-700" /> What Happens Next?
          </h3>
          <ul className="text-xs text-emerald-900 space-y-1.5 list-disc pl-4">
            <li>Our dispatch team will confirm your address via SMS or WhatsApp before dispatching.</li>
            <li>The courier rider will call your phone number before arriving at your address.</li>
            {paymentMethod === 'cod' ? (
              <li>Keep exact change of <strong>Rs. {Number(totalAmount).toLocaleString()}</strong> ready for the courier rider.</li>
            ) : (
              <li>Please share your JazzCash payment screenshot and order number on WhatsApp for confirmation.</li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={loadingSettings || settingsError ? undefined : `https://wa.me/${toWhatsAppNumber(settings.whatsappNumber)}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={loadingSettings || Boolean(settingsError)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm aria-disabled:cursor-wait aria-disabled:opacity-70"
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {loadingSettings
                ? 'Loading WhatsApp details...'
                : settingsError
                  ? 'WhatsApp details unavailable'
                  : `Chat on WhatsApp (${settings.whatsappNumber})`}
            </span>
          </a>

          <Link
            href="/"
            className="bg-[#0B3D2E] hover:bg-[#07261C] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Home className="w-4 h-4 text-[#FCE082]" />
            <span>Return to Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
