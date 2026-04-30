'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/kitchen', label: 'Active Orders', icon: '🍳' },
];

export default function KitchenLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
    if (!loading && user && user.role !== 'kitchen' && user.role !== 'admin') {
      router.push(`/${user.role === 'waiter' ? 'waiter' : 'dashboard'}`);
    }
  }, [user, loading, router]);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );
  if (!user || (user.role !== 'kitchen' && user.role !== 'admin')) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f0f4f8]">
      {/* Mobile top bar */}
      <div className="md:hidden bg-white border-b border-[#e2e8f0] p-4 flex items-center justify-between sticky top-0 z-[90] shadow-sm">
        <button className="text-[#1a1a2e] text-2xl p-1" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 bg-[#c0392b] rounded-lg flex items-center justify-center text-white text-sm">🍽</span>
          <span className="font-bold text-[#1a1a2e]">RestoTable</span>
        </div>
        <div className="w-9"></div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[95] md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c0392b] rounded-lg flex items-center justify-center text-white text-lg shrink-0">🍳</div>
          <div>
            <h2 className="text-[17px] font-bold text-[#1a1a2e] leading-tight">RestoTable</h2>
            <span className="text-xs text-[#94a3b8] font-medium">Kitchen Panel</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(item => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${pathname === item.href ? 'bg-[#fdf2f0] text-[#c0392b] font-semibold' : 'text-[#64748b] hover:bg-[#f7f5f3] hover:text-[#1a1a2e]'}`}
            >
              <span className="w-5 h-5 flex items-center justify-center text-[18px] shrink-0">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-5 border-t border-[#e2e8f0]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c0392b] to-[#e74c3c] flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user.name?.[0] || 'K'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-[13px] font-semibold text-[#1a1a2e] leading-tight truncate">{user.name}</h4>
              <p className="text-xs text-[#64748b] truncate">{user.email}</p>
            </div>
          </div>
          <button 
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#e74c3c] hover:bg-[#fef2f2] rounded-lg transition-colors flex items-center gap-2"
            onClick={() => { logout(); router.push('/'); }}
          >
            ↪ Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 md:ml-[260px] p-5 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
