import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  batch_id: number;
  product_id: number;
  product_name: string;
  batch_no: string;
  unit_price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    batch: { batch_id: number; product_id: number; product_name: string; batch_no: string; unit_price: number },
    quantity: number
  ) => void;
  removeFromCart: (batch_id: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (
    batch: { batch_id: number; product_id: number; product_name: string; batch_no: string; unit_price: number },
    quantity: number
  ) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.batch_id === batch.batch_id);
      if (existing) {
        return prev.map((item) =>
          item.batch_id === batch.batch_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...batch, quantity }];
    });
  };

  const removeFromCart = (batch_id: number) => {
    setItems((prev) => prev.filter((item) => item.batch_id !== batch_id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export default CartContext;
