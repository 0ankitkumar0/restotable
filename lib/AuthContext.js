'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('restotable_token');
    if (saved) {
      setToken(saved);
      fetchUser(saved);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser(t) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(t);
      } else {
        localStorage.removeItem('restotable_token');
        setToken(null);
      }
    } catch (e) {
      console.error('Fetch User Error:', e);
      localStorage.removeItem('restotable_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('restotable_token', data.token);
    return data;
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('restotable_token');
  }

  function authFetch(url, options = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const fullUrl = url.startsWith('/') ? url : url;
    
    return fetch(fullUrl, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
