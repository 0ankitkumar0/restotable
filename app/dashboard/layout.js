'use client';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/orders', label: 'Orders', icon: '📋' },
  { href: '/dashboard/menu', label: 'Menu', icon: '🍽' },
  { href: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
  { href: '/dashboard/tables', label: 'Tables & QR', icon: '🪑' },
  { href: '/dashboard/reports', label: 'Reports', icon: '📈' },
  { href: '/dashboard/staff', label: 'Staff', icon: '👥' },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <aside className="w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col fixed top-0 left-0 bottom-0 z-[100] transition-transform duration-200">
        <div className="px-5 py-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c0392b] rounded-lg flex items-center justify-center text-white text-lg shrink-0">🍽</div>
          <div>
            <h2 className="text-[17px] font-bold text-[#1a1a2e] leading-tight">RestoTable</h2>
            <span className="text-xs text-[#94a3b8] font-medium">Restaurant Dashboard</span>
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
              {user.name?.[0] || 'A'}
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
      <main className="flex-1 ml-[260px] p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
