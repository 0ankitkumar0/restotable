'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function OrdersPage() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, [filter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const url = filter ? `/api/orders?status=${filter}` : '/api/orders';
      const res = await authFetch(url);
      if (res.ok) { const d = await res.json(); setOrders(d.orders || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function updateStatus(id, status) {
    try {
      await authFetch(`/api/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadOrders();
    } catch (e) { console.error(e); }
  }

  const statusFilters = ['', 'pending', 'pending_approval', 'preparing', 'ready', 'completed', 'cancelled'];
  
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
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Orders</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Manage and track all restaurant orders.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {statusFilters.map(s => (
          <button 
            key={s} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-colors ${filter === s ? 'bg-[#c0392b] text-white' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
            onClick={() => setFilter(s)}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No orders found</h3>
          <p className="text-sm">Orders will appear here when customers place them.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 transition-shadow hover:shadow-sm" key={order.id || order._id}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[15px] font-semibold text-[#1a1a2e]">Order #{(order.id || order._id).slice(0, 8)}</h4>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${badgeStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-4 text-[13px] text-[#94a3b8] mb-3">
                <span>👤 {order.customer_name || 'Guest'}</span>
                {order.table_number && <span>🪑 Table {order.table_number}</span>}
                <span>🕐 {new Date(order.created_at || order.createdAt).toLocaleString()}</span>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="text-[13px] text-[#64748b] mb-3">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.quantity}x {item.item_name}{i < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                <div className="text-base font-bold text-[#c0392b]">₹{order.total}</div>
                <div className="flex gap-2">
                  {order.status === 'pending_approval' && (
                    <>
                      <button className="px-3 py-1.5 bg-[#c0392b] text-white rounded-md text-sm font-semibold hover:bg-[#a93226] transition-colors" onClick={() => updateStatus(order.id || order._id, 'pending')}>Approve</button>
                      <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-semibold hover:bg-red-200 transition-colors" onClick={() => updateStatus(order.id || order._id, 'cancelled')}>Reject</button>
                    </>
                  )}
                  {order.status === 'pending' && (
                    <>
                      <button className="px-3 py-1.5 bg-[#c0392b] text-white rounded-md text-sm font-semibold hover:bg-[#a93226] transition-colors" onClick={() => updateStatus(order.id || order._id, 'preparing')}>Accept</button>
                      <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-semibold hover:bg-red-200 transition-colors" onClick={() => updateStatus(order.id || order._id, 'cancelled')}>Cancel</button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors" onClick={() => updateStatus(order.id || order._id, 'ready')}>Mark Ready</button>
                  )}
                  {order.status === 'ready' && (
                    <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors" onClick={() => updateStatus(order.id || order._id, 'completed')}>Complete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
