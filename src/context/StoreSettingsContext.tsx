import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface StoreSettings {
  whatsappNumber: string;
  jazzCashNumber: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: '',
  jazzCashNumber: '',
};

interface StoreSettingsContextValue {
  settings: StoreSettings;
  saveSettings: (settings: StoreSettings) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const StoreSettingsContext = createContext<StoreSettingsContextValue | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => onSnapshot(
    doc(db, 'settings', 'store'),
    (snapshot) => {
      const storedSettings = snapshot.data();
      setSettings({
        whatsappNumber: typeof storedSettings?.whatsappNumber === 'string' ? storedSettings.whatsappNumber : DEFAULT_SETTINGS.whatsappNumber,
        jazzCashNumber: typeof storedSettings?.jazzCashNumber === 'string' ? storedSettings.jazzCashNumber : DEFAULT_SETTINGS.jazzCashNumber,
      });
      setError(null);
      setLoading(snapshot.metadata.fromCache);
    },
    (snapshotError) => {
      console.error('Could not load store settings:', snapshotError);
      setError(snapshotError.code === 'permission-denied'
        ? 'Firestore denied access to store settings. Check that your Firestore rules are published to the configured database.'
        : 'Store settings could not be loaded. Contact details may be unavailable.');
      setLoading(false);
    }
  ), []);

  const saveSettings = async (nextSettings: StoreSettings) => {
    setError(null);
    try {
      await setDoc(doc(db, 'settings', 'store'), {
        whatsappNumber: nextSettings.whatsappNumber.trim(),
        jazzCashNumber: nextSettings.jazzCashNumber.trim(),
      });
    } catch (saveError) {
      console.error('Could not save store settings:', saveError);
      const errorCode = (saveError as { code?: string })?.code;
      setError(errorCode === 'permission-denied'
        ? 'Firestore denied the save. Check that your Firestore rules are published and that you are signed in with a configured store admin account.'
        : 'Settings could not be saved. Check your connection and try again.');
      throw saveError;
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, saveSettings, loading, error }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  return context;
};

export const toWhatsAppNumber = (phoneNumber: string) => {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
};