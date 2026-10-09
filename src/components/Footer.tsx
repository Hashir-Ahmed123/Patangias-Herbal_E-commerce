import React from 'react';
import { Phone, MapPin, ShieldCheck, Truck, RefreshCw, Heart, MessageSquare, Banknote, CreditCard } from 'lucide-react';
import { Link } from '../context/NavigationContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useStoreSettings();
  return (
    <footer className="bg-[#07261C] text-stone-300 border-t border-[#C9A227]/30 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust Features Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-[#0B3D2E] text-stone-100">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B3D2E]/60 border border-[#C9A227]/20">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 flex items-center justify-center text-[#FCE082] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Flat Rs. 150 Delivery</h4>
              <p className="text-xs text-stone-300">Delivery available across Karachi</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B3D2E]/60 border border-[#C9A227]/20">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 flex items-center justify-center text-[#FCE082] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Herbal &amp; Pure</h4>
              <p className="text-xs text-stone-300">No sulfates, parabens, or harsh chemicals</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B3D2E]/60 border border-[#C9A227]/20">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 flex items-center justify-center text-[#FCE082] shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">7 Days Return Guarantee</h4>
              <p className="text-xs text-stone-300">Easy exchange for any reason</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0B3D2E]/60 border border-[#C9A227]/20">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 flex items-center justify-center text-[#FCE082] shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">WhatsApp Customer Support</h4>
              <p className="text-xs text-stone-300">Daily 10:00 AM - 10:00 PM helpline</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <img
              src="/Gemini_Generated_Image_f4gnxvf4gnxvf4gn-removebg-preview.png"
              alt="Patangia's Herbal"
              className="mx-auto h-14 w-auto max-w-full object-contain"
            />
            <p className="text-xs leading-relaxed text-stone-300">
              Patangia's Herbal Shampoo is handcrafted with 12 organic Pakistani botanicals to naturally stop hair fall, nourish weak roots, and bring back natural thickness and shine.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#FDE89C] font-semibold">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Proudly Formulated &amp; Made in Pakistan</span>
            </div>
          </div>

          {/* 12 Ingredients Highlights */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold tracking-wide text-white uppercase border-b border-[#0B3D2E] pb-2">
              12 Botanical Blend
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-stone-300">
              <span>• Amla (آملہ)</span>
              <span>• Shikakai (سکاکائی)</span>
              <span>• Rosemary Oil</span>
              <span>• Flaxseed (السی)</span>
              <span>• Rose Petals (گلاب)</span>
              <span>• Methi Dana (میتھی)</span>
              <span>• Kalonji (کلونجی)</span>
              <span>• Rice Water</span>
              <span>• Vitamin E</span>
              <span>• Aritha (ریٹھا)</span>
              <span>• Aloe Vera (ایلو ویرا)</span>
              <span>• Glycerin</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold tracking-wide text-white uppercase border-b border-[#0B3D2E] pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#FCE082] transition-colors">
                  Product Details (Rs. 700 per bottle)
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FCE082] transition-colors">
                  Shopping Cart &amp; Bundle Deals
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-[#FCE082] transition-colors">
                  Fast Checkout (Cash on Delivery)
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#FCE082] transition-colors">
                  Customer Login / Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Pakistan Helpline */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold tracking-wide text-white uppercase border-b border-[#0B3D2E] pb-2">
              Helpline &amp; Orders
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              {settings.whatsappNumber
                ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span>WhatsApp: {settings.whatsappNumber}</span>
                  </div>
                )
                : <p>Configure business contact details in store settings.</p>}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#0B3D2E]/80 border border-[#C9A227]/30">
              <p className="text-[11px] text-[#FDE89C] font-semibold">Payment Methods Supported:</p>
              <div className="mt-2 space-y-2 text-[11px] text-stone-300">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 shrink-0 text-[#FCE082]" aria-hidden="true" />
                  <span>Cash on Delivery (Pay when you receive)</span>
                </div>
                {settings.jazzCashNumber && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 shrink-0 text-[#FCE082]" aria-hidden="true" />
                    <span>Pay with Jazz Cash (Pay before you receive)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#0B3D2E] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3">
          <p>© {new Date().getFullYear()} PATANGIA'S HERBAL. All rights reserved.</p>
          <p className="flex items-center gap-1 text-stone-300">
            Pure Herbs Pure Care <Heart className="w-3 h-3 text-red-400 fill-red-400 inline" />
          </p>
        </div>

      </div>
    </footer>
  );
};
