'use client';
import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function WaiterOrderPage({ params }) {
  const { tableId } = use(params);
  const { authFetch } = useAuth();
  const router = useRouter();
  const [table, setTable] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [tablesRes, mRes, cRes, oRes] = await Promise.all([
        authFetch('/api/tables'),
        authFetch('/api/menu'),
        authFetch('/api/categories'),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/table-orders/${tableId}`),
      ]);
      if (tablesRes.ok) {
        const d = await tablesRes.json();
        setTable((d.tables || []).find(t => (t.id || t._id) === tableId));
      }
      if (mRes.ok) { const d = await mRes.json(); setMenuItems((d.items || []).filter(i => i.available)); }
      if (cRes.ok) { const d = await cRes.json(); setCategories(d.categories || []); }
      if (oRes.ok) { const d = await oRes.json(); setActiveOrders(d.orders || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = menuItems.filter(item => {
    const matchCat = !activeCategory || item.category_id === activeCategory;
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  function addToCart(item) {
    setCart(prev => {
      const itemId = item.id || item._id;
      const existing = prev.find(c => c.menu_item_id === itemId);
      if (existing) return prev.map(c => c.menu_item_id === itemId ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menu_item_id: itemId, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function updateQty(menuItemId, delta) {
    setCart(prev => prev.map(c => {
      if (c.menu_item_id === menuItemId) {
        const newQty = c.quantity + delta;
        if (newQty <= 0) return null;
        return { ...c, quantity: newQty };
      }
      return c;
    }).filter(Boolean));
  }

  function getCartQty(itemId) {
    const c = cart.find(c => c.menu_item_id === itemId);
    return c ? c.quantity : 0;
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  async function sendToKitchen() {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: tableId,
          customer_name: customerName || 'Walk-in',
          customer_phone: '__waiter__',
          items: cart.map(c => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })),
          notes,
        }),
      });
      if (res.ok) {
        setCart([]);
        setCustomerName('');
        setNotes('');
        setShowCart(false);
        alert('✅ Order sent to kitchen!');
        loadAll();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to place order');
      }
    } catch (e) { alert('Network error'); }
    finally { setPlacing(false); }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      {/* ===== COMPACT HEADER ===== */}
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-bold transition-colors" onClick={() => router.push('/waiter')}>←</button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-[#1a1a2e] m-0">Table {table?.table_number || '?'}</h2>
            <span className="text-xs text-[#64748b]">{table?.seats} seats</span>
          </div>
        </div>
        {activeOrders.length > 0 && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">{activeOrders.length} active</span>
        )}
      </div>

      {/* ===== SEARCH ===== */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Search items..."
          className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 focus:border-[#c0392b] transition-all shadow-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ===== CATEGORIES ===== */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${!activeCategory ? 'bg-[#c0392b] text-white' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
          onClick={() => setActiveCategory('')}
        >
          All
        </button>
        {categories.map(c => (
          <button 
            key={c.id || c._id} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${activeCategory === (c.id || c._id) ? 'bg-[#c0392b] text-white' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
            onClick={() => setActiveCategory(c.id || c._id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ===== MENU GRID ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-10 text-[#94a3b8]">No items found</div>
        ) : (
          filtered.map(item => {
            const itemId = item.id || item._id;
            const qty = getCartQty(itemId);
            return (
              <div 
                className={`relative bg-white border rounded-xl p-4 flex flex-col justify-center items-center text-center cursor-pointer transition-all active:scale-95 shadow-sm ${qty > 0 ? 'border-[#c0392b] bg-red-50/30' : 'border-[#e2e8f0]'}`} 
                key={itemId} 
                onClick={() => addToCart(item)}
              >
                {qty > 0 && <div className="absolute -top-2 -right-2 bg-[#c0392b] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm">{qty}</div>}
                <div className="font-bold text-[#1a1a2e] text-[15px] mb-1 leading-tight">{item.name}</div>
                <div className="font-semibold text-[#c0392b] text-sm">₹{item.price}</div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== FLOATING CART BAR ===== */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[400px] bg-[#1a1a2e] text-white rounded-xl p-4 flex items-center justify-between shadow-2xl z-50 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => setShowCart(true)}>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">{cartCount}</span>
            <span className="font-medium text-[15px]">item{cartCount > 1 ? 's' : ''} added</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">₹{cartTotal}</span>
            <span className="text-xl">→</span>
          </div>
        </div>
      )}

      {/* ===== CART SHEET ===== */}
      {showCart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-end sm:items-center sm:justify-center transition-opacity" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up sm:animate-none" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden"></div>
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1a1a2e]">Order Summary</h3>
              <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors" onClick={() => setShowCart(false)}>✕</button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {cart.map(item => (
                <div className="flex items-center justify-between py-3 border-b border-[#e2e8f0] last:border-0" key={item.menu_item_id}>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1a1a2e] text-[15px]">{item.name}</span>
                    <span className="font-semibold text-[#c0392b] text-sm">₹{item.price * item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                    <button className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-700 font-bold" onClick={() => updateQty(item.menu_item_id, -1)}>−</button>
                    <span className="w-4 text-center font-bold text-[#1a1a2e] text-sm">{item.quantity}</span>
                    <button className="w-7 h-7 flex items-center justify-center bg-[#c0392b] rounded shadow-sm text-white font-bold" onClick={() => updateQty(item.menu_item_id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-[#e2e8f0] flex flex-col gap-3">
              <input 
                className="w-full bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 focus:border-[#c0392b] transition-colors" 
                placeholder="Customer name (optional)" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
              />
              <input 
                className="w-full bg-white border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 focus:border-[#c0392b] transition-colors" 
                placeholder="Special notes (optional)" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
            </div>

            <div className="p-5 border-t border-[#e2e8f0] bg-white sm:rounded-b-2xl pb-8 sm:pb-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#1a1a2e]">₹{cartTotal}</span>
              </div>
              <button 
                className="w-full py-3.5 bg-[#c0392b] text-white rounded-xl font-bold text-base shadow-lg shadow-red-900/20 hover:bg-[#a93226] transition-colors disabled:opacity-70 flex justify-center items-center gap-2" 
                onClick={sendToKitchen} 
                disabled={placing}
              >
                {placing ? 'Sending...' : '🔥 Send to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
