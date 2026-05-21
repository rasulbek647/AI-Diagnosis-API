// AuthContext.jsx — Authentication state management
import { createContext, useContext, useState, useEffect } from 'react';
import api, { clearAuthStorage, saveAuthTokens } from '../api/axios';

const AuthContext = createContext(null);

const isDemo = import.meta.env.VITE_DEMO === 'true';

const DEMO_USER = {
  id: 'demo',
  full_name: 'Main Admin',
  email: 'admin123@gmail.com',
  role: 'admin',
  is_active: true,
  created_at: new Date().toISOString(),
};

function persistSession(data) {
  saveAuthTokens(data);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (isDemo ? DEMO_USER : null));
  const [token, setToken] = useState(() =>
    isDemo ? 'demo' : localStorage.getItem('medai_token')
  );
  const [loading, setLoading] = useState(() => !isDemo);

  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch {
        const refresh = localStorage.getItem('medai_refresh_token');
        if (refresh) {
          try {
            const { data } = await api.post('/auth/refresh', { refresh_token: refresh });
            persistSession(data);
            setToken(data.access_token);
            setUser(data.user);
            setLoading(false);
            return;
          } catch {
            /* fall through */
          }
        }
        clearAuthStorage();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    if (isDemo) {
      localStorage.setItem('medai_token', 'demo');
      setToken('demo');
      setUser(DEMO_USER);
      return { access_token: 'demo', user: DEMO_USER };
    }
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const register = async (fullName, email, password) => {
    if (isDemo) {
      const u = { ...DEMO_USER, full_name: fullName, email };
      localStorage.setItem('medai_token', 'demo');
      setToken('demo');
      setUser(u);
      return { access_token: 'demo', user: u };
    }
    const { data } = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
    });
    persistSession(data);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
