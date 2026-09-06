import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await api('/cart');
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [user?._id || user?.id]);

  async function addItem(payload) {
    const data = await api('/cart/items', { method: 'POST', body: payload });
    setCart(data);
    setOpen(true);
    return data;
  }

  async function updateQty(itemId, quantity) {
    const prev = cart;
    setCart((c) => ({
      ...c,
      items: c.items.map((i) => (i._id === itemId ? { ...i, quantity } : i)),
    }));
    try {
      const data = await api(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } });
      setCart(data);
    } catch (err) {
      setCart(prev);
      throw err;
    }
  }

  async function removeItem(itemId) {
    const data = await api(`/cart/items/${itemId}`, { method: 'DELETE' });
    setCart(data);
  }

  const value = useMemo(
    () => ({ cart, loading, open, setOpen, refresh, addItem, updateQty, removeItem }),
    [cart, loading, open]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
