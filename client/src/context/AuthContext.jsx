import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, authApi, initAuthToken, setAuthToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(initAuthToken());
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch((err) => {
        console.warn('Session expired', err);
        setAuthToken(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { token: t, user: u } = await authApi.login({ email, password });
    setAuthToken(t);
    setToken(t);
    setUser(u);
    setAuthModal({ open: false, mode: 'login' });
    return u;
  }, []);

  const register = useCallback(async ({ name, email, password, phone }) => {
    const { token: t, user: u } = await authApi.register({ name, email, password, phone });
    setAuthToken(t);
    setToken(t);
    setUser(u);
    setAuthModal({ open: false, mode: 'login' });
    return u;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const openAuth = useCallback((mode = 'login') => setAuthModal({ open: true, mode }), []);
  const closeAuth = useCallback(() => setAuthModal({ open: false, mode: 'login' }), []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, authModal, openAuth, closeAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}