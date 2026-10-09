import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  volume: string;
}

export const BASE_BOTTLE_PRICE = 700;
export const ORIGINAL_BOTTLE_PRICE = 800;

export const getBundlePriceForCount = (count: number) => {
  if (count <= 0) return 0;
  const fullBundles = Math.floor(count / 3);
  const remainder = count % 3;
  const remainderPrice = remainder === 2 ? 1350 : remainder === 1 ? BASE_BOTTLE_PRICE : 0;

  return fullBundles * 2000 + remainderPrice;
};

export const getBundleDiscountForCount = (count: number) => {
  if (count <= 0) return 0;
  return Math.max(0, count * ORIGINAL_BOTTLE_PRICE - getBundlePriceForCount(count));
};

export const getOriginalBundlePriceForCount = (count: number) => {
  if (count <= 0) return 0;
  return count * ORIGINAL_BOTTLE_PRICE;
};

export const PRODUCT_DETAILS: CartItem = {
  id: 'patangias-herbal-shampoo',
  name: "Patangia's Herbal Shampoo",
  tagline: "Nature's Goodness for Strong, Healthy & Beautiful Hair",
  price: BASE_BOTTLE_PRICE,
  originalPrice: ORIGINAL_BOTTLE_PRICE,
  quantity: 1,
  image: '/product.png',
  volume: '250 ml',
};

export const TESTING_PACK_DETAILS: CartItem = {
  id: 'patangias-herbal-shampoo-testing-pack',
  name: "Patangia's Herbal Shampoo Testing Pack",
  tagline: 'Try Patangia before choosing a full-size bottle',
  price: 100,
  originalPrice: 100,
  quantity: 1,
  image: '/tester-pack.jpg',
  volume: 'Testing pack',
};

export const DELIVERY_CHARGE = 150;

interface CartContextType {
  items: CartItem[];
  addToCart: (quantity?: number) => void;
  addTestingPack: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'patangia_cart_items_v5';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: CartItem) => {
            const product = item.id === TESTING_PACK_DETAILS.id ? TESTING_PACK_DETAILS : PRODUCT_DETAILS;
            return { ...item, price: product.price, originalPrice: product.originalPrice };
          });
        }
      }
    } catch (e) {
      console.error('Failed reading cart from localStorage', e);
    }
    return [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed writing cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === PRODUCT_DETAILS.id);
      if (existing) {
        return prev.map((i) =>
          i.id === PRODUCT_DETAILS.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...PRODUCT_DETAILS, quantity: qty }];
    });
  };

  const addTestingPack = () => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === TESTING_PACK_DETAILS.id);
      if (existing) {
        return prev.map((item) =>
          item.id === TESTING_PACK_DETAILS.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...TESTING_PACK_DETAILS }];
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => {
    if (item.id === PRODUCT_DETAILS.id) {
      return acc + getBundlePriceForCount(item.quantity);
    }
    return acc + item.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addTestingPack,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
