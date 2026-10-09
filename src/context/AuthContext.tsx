import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;

      setUser(currentUser);
      setIsAdmin(false);
      setLoading(Boolean(currentUser));

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const [tokenResult, adminDocument] = await Promise.all([
          currentUser.getIdTokenResult(),
          getDoc(doc(db, 'admins', currentUser.uid)),
        ]);
        if (active && auth.currentUser?.uid === currentUser.uid) {
          setIsAdmin(tokenResult.claims.admin === true || adminDocument.exists());
        }
      } catch (error) {
        if (active && auth.currentUser?.uid === currentUser.uid) {
          console.error('Could not verify Firebase admin access:', error);
        }
      }

      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || 'Customer',
          createdAt: new Date().toISOString(),
        }, { merge: true });
      } catch (error) {
        console.warn('Could not sync user profile to Firestore:', error);
      } finally {
        if (active && auth.currentUser?.uid === currentUser.uid) {
          setLoading(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        setAuthError(error?.message || 'Could not sign in with Google. Please try again.');
      }
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        loginWithGoogle,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
