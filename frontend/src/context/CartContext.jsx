import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "hariram_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [open, setOpen] = useState(false);
  const [recentNotification, setRecentNotification] = useState(null);
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1, openDrawer = false) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.sku === product.sku);
      if (idx >= 0) {
        const next = [...cur];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [
        ...cur,
        {
          sku: product.sku,
          name: product.name,
          variant: product.variant,
          price: product.price,
          image: product.image,
          quantity: qty,
        },
      ];
    });

    // Gentle bubbling feedback: pump cart badge and show floating notification pill
    setRecentNotification({ product, qty, id: Date.now() });
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 600);

    // Only open the full drawer if explicitly requested (non-disruptive!)
    if (openDrawer) {
      setOpen(true);
    }
  };

  const clearNotification = () => setRecentNotification(null);

  const setQty = (sku, quantity) => {
    setItems((cur) =>
      cur
        .map((i) => (i.sku === sku ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const remove = (sku) => setItems((cur) => cur.filter((i) => i.sku !== sku));
  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );
  const count = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const value = {
    items,
    add,
    setQty,
    remove,
    clear,
    subtotal,
    count,
    open,
    setOpen,
    recentNotification,
    clearNotification,
    isBumping,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
