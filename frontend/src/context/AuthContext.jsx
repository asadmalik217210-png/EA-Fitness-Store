import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await api('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const onExpired = () => setUser(null);
    window.addEventListener('ea-auth-expired', onExpired);
    return () => window.removeEventListener('ea-auth-expired', onExpired);
  }, []);

  async function login(payload) {
    const data = await api('/auth/login', { method: 'POST', body: payload });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api('/auth/register', { method: 'POST', body: payload });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST', body: {} });
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh, isAdmin: user?.role === 'admin' }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
