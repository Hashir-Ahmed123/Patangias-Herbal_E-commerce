import React from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, ShieldCheck, ArrowLeft, Gift, Lock } from 'lucide-react';
import { DELIVERY_CHARGE, PRODUCT_DETAILS, TESTING_PACK_DETAILS, getBundleDiscountForCount, getBundlePriceForCount, getOriginalBundlePriceForCount, useCart } from '../context/CartContext';
import { useNavigation, Link } from '../context/NavigationContext';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems, addToCart } = useCart();
  const { navigate } = useNavigation();

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] py-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-md">
          <div className="w-20 h-20 rounded-full bg-[#0B3D2E]/10 text-[#0B3D2E] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0B3D2E]">Your Cart is Empty</h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 mb-8 leading-relaxed">
            Looks like you haven't added Patangia's Herbal Shampoo yet. Experience 100% natural hair care today!
          </p>
          <button
            onClick={() => {
              addToCart(1);
            }}
            className="w-full bg-[#0B3D2E] hover:bg-[#07261C] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm"
          >
            Add Patangia Shampoo (Rs. 700)
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#0B3D2E] font-semibold mt-4 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home Page
          </Link>
        </div>
      </div>
    );
  }

  const bottleQuantity = items.find((item) => item.id === PRODUCT_DETAILS.id)?.quantity ?? 0;
  const bundlePrice = getBundlePriceForCount(bottleQuantity);
  const discount = getBundleDiscountForCount(bottleQuantity);
  const finalTotal = bundlePrice + Math.max(0, totalPrice - bundlePrice) + DELIVERY_CHARGE;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Header */}
        <div className="flex flex-col items-start justify-between gap-3 mb-8 pb-4 border-b border-stone-200 sm:flex-row sm:items-center">
          <div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#0B3D2E] mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0B3D2E]">
              Your Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => {
              const itemOriginalPrice = item.id === PRODUCT_DETAILS.id ? getOriginalBundlePriceForCount(item.quantity) : item.originalPrice;
              const itemDisplayPrice = item.id === PRODUCT_DETAILS.id ? getBundlePriceForCount(item.quantity) : item.price * item.quantity;

              return (
              <div 
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-5"
              >
                {/* Product image strictly from /product.png */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F6F2EA] p-2 flex items-center justify-center shrink-0 border border-stone-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-[#C9A227] tracking-wider uppercase">
                    Herbal Blend
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#0B3D2E]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Net Volume: {item.volume}
                  </p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="font-bold text-base text-[#0B3D2E]">
                      Rs. {itemDisplayPrice.toLocaleString()}
                    </span>
                    {itemOriginalPrice > itemDisplayPrice && (
                      <span className="text-xs text-stone-400 line-through">
                        Rs. {itemOriginalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex sm:flex-col items-center justify-between gap-3 w-full sm:w-auto">
                  <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-stone-200 text-stone-700 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-stone-200 text-stone-700 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-stone-400 hover:text-red-500 p-1.5 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              );
            })}

            {/* Smart Bundle Upsell Prompt */}
            {bottleQuantity === 1 && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Gift className="h-4 w-4" aria-hidden="true" />
                    Special Bundle Offer!
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Add 1 more bottle to get 2 bottles for Rs. 1,350 (save Rs. 250).
                  </p>
                </div>
                <button
                  onClick={() => addToCart(1)}
                  className="bg-[#C9A227] hover:bg-[#D8B138] text-[#0B3D2E] text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-sm"
                >
                  + Add 1 More
                </button>
              </div>
            )}

            {/* Karachi delivery details */}
            <div className="bg-[#0B3D2E]/5 rounded-2xl p-4 border border-[#0B3D2E]/20 space-y-2 text-xs text-stone-700">
              <div className="flex items-center gap-2 text-[#0B3D2E] font-semibold">
                <Truck className="w-4 h-4 text-[#C9A227]" />
                <span>Delivery available across Karachi</span>
              </div>
              <div className="flex items-center gap-2 text-[#0B3D2E] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                <span>Cash on Delivery available in Karachi</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xl sticky top-28 space-y-5">
              <h2 className="font-serif font-bold text-xl text-[#0B3D2E] pb-3 border-b border-stone-100">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-stone-900">Rs. {totalPrice.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-red-700 font-bold">
                    <span>Bundle Savings</span>
                    <span>- Rs. {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Flat Delivery (Karachi)</span>
                  <span className="font-semibold text-stone-900">Rs. {DELIVERY_CHARGE.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-base text-[#0B3D2E] block">Total Amount</span>
                    <span className="text-[11px] text-stone-400">All taxes included</span>
                  </div>
                  <span className="font-serif text-2xl font-black text-[#0B3D2E]">
                    Rs. {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#C9A227] hover:bg-[#D8B138] text-[#0B3D2E] font-extrabold py-4 px-6 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-center">
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                  <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Safe &amp; Encrypted Checkout • No credit card needed for Cash on Delivery</span>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
