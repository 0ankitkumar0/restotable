'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function ReportsPage() {
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await authFetch('/api/dashboard');
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  const stats = data?.stats || {};
  const maxRev = Math.max(...(data?.revenueByDay || []).map(d => d.revenue), 1);

  const badgeStyles = {
    pending: 'bg-amber-100 text-amber-700',
    pending_approval: 'bg-amber-100 text-amber-700 border border-amber-400',
    preparing: 'bg-blue-100 text-blue-600',
    ready: 'bg-indigo-100 text-indigo-600',
    completed: 'bg-green-100 text-green-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Reports</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Analytics and insights for your restaurant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-blue-100 text-blue-600">📋</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">{stats.totalOrders || 0}</div>
          <div className="text-sm font-medium text-[#64748b]">Total Orders</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-emerald-100 text-emerald-600">💰</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">₹{(stats.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-sm font-medium text-[#64748b]">Total Revenue</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-orange-100 text-orange-600">🍽</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">{stats.totalMenuItems || 0}</div>
          <div className="text-sm font-medium text-[#64748b]">Menu Items</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-purple-100 text-purple-600">🪑</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">{stats.totalTables || 0}</div>
          <div className="text-sm font-medium text-[#64748b]">Total Tables</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Revenue Trend (7 Days)</h3>
          </div>
          <div className="h-[260px] p-5 flex items-end">
            {data?.revenueByDay?.length > 0 ? (
              <div className="flex items-end justify-around w-full h-full">
                {data.revenueByDay.map((d, i) => (
                  <div className="flex flex-col items-center gap-2 flex-1" key={i}>
                    <div className="text-[11px] font-semibold text-[#64748b]">₹{d.revenue}</div>
                    <div className="w-8 bg-[#c0392b] rounded-t transition-all duration-300" style={{ height: `${(d.revenue / maxRev) * 140}px` }}></div>
                    <div className="text-xs font-medium text-[#94a3b8]">{new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-[#94a3b8]">
                <p>No revenue data yet. Complete some orders to see trends.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Orders by Status</h3>
          </div>
          <div className="p-5 flex-1">
            {data?.ordersByStatus?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.ordersByStatus.map(s => {
                  const total = data.ordersByStatus.reduce((a, b) => a + b.count, 0);
                  const pct = total > 0 ? (s.count / total * 100).toFixed(0) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${badgeStyles[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status.replace('_', ' ')}</span>
                        <span className="font-semibold text-sm text-[#1a1a2e]">{s.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#c0392b] rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-5 text-[#94a3b8]"><p>No data</p></div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm lg:col-span-2">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Summary</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-5 bg-gray-50 rounded-xl">
                <div className="text-[32px] font-extrabold text-[#c0392b] leading-tight">₹{(stats.todayRevenue || 0).toLocaleString()}</div>
                <div className="text-sm font-medium text-[#64748b] mt-1">Today&apos;s Revenue</div>
              </div>
              <div className="text-center p-5 bg-gray-50 rounded-xl">
                <div className="text-[32px] font-extrabold text-blue-600 leading-tight">{stats.todayOrders || 0}</div>
                <div className="text-sm font-medium text-[#64748b] mt-1">Today&apos;s Orders</div>
              </div>
              <div className="text-center p-5 bg-gray-50 rounded-xl">
                <div className="text-[32px] font-extrabold text-emerald-600 leading-tight">{stats.activeOrders || 0}</div>
                <div className="text-sm font-medium text-[#64748b] mt-1">Active Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
