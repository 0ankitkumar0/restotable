'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function WaiterOrdersPage() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, [filter]);

  // Auto-refresh every 10 seconds for new approval requests
  useEffect(() => {
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

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

  const statusFilters = ['', 'pending_approval', 'pending', 'preparing', 'ready', 'completed'];
  const filterLabels = { '': 'All', pending_approval: '⏳ Approval', pending: 'Approved', preparing: 'Preparing', ready: 'Ready', completed: 'Done' };

  // Separate pending_approval orders for a prominent section
  const approvalOrders = orders.filter(o => o.status === 'pending_approval');
  const otherOrders = orders.filter(o => o.status !== 'pending_approval');

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
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">My Orders</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Manage orders and approve customer requests.</p>
        </div>
      </div>

      {/* Approval Requests Banner */}
      {!filter && approvalOrders.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-4 mb-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-xl animate-pulse">🔔</span>
            <h3 className="text-base font-bold text-amber-900">Approval Requests ({approvalOrders.length})</h3>
          </div>
          {approvalOrders.map(order => (
            <div className="bg-white border border-amber-200 rounded-lg p-3.5 mb-2.5 last:mb-0 shadow-sm" key={order.id || order._id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1a1a2e]">#{(order.id || order._id).slice(0, 8)}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-400">Awaiting</span>
                </div>
                <span className="text-base font-extrabold text-[#c0392b]">₹{order.total}</span>
              </div>
              <div className="flex flex-wrap gap-2.5 text-[13px] text-[#64748b] mb-2">
                <span>👤 {order.customer_name}</span>
                {order.table_number && <span>🪑 Table {order.table_number}</span>}
                <span>🕐 {new Date(order.created_at || order.createdAt).toLocaleTimeString()}</span>
              </div>
              {order.notes && <div className="text-xs text-[#94a3b8] bg-gray-50 px-2.5 py-1.5 rounded mb-2">{order.notes}</div>}
              <div className="text-[13px] text-[#64748b] mb-3 leading-relaxed">
                {order.items?.map((item, i) => (
                  <span key={i}>{item.quantity}x {item.item_name}{i < order.items.length - 1 ? ', ' : ''}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors" onClick={() => updateStatus(order.id || order._id, 'pending')}>✅ Approve Order</button>
                <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-semibold hover:bg-red-200 transition-colors" onClick={() => { if (confirm('Reject this order?')) updateStatus(order.id || order._id, 'cancelled'); }}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {statusFilters.map(s => (
          <button 
            key={s} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-colors ${filter === s ? 'bg-[#c0392b] text-white' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
            onClick={() => setFilter(s)}
          >
            {filterLabels[s] || s}
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
        </div>
      ) : (filter ? orders : otherOrders).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No orders found</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(filter ? orders : otherOrders).map(order => (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 transition-shadow hover:shadow-sm" key={order.id || order._id}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[15px] font-semibold text-[#1a1a2e]">Order #{(order.id || order._id).slice(0, 8)}</h4>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${badgeStyles[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status === 'pending_approval' ? 'Awaiting' : order.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-4 text-[13px] text-[#94a3b8] mb-3">
                <span>👤 {order.customer_name || 'Guest'}</span>
                {order.table_number && <span>🪑 Table {order.table_number}</span>}
                <span>🕐 {new Date(order.created_at || order.createdAt).toLocaleTimeString()}</span>
              </div>
              {order.notes && <div className="text-[12px] text-[#94a3b8] mb-3 bg-gray-50 p-2 rounded">{order.notes}</div>}
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
                    <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors" onClick={() => updateStatus(order.id || order._id, 'pending')}>✅ Approve</button>
                  )}
                  {order.status === 'ready' && (
                    <button className="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors" onClick={() => updateStatus(order.id || order._id, 'completed')}>🍽 Served</button>
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
