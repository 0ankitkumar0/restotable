'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function OverviewPage() {
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
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Overview</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-blue-100 text-blue-600">📋</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">{stats.todayOrders || 0}</div>
          <div className="text-sm font-medium text-[#64748b]">Today&apos;s Orders</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-emerald-100 text-emerald-600">💰</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">₹{(stats.todayRevenue || 0).toLocaleString()}</div>
          <div className="text-sm font-medium text-[#64748b]">Today&apos;s Revenue</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-orange-100 text-orange-600">⚡</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">{stats.activeOrders || 0}</div>
          <div className="text-sm font-medium text-[#64748b]">Active Orders</div>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4 bg-purple-100 text-purple-600">🪑</div>
          <div className="text-[28px] font-extrabold text-[#1a1a2e] mb-1 leading-tight">{stats.occupiedTables || 0}/{stats.totalTables || 0}</div>
          <div className="text-sm font-medium text-[#64748b]">Tables Occupied</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Revenue (Last 7 Days)</h3>
          </div>
          <div className="h-[260px] p-5 flex items-end">
            {data?.revenueByDay?.length > 0 ? (
              <div className="flex items-end justify-around w-full h-full">
                {data.revenueByDay.map((d, i) => (
                  <div className="flex flex-col items-center gap-2 flex-1" key={i}>
                    <div className="text-[11px] font-semibold text-[#64748b]">₹{d.revenue}</div>
                    <div className="w-8 bg-[#c0392b] rounded-t transition-all duration-300" style={{ height: `${(d.revenue / maxRev) * 140}px` }}></div>
                    <div className="text-xs font-medium text-[#94a3b8]">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-[#94a3b8]">
                <p>No revenue data yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Recent Orders</h3>
          </div>
          <div className="flex-1">
            {data?.recentOrders?.length > 0 ? (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Customer</th>
                    <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Total</th>
                    <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{o.customer_name || 'Guest'}</td>
                      <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0] font-semibold">₹{o.total}</td>
                      <td className="px-5 py-4 border-b border-[#e2e8f0]">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${badgeStyles[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-10 text-[#94a3b8]">
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Order Status Breakdown</h3>
          </div>
          <div className="p-5 flex-1">
            {data?.ordersByStatus?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {data.ordersByStatus.map(s => (
                  <div key={s.status} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${badgeStyles[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                    <span className="font-bold text-lg text-[#1a1a2e]">{s.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-5 text-[#94a3b8]"><p>No data</p></div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-base font-bold text-[#1a1a2e]">Low Stock Alerts</h3>
          </div>
          <div className="p-5 flex-1">
            {data?.lowStock?.length > 0 ? (
              <div className="flex flex-col gap-0">
                {data.lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#e2e8f0] last:border-0">
                    <span className="font-medium text-[#1a1a2e] text-sm">{item.name}</span>
                    <span className="text-[#dc2626] font-bold text-sm bg-red-50 px-2 py-1 rounded">{item.quantity} {item.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-5 text-[#94a3b8]"><p>All stock levels are healthy</p></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
