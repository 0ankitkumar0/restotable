'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function KitchenPage() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    try {
      const res = await authFetch('/api/orders');
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await authFetch(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      loadOrders();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter orders for the kitchen view
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const getOrderCard = (order, buttonText, buttonColor, nextStatus) => (
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-sm hover:shadow-md transition-shadow mb-4" key={order.id || order._id}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-[15px] font-bold text-[#1a1a2e]">#{((order.id || order._id) + '').slice(-6)}</h4>
        <span className="text-sm font-semibold text-[#64748b]">
          {new Date(order.created_at || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 text-[12px] font-medium text-[#64748b] mb-3 pb-3 border-b border-gray-100">
        <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">
          {order.order_type === 'takeaway' ? '🥡 Takeaway' : '🍽 Dine-in'}
        </span>
        {order.table_number && (
          <span className="bg-[#f0f4f8] px-2 py-1 rounded-md text-blue-700">
            🪑 Table {order.table_number}
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="font-semibold text-xs uppercase tracking-wider text-[#94a3b8] mb-2">Items</div>
        <ul className="space-y-2">
          {order.items?.map((item, i) => (
            <li key={i} className="flex justify-between items-start text-[14px]">
              <div className="font-semibold text-[#1a1a2e]">
                <span className="text-[#c0392b] mr-2">{item.quantity}x</span> 
                {item.item_name}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {order.notes && (
        <div className="bg-amber-50 text-amber-800 text-xs p-2 rounded-md mb-4 border border-amber-100">
          <span className="font-bold">📝 Notes:</span> {order.notes}
        </div>
      )}

      {nextStatus && (
        <button 
          onClick={() => updateStatus(order.id || order._id, nextStatus)}
          className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${buttonColor}`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Kitchen Display</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Manage active orders and track preparation times.</p>
        </div>
        <button 
          onClick={() => loadOrders()}
          className="w-10 h-10 bg-white border border-[#e2e8f0] rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 text-xl"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {/* Pending Column */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-amber-700 flex items-center gap-2">
              <span className="text-2xl">⏳</span> New Orders
            </h2>
            <span className="bg-amber-200 text-amber-800 px-2.5 py-0.5 rounded-full text-sm font-bold">
              {pendingOrders.length}
            </span>
          </div>
          <div className="flex flex-col">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">No new orders</div>
            ) : (
              pendingOrders.map(order => getOrderCard(order, 'Start Preparing', 'bg-blue-600 hover:bg-blue-700 shadow-sm', 'preparing'))
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-blue-700 flex items-center gap-2">
              <span className="text-2xl">👨‍🍳</span> Preparing
            </h2>
            <span className="bg-blue-200 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-bold">
              {preparingOrders.length}
            </span>
          </div>
          <div className="flex flex-col">
            {preparingOrders.length === 0 ? (
              <div className="text-center py-8 text-blue-300 text-sm font-medium border-2 border-dashed border-blue-200 rounded-xl">No orders in progress</div>
            ) : (
              preparingOrders.map(order => getOrderCard(order, 'Mark as Ready', 'bg-emerald-500 hover:bg-emerald-600 shadow-sm', 'ready'))
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
              <span className="text-2xl">🔔</span> Ready
            </h2>
            <span className="bg-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full text-sm font-bold">
              {readyOrders.length}
            </span>
          </div>
          <div className="flex flex-col">
            {readyOrders.length === 0 ? (
              <div className="text-center py-8 text-emerald-300 text-sm font-medium border-2 border-dashed border-emerald-200 rounded-xl">No orders ready</div>
            ) : (
              readyOrders.map(order => getOrderCard(order, null, null, null))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
