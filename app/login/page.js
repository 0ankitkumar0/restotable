'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  function getRedirectPath(role) {
    if (role === 'waiter') return '/waiter';
    if (role === 'kitchen') return '/kitchen';
    return '/dashboard';
  }

  useEffect(() => {
    if (!authLoading && user) router.push(getRedirectPath(user.role));
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      router.push(getRedirectPath(data.user.role));
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return (
    <div className="flex justify-center items-center h-[200px]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-5">
      <div className="bg-white rounded-2xl px-10 py-12 w-full max-w-[420px] shadow-xl">
        <div className="text-center mb-8">
          <img src="/web-app-manifest-512x512.png" alt="RestoTable Logo" className="w-20 h-20 mx-auto mb-4 rounded-xl shadow-lg shadow-red-900/20" />
          <h1 className="text-2xl font-bold text-[#1a1a2e] tracking-tight mb-2">RestoTable</h1>
          <p className="text-[#64748b] text-sm">Sign in to your restaurant dashboard</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-5 border border-red-200 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@restotable.com" 
              required 
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b] focus:bg-white transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b] focus:bg-white transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#c0392b] text-white font-semibold py-2.5 px-5 rounded-lg transition-all shadow-lg shadow-red-900/20 hover:bg-[#a93226] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
