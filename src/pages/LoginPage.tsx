import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation, Link } from '../context/NavigationContext';

export const LoginPage: React.FC = () => {
  const { user, loginWithGoogle, logout, authError } = useAuth();
  const { navigate } = useNavigation();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoadingAction('google');
    await loginWithGoogle();
    setLoadingAction(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xl text-center">
        
        {/* Brand Emblem */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C9A227] mx-auto mb-4 bg-[#0B3D2E] p-1 shadow-md">
          <img src="/logo.png" alt="Patangia's" className="w-full h-full object-cover rounded-full" />
        </div>

        {user ? (
          /* Logged In View */
          <div className="space-y-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                You Are Logged In
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#0B3D2E] mt-1">
                Welcome, {user.displayName || user.email?.split('@')[0]}!
              </h2>
              <p className="text-xs text-stone-500 mt-1 truncate">
                {user.email}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-2">
              <p className="font-semibold text-stone-800">Your Account Benefits:</p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Automatic address saving on checkout
              </p>
              <p className="text-stone-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Easy order tracking for Karachi deliveries
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/account')}
                className="w-full border border-stone-300 bg-white py-3 px-6 rounded-2xl font-bold text-sm text-[#0B3D2E] hover:bg-stone-50 transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-[#0B3D2E] hover:bg-[#07261C] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#FCE082]" />
                <span>Continue Shopping (Rs. 700 per bottle)</span>
              </button>

              <button
                onClick={logout}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors"
              >
                Sign Out of Account
              </button>
            </div>
          </div>
        ) : (
          /* Sign In View */
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B3D2E]">
                Sign In to Patangia's
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Log in to track your shampoo orders and save your delivery address.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Notice</p>
                  <p className="text-[11px] mt-0.5">{authError}</p>
                </div>
              </div>
            )}

            <div>
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={Boolean(loadingAction)}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-stone-200 hover:border-[#0B3D2E] bg-white hover:bg-stone-50 transition-all font-bold text-xs sm:text-sm text-stone-800 shadow-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

            </div>

            {/* Guest Buying Notice */}
            <div className="pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500 mb-3">
                Don't want to create an account right now?
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-stone-100 hover:bg-stone-200 text-[#0B3D2E] font-bold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Continue as Guest (Login is Optional)
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>We never post to your profile or share your details.</span>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-stone-100">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#0B3D2E]">
            <ArrowLeft className="w-3 h-3" /> Back to Store
          </Link>
        </div>

      </div>
    </div>
  );
};
