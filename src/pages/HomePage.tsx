import React, { useState } from 'react';
import { 
  Check, 
  Star, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  ChevronDown, 
  Heart, 
  Leaf, 
  Award, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { useCart, PRODUCT_DETAILS } from '../context/CartContext';
import { useNavigation, Link } from '../context/NavigationContext';

export const HomePage: React.FC = () => {
  const { addToCart, addTestingPack } = useCart();
  const { navigate } = useNavigation();

  const [quantity, setQuantity] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState<1 | 2 | 3>(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToCart = (qty: number) => {
    addToCart(qty);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = (qty: number) => {
    addToCart(qty);
    navigate('/cart');
  };

  // 12 Ingredients with simple descriptions & Urdu names for local Pakistani audience
  const ingredients = [
    {
      name: 'Amla',
      urdu: 'آملہ',
      benefit: 'Rich in Vitamin C. Makes hair roots strong and gives dark, rich black color.',
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    },
    {
      name: 'Shikakai',
      urdu: 'سکاکائی',
      benefit: 'Natural gentle cleanser. Removes dirt and oil without drying the scalp.',
      color: 'bg-amber-50 text-amber-900 border-amber-200'
    },
    {
      name: 'Rosemary',
      urdu: 'روزمیری',
      benefit: 'Stimulates blood circulation in the scalp to awaken sleeping hair follicles.',
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    },
    {
      name: 'Flaxseed',
      urdu: 'السی کا بیج',
      benefit: 'Packed with Omega-3. Tames frizzy hair and provides a silk-smooth shine.',
      color: 'bg-amber-50 text-amber-900 border-amber-200'
    },
    {
      name: 'Rose Petals',
      urdu: 'تازہ گلاب',
      benefit: 'Soothes heated scalp, leaves refreshing natural fragrance, and locks in moisture.',
      color: 'bg-rose-50 text-rose-900 border-rose-200'
    },
    {
      name: 'Methi Dana',
      urdu: 'میتھی دانہ',
      benefit: 'Known as the ultimate hair fall fighter. Reduces dandruff and dry scalp flakes.',
      color: 'bg-amber-50 text-amber-900 border-amber-200'
    },
    {
      name: 'Kalonji',
      urdu: 'کلونجی',
      benefit: 'Sunnah herb with potent antioxidants. Helps prevent premature gray hair.',
      color: 'bg-stone-50 text-stone-900 border-stone-200'
    },
    {
      name: 'Rice Water',
      urdu: 'چاول کا پانی',
      benefit: 'Ancient Asian secret full of amino acids that repair damaged hair strands.',
      color: 'bg-blue-50 text-blue-900 border-blue-200'
    },
    {
      name: 'Vitamin E',
      urdu: 'وٹامن ای',
      benefit: 'Deep antioxidant nourishment that shields hair from sun and Pakistan heat.',
      color: 'bg-yellow-50 text-yellow-900 border-yellow-200'
    },
    {
      name: 'Aritha',
      urdu: 'ریٹھا',
      benefit: 'Creates natural, chemical-free foaming that gently purifies each hair strand.',
      color: 'bg-amber-50 text-amber-900 border-amber-200'
    },
    {
      name: 'Aloe Vera',
      urdu: 'ایلو ویرا',
      benefit: 'Hydrates dry hair, relieves scalp itchiness, and gives natural salon softness.',
      color: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    },
    {
      name: 'Glycerin',
      urdu: 'خالص گلیسرین',
      benefit: 'Draws moisture from the air to keep your hair soft, bouncy, and hydrated all day.',
      color: 'bg-cyan-50 text-cyan-900 border-cyan-200'
    }
  ];

  // 6 Core Benefits requested by user
  const coreBenefits = [
    {
      title: 'Natural',
      desc: 'Handcrafted with pure Pakistani herbs, raw extracts, and essential oils. No harmful chemicals.',
      icon: Leaf,
    },
    {
      title: 'Stronger Hair Roots',
      desc: 'Deeply nourishes weak roots so your hair stays firmly rooted and resists daily breakage.',
      icon: Shield,
    },
    {
      title: 'Less Hair Fall',
      desc: 'Customers notice a visible reduction in hair shedding in hairbrush and shower after 2-3 weeks.',
      icon: Award,
    },
    {
      title: 'Longer & Thicker Hair',
      desc: 'Boosts natural hair growth cycle for noticeably denser, voluminous, and bouncy hair.',
      icon: Zap,
    },
    {
      title: 'Helps Stop Early White Hair',
      desc: 'Infused with Kalonji and Amla to protect natural hair melanin and delay premature graying.',
      icon: Sparkles,
    },
    {
      title: 'No Harmful Chemicals',
      desc: 'Zero sulfates, zero parabens, zero silicones, and zero synthetic artificial dyes.',
      icon: ShieldCheck,
    },
  ];

  // Karachi Customer Reviews
  const reviews = [
    {
      name: 'Mrs. Nusrat Salam',
      city: 'Karachi',
      rating: 5,
      date: '3 days ago',
      title: 'A Truly Natural & Wonderful Shampoo',
      comment: 'Ma Sha Allah, I really loved the shampoo. It feels like it has genuinely been made from real, natural ingredients. After using it, my hair felt very good, less tangled, and much easier to comb. I’m really happy with the results and will definitely continue using it. Ma Sha Allah, you have made a wonderful shampoo. JazakAllah Khair!'
    },
    {
      name: 'Mr. Tasleem',
      city: 'Karachi',
      rating: 5,
      date: '5 days ago',
      title: 'Good Results Even Halfway Through',
      comment: 'Ma Sha Allah, I’m getting really good results from this shampoo. I’ve used about half the bottle so far, and even with half a bottle, my hair has become quite silky. I’ve also started noticing that my hair is becoming a little darker. I still have half the bottle left, In Sha Allah I’ll continue using it. So far, the results are really good. Good shampoo!'
    },
    {
      name: 'Ms. Sana Farhan',
      city: 'Karachi',
      rating: 5,
      date: '1 day ago',
      title: 'Amazing Results with Shine & Softness',
      comment: 'It is honestly amazing. I’ve used it for two washes so far, and I’m really happy with the results. I think you should definitely continue with this product. In Sha Allah, I’ll place an order once you officially start. My husband also really liked it because the results were genuinely very good. The shine and softness it brought to my hair were amazing. Thank you so much, and best of luck to you!'
    },
    {
      name: 'Mr. Kashan Nawaz',
      city: 'Karachi',
      rating: 5,
      date: '3 weeks ago',
      title: 'Really Happy with the Results',
      comment: 'I’ve been using this shampoo and I’m really happy with the results so far. The quality feels very good, and after using it, my hair feels softer, smoother, and much easier to manage. I especially liked the natural feel of the shampoo and how fresh my hair feels after every wash. I’ll definitely continue using it and would recommend giving it a try. Overall, I’m very satisfied with the product. Keep up the great work!'
    }
  ];

  const faqs = [
    {
      q: 'How long will it take to see visible results?',
      a: 'Most customers notice less hair fall in just 10 to 14 days of regular use (2 to 3 times a week). For increased hair density and thickness, use consistently for 4 to 6 weeks.'
    },
    {
      q: 'How do I pay? Is Cash on Delivery available in Karachi?',
      a: 'Cash on Delivery and Online payment methods are both available'
    },
    {
      q: 'How much does Patangia Herbal Shampoo cost?',
      a: 'Patangia Herbal Shampoo is Rs. 800 for one 250 ml bottle.'
    },
    {
      q: 'How to use Patangia Herbal Shampoo for best results?',
      a: 'Step 1: Wet your hair thoroughly with water. Step 2: Take 2-3 pumps of shampoo and gently massage into your scalp for 2 minutes to let the 12 herbs absorb. Step 3: Rinse with plain water.'
    },
    {
      q: 'Can both men and women use this shampoo?',
      a: 'Yes, Patangia Herbal Shampoo is formulated for both men and women suffering from hair fall, thinning hair, or early graying.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      
      {/* Toast Notification when item added */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3D2E] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#C9A227] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#FCE082]" />
          <div>
            <p className="text-xs font-bold text-white">Added to your cart!</p>
            <p className="text-[11px] text-stone-200">Your selected pack is ready.</p>
          </div>
          <Link href="/cart" className="ml-2 text-xs bg-[#C9A227] text-[#0B3D2E] font-bold px-3 py-1 rounded-lg hover:bg-white transition-colors">
            View Cart
          </Link>
        </div>
      )}

      {/* Hero Section Banner */}
      <section className="home-hero relative overflow-hidden border-b border-[#C9A227]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E4837]/80 border border-[#C9A227]/45 text-[#FDE89C] text-[11px] font-bold tracking-[0.18em] shadow-lg backdrop-blur-sm">
                <Leaf className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>NATURAL HERBAL FORMULA</span>
              </div>

              <div className="max-w-xl">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
                  Patangia&apos;s Herbal
                  <span className="mt-2 block text-[#FCE082] italic font-normal">Shampoo</span>
                </h1>
                <p className="mt-4 max-w-lg text-base sm:text-xl text-[#F2EBD8] font-medium leading-relaxed">
                  Nature&apos;s Goodness for Strong, Healthy &amp; Beautiful Hair
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 pt-2 max-w-xl">
                <div className="flex min-w-0 items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F3E9D5]"><Check className="w-4 h-4 text-[#FCE082] shrink-0" /><span className="min-w-0 leading-snug">Stops Hair Fall</span></div>
                <div className="flex min-w-0 items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F3E9D5]"><Check className="w-4 h-4 text-[#FCE082] shrink-0" /><span className="min-w-0 leading-snug">Stronger Roots</span></div>
                <div className="flex min-w-0 items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F3E9D5]"><Check className="w-4 h-4 text-[#FCE082] shrink-0" /><span className="min-w-0 leading-snug">12 Organic Herbs</span></div>
                <div className="flex min-w-0 items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F3E9D5]"><Check className="w-4 h-4 text-[#FCE082] shrink-0" /><span className="min-w-0 leading-snug">Prevents White Hair</span></div>
                <div className="flex min-w-0 items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F3E9D5]"><Check className="w-4 h-4 text-[#FCE082] shrink-0" /><span className="min-w-0 leading-snug">No Harmful Chemicals</span></div>
                <div className="flex min-w-0 items-center gap-2.5 text-xs sm:text-sm font-medium text-[#F3E9D5]"><Check className="w-4 h-4 text-[#FCE082] shrink-0" /><span className="min-w-0 leading-snug">Rs. 150 Flat Delivery</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-[#FCE082]/35 bg-[#0F4C3A]/70 p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm max-w-xl">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="font-serif text-4xl sm:text-5xl font-black leading-none text-white">Rs. 700</span>
                    <span className="font-serif text-lg font-semibold leading-none text-white/70 line-through decoration-2 decoration-[#FCE082]">Rs. 800</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="flex text-[#FCE082]" aria-label="Rated 4.9 out of 5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <span className="text-xs font-medium text-[#E9DFC7]">4.9 / 5.0 · Verified Customer Reviews</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-white/15 pt-3 sm:border-l sm:border-t-0 sm:pt-0 sm:pl-5">
                  <Truck className="h-5 w-5 shrink-0 text-[#FCE082]" aria-hidden="true" />
                  <div>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#FDE89C]">Across Karachi</span>
                    <span className="text-xs text-stone-200">Rs. 150 flat delivery per order</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
                <button
                  onClick={() => handleAddToCart(quantity)}
                  className="bg-[#C9A227] hover:bg-[#D8B138] text-[#0B3D2E] font-bold py-4 px-6 rounded-2xl shadow-[0_16px_30px_rgba(201,162,39,0.35)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="w-5 h-5 text-[#0B3D2E]" />
                  <span>Add to Cart</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-200 pt-2 max-w-xl">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#C9A227]" />100% Money Back Guarantee</span>
                <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-[#C9A227]" />Delivery in 2-4 Days</span>
              </div>

              <picture className="home-hero-mobile-art mx-auto block md:hidden">
                <source
                  type="image/webp"
                  srcSet="/lush-forest-vertical-480.webp 480w, /lush-forest-vertical-768.webp 768w"
                  sizes="calc(100vw - 32px)"
                />
                <img
                  src="/lush-forest-vertical.png"
                  alt="Patangia's Herbal Shampoo amber bottles with the 250 ml original bottle seal in a lush forest"
                  width={768}
                  height={1330}
                  fetchPriority="high"
                  className="block h-auto w-full"
                />
              </picture>
            </div>
          </div>
        </div>
      </section>

      {/* Special Deals / Bundles Section */}
      <section className="py-16 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B3D2E]">
              Save More With Bundles
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
              Choose Your Package
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2">
              Rs. 150 flat delivery across Karachi. Cash on Delivery available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div 
              onClick={() => setSelectedBundle(1)}
              className={`cursor-pointer rounded-3xl p-6 bg-white transition-all border-2 relative ${
                selectedBundle === 1 
                  ? 'border-[#0B3D2E] shadow-xl ring-2 ring-[#0B3D2E]/20' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <img
                src="/1.jpg"
                alt="One Patangia herbal shampoo bottle with herbs"
                loading="lazy"
                className="mb-4 aspect-[4/3] w-full rounded-xl bg-[#FAF8F5] object-contain"
              />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">1 Bottle (Starter Pack)</h3>
              <p className="text-xs text-stone-500 mt-1">1 Month Supply (250 ml)</p>
              
              <div className="mt-4 mb-6">
                <span className="text-2xl font-black text-[#0B3D2E]">Rs. 700</span>
                <span className="text-xs text-stone-400 line-through ml-2">Rs. 800</span>
                <span className="text-[11px] block text-emerald-600 font-bold mt-1">Save Rs. 100 on the bundle</span>

              </div>

              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Delivery across Karachi
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Save Rs. 100 on the bundle
                </li>
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow(1);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedBundle === 1
                    ? 'bg-[#0B3D2E] text-white hover:bg-[#07261C]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Buy 1 Bottle (Rs. 700)
              </button>
            </div>

            <div 
              onClick={() => setSelectedBundle(2)}
              className={`cursor-pointer rounded-3xl p-6 bg-white transition-all border-2 relative ${
                selectedBundle === 2 
                  ? 'border-[#C9A227] shadow-2xl ring-2 ring-[#C9A227]/30 scale-105 z-10' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-[#C9A227] text-[#0B3D2E] text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow whitespace-nowrap">
                <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                <span>Most Popular (Save Rs. 250)</span>
              </div>

              <img
                src="/2.jpg"
                alt="Two Patangia herbal shampoo bottles with herbs"
                loading="lazy"
                className="mb-4 aspect-[4/3] w-full rounded-xl bg-[#FAF8F5] object-contain"
              />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">2 Bottles Pack</h3>
              <p className="text-xs text-stone-500 mt-1">2 Months Full Regrowth Treatment (500 ml)</p>
              
              <div className="mt-4 mb-6">
                <span className="text-2xl font-black text-[#0B3D2E]">Rs. 1,350</span>
                <span className="text-xs text-stone-400 line-through ml-2">Rs. 1,600</span>
                <span className="text-[11px] block text-emerald-600 font-bold mt-1">Save Rs. 250 on the bundle</span>
              </div>

              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Delivery across Karachi
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Rs. 250 bundle discount applied
                </li>
      
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow(2);
                }}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#C9A227] text-[#0B3D2E] hover:bg-[#D8B138] shadow-md transition-all"
              >
                Buy 2 Bottles (Rs. 1,350)
              </button>
            </div>

            <div 
              onClick={() => setSelectedBundle(3)}
              className={`cursor-pointer rounded-3xl p-6 bg-white transition-all border-2 relative ${
                selectedBundle === 3 
                  ? 'border-[#0B3D2E] shadow-xl ring-2 ring-[#0B3D2E]/20' 
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B3D2E] text-[#FDE89C] text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow whitespace-nowrap">
                Best Value (Save Rs. 400)
              </div>

              <img
                src="/3.jpg"
                alt="Three Patangia herbal shampoo bottles with herbs"
                loading="lazy"
                className="mb-4 aspect-[4/3] w-full rounded-xl bg-[#FAF8F5] object-contain"
              />
              <h3 className="font-serif text-lg font-bold text-[#0B3D2E]">3 Bottles Family Pack</h3>
              <p className="text-xs text-stone-500 mt-1">Full Family Hair Care (750 ml)</p>
              
              <div className="mt-4 mb-6">
                <span className="text-2xl font-black text-[#0B3D2E]">Rs. 2,000</span>
                <span className="text-xs text-stone-400 line-through ml-2">Rs. 2,400</span>
                <span className="text-[11px] block text-emerald-600 font-bold mt-1">Save Rs. 400 on the bundle</span>
              </div>

              <ul className="space-y-2 text-xs text-stone-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Delivery across Karachi
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Rs. 400 bundle discount
                </li>
              </ul>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow(3);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedBundle === 3
                    ? 'bg-[#0B3D2E] text-white hover:bg-[#07261C]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Buy 3 Bottles (Rs. 2,000)
              </button>
            </div>

          </div>

        </div>
      </section>

      <section className="py-12 bg-[#F4EFE6] border-y border-stone-300/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 max-w-xl text-center sm:text-left">
            <img
              src="/tester-pack.jpg"
              alt="Patangia Herbal Shampoo Testing Pack"
              className="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-xl border border-stone-300 shadow-sm bg-white"
            />
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0B3D2E]">Want to try it first?</h2>
              <p className="text-sm text-stone-600 mt-1">Get a Testing Pack for Rs. 100. Flat Rs. 150 delivery across Karachi.</p>
            </div>
          </div>
          <button
            onClick={() => {
              addTestingPack();
              setAddedToast(true);
              setTimeout(() => setAddedToast(false), 3000);
            }}
            className="shrink-0 bg-[#0B3D2E] hover:bg-[#07261C] text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-colors"
          >
            Order Testing Pack · Rs. 100
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-10">
        <div className="relative rounded-3xl overflow-hidden border border-[#C9A227]/40 shadow-2xl">
          <img 
            src="/banner.png" 
            alt="Patangia's Herbal Shampoo Special Offer Banner" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* 6 Key Benefits Section */}
      <section id="benefits" className="scroll-mt-28 py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <article className="mx-auto mb-14 max-w-4xl border-y border-[#C9A227]/40 py-8 text-center sm:py-10">
            <p className="text-xs font-bold uppercase text-[#997711]">A Message from the Founder</p>
            <h2 className="mt-2 font-serif text-xl font-bold text-[#0B3D2E] sm:text-2xl">
              Mrs. Tasneem Iqbal Patangia
            </h2>
            <h3 className="mt-1 text-sm font-semibold text-stone-700">Patangia Herbal Shampoo</h3>

            <div className="mx-auto mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
              <p>
                Our purpose is not only to create a herbal product, but also to contribute to the well-being of humanity.
              </p>
              <p>
                We want this work to become a means of helping people, supporting families, and spreading goodness in our society. If our efforts can bring even a small positive change to someone’s life, we consider that a meaningful achievement.
              </p>
              <p className="font-serif text-base font-semibold text-[#0B3D2E] sm:text-lg">
                Patangia Herbal Shampoo — created with care, with sincerity, and for the betterment of humanity.
              </p>
            </div>

            <p className="mt-6 text-sm font-semibold text-[#0B3D2E]">— Mrs. Tasneem Iqbal Patangia</p>
            <p className="mt-1 text-xs text-stone-500">Founder, Patangia Herbal Shampoo</p>
          </article>

          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0B3D2E]/10 text-[#0B3D2E] text-xs font-bold uppercase tracking-widest mb-3">
              Pure Herbs Pure Care
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3D2E]">
              Our Values
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
              Pure herbal care, thoughtfully crafted for stronger, healthier-looking hair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreBenefits.map((benefit, index) => {
              const IconComp = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-3xl p-7 shadow-sm hover:shadow-xl transition-all border border-stone-200/80 hover:border-[#C9A227] group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#0B3D2E] text-[#FCE082] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0B3D2E] mb-2 group-hover:text-[#997711] transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 12 Ingredients Showcase Section */}
      <section id="ingredients" className="scroll-mt-28 py-16 bg-[#0B3D2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FCE082]">
              Transparent Formula
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2">
              The 12 Powerful Herbal Ingredients
            </h2>
            <p className="mt-3 text-[#E2DAC9] text-sm sm:text-base leading-relaxed">
              Every single herb is hand-picked, organically sourced, and blended in balanced proportions for maximum hair revitalization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ingredients.map((item, index) => (
              <div 
                key={index}
                className="bg-[#07261C] rounded-2xl p-5 border border-[#C9A227]/30 hover:border-[#FCE082] transition-all hover:-translate-y-1 shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C9A227] text-[#0B3D2E] font-black text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h4 className="font-bold text-base text-white">{item.name}</h4>
                  </div>
                  <span className="text-sm font-semibold text-[#FCE082] font-serif">
                    {item.urdu}
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {item.benefit}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* How To Use in 3 Simple Steps */}
      <section className="py-16 bg-[#F4EFE6] border-y border-stone-300/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B3D2E]">
              Simple Application
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
              How to Use for Best Results
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2">
              Follow these simple 3 steps 2 to 3 times a week for maximum hair nourishment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-[#0B3D2E] text-[#FCE082] font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0B3D2E] mb-2">Wet Your Hair</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Rinse hair with normal warm water to prepare scalp pores and remove loose dust.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-[#0B3D2E] text-[#FCE082] font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0B3D2E] mb-2">Massage for 2 Minutes</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Take 2 pumps of Patangia shampoo. Gently massage roots with fingertips so the 12 herbs absorb deep.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-[#0B3D2E] text-[#FCE082] font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-[#0B3D2E] mb-2">Rinse Thoroughly</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Wash away with fresh water. Enjoy soft, bouncy hair with no sticky artificial residue.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="scroll-mt-28 py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1 text-[#C9A227] mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3D2E]">
              What Our Customers Say
            </h2>
            <p className="text-stone-600 text-sm mt-2">
              Real feedback from verified Pakistani buyers across Karachi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#C9A227]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-stone-400">{rev.date}</span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-[#0B3D2E] mb-2">"{rev.title}"</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-stone-800">{rev.name}</h5>
                    <span className="text-[10px] text-stone-500">{rev.city}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Buyer ✓
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="scroll-mt-28 py-16 bg-[#F4EFE6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B3D2E]">
              Got Questions?
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#0B3D2E] mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-2">
              Everything you need to know about delivery, usage, and ingredients
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    id={`faq-question-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-[#0B3D2E]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-[#C9A227] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
