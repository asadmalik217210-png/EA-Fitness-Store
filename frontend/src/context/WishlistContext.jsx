import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  async function refresh() {
    if (!user) {
      setProducts([]);
      return;
    }
    const data = await api('/wishlist');
    setProducts(data.products || []);
  }

  useEffect(() => {
    refresh().catch(() => setProducts([]));
  }, [user?.id || user?._id]);

  function has(id) {
    return products.some((p) => p._id === id);
  }

  async function toggle(productId) {
    const data = await api('/wishlist/toggle', { method: 'POST', body: { productId } });
    setProducts(data.products || []);
    return data.added;
  }

  const value = useMemo(() => ({ products, has, toggle, refresh }), [products]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
