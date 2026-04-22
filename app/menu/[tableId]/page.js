'use client';
import { useState, useEffect, use } from 'react';

export default function CustomerMenuPage({ params }) {
  const { tableId } = use(params);
  const [table, setTable] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [orders, setOrders] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { loadMenu(); loadOrders(); }, [tableId]);
  useEffect(() => { if (showTracker) loadOrders(); }, [showTracker]);

  async function loadMenu() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/public/menu/${tableId}`);
      if (res.ok) {
        const d = await res.json();
        setTable(d.table);
        setItems(d.items || []);
        setCategories(d.categories || []);
      } else {
        setError('Table not found');
      }
    } catch (e) { setError('Failed to load menu'); }
    finally { setLoading(false); }
  }

  async function loadOrders() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/public/table-orders/${tableId}`);
      if (res.ok) {
        const d = await res.json();
        setOrders(d.orders || []);
      }
    } catch (e) { console.error(e); }
  }

  const filtered = activeCategory ? items.filter(i => i.category_id === activeCategory) : items;

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.menu_item_id === (item.id || item._id));
      if (existing) {
        return prev.map(c => c.menu_item_id === (item.id || item._id) ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { menu_item_id: (item.id || item._id), name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function updateCartQty(menuItemId, delta) {
    setCart(prev => {
      return prev.map(c => {
        if (c.menu_item_id === menuItemId) {
          const newQty = c.quantity + delta;
          if (newQty <= 0) return null;
          return { ...c, quantity: newQty };
        }
        return c;
      }).filter(Boolean);
    });
  }

  function getCartQty(itemId) {
    const c = cart.find(c => c.menu_item_id === itemId);
    return c ? c.quantity : 0;
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const tax = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + tax;

  async function placeOrder() {
    if (cart.length === 0) return;
    if (!customerName.trim()) { alert('Please enter your name'); return; }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) { alert('Please enter a valid phone number'); return; }
    setPlacing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/public/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: tableId,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          items: cart.map(c => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })),
          notes,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setOrderSuccess(d.order);
        setCart([]);
        setShowCart(false);
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        loadOrders();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to place order');
      }
    } catch (e) { alert('Network error'); }
    finally { setPlacing(false); }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-bold text-[#1a1a2e] mb-2">{error}</h2>
      <p className="text-[#64748b]">Please check the QR code and try again.</p>
    </div>
  );

  const statusSteps = ['pending_approval', 'pending', 'preparing', 'ready', 'completed'];
  const statusLabels = { pending_approval: 'Awaiting Approval', pending: 'Approved', preparing: 'Preparing', ready: 'Ready to Serve', completed: 'Completed' };
  const statusEmojis = { pending_approval: '⏳', pending: '✅', preparing: '👨‍🍳', ready: '🍽', completed: '🎉' };

  return (
    <div className="max-w-[800px] mx-auto bg-gray-50 min-h-screen pb-28 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] p-5 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a2e] tracking-tight">RestoTable</h1>
            <p className="text-sm font-medium text-[#64748b]">You&apos;re at Table {table?.table_number}</p>
          </div>
          <div>
            {orders.length > 0 && (
              <button 
                className="bg-[#fdf2f0] text-[#c0392b] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-[#fce4e0] transition-colors" 
                onClick={() => { setShowTracker(!showTracker); setOrderSuccess(null); }}
              >
                📋 My Orders 
                <span className="bg-[#c0392b] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{orders.length}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Success Banner */}
        {orderSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3 relative">
            <span className="text-2xl mt-0.5">⏳</span>
            <div className="flex-1 pr-6">
              <strong className="block text-emerald-800 text-sm mb-0.5">Order sent for approval!</strong>
              <p className="text-emerald-600 text-xs mb-3">Waiting for waiter to confirm your order.</p>
              <button onClick={() => { setOrderSuccess(null); setShowTracker(true); }} className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors">Track Status →</button>
            </div>
            <button onClick={() => setOrderSuccess(null)} className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-600">✕</button>
          </div>
        )}

        {/* Order Tracker */}
        {showTracker && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#e2e8f0] overflow-hidden mb-8 animate-fade-in">
            <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-[#1a1a2e]">Your Active Orders</h3>
              <button onClick={() => setShowTracker(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#e2e8f0] text-gray-500 hover:text-[#1a1a2e]">✕</button>
            </div>
            <div className="divide-y divide-[#e2e8f0]">
              {orders.map(order => {
                const currentStep = statusSteps.indexOf(order.status);
                return (
                  <div className="p-5" key={order.id || order._id}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#1a1a2e]">Order #{(order.id || order._id).slice(0, 8)}</span>
                      <span className="text-base font-extrabold text-[#c0392b]">₹{order.total}</span>
                    </div>
                    <div className="text-[13px] text-[#64748b] mb-5 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {order.items?.map((item, i) => (
                        <span key={i}><span className="font-semibold text-gray-700">{item.quantity}x</span> {item.item_name}{i < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                    {order.status === 'cancelled' ? (
                      <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                        <span className="text-2xl">❌</span>
                        <div>
                          <strong className="block text-sm text-red-800 mb-0.5">Order Rejected</strong>
                          <p className="text-xs text-red-600">This order was not approved by the restaurant.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative pt-2">
                        <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-gray-100 -z-10 rounded-full"></div>
                        <div className="absolute top-6 left-[10%] h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 80}%` }}></div>
                        <div className="flex justify-between relative">
                          {statusSteps.map((step, i) => (
                            <div key={step} className={`flex flex-col items-center gap-2 ${i <= currentStep ? 'opacity-100' : 'opacity-40 grayscale'} ${i === currentStep ? 'scale-110 transform transition-transform' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${i <= currentStep ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'} ${i === currentStep ? 'ring-4 ring-emerald-100' : ''}`}>
                                {i <= currentStep ? statusEmojis[step] : (i + 1)}
                              </div>
                              <span className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${i === currentStep ? 'text-[#1a1a2e]' : 'text-gray-500'}`}>{statusLabels[step]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-slate-50 border-t border-[#e2e8f0]">
              <button className="w-full py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm font-bold text-[#1a1a2e] shadow-sm hover:bg-gray-50 transition-colors" onClick={loadOrders}>🔄 Refresh Status</button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-3 scrollbar-hide snap-x">
          <button 
            className={`snap-start px-5 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm ${!activeCategory ? 'bg-[#1a1a2e] text-white scale-105 transform' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
            onClick={() => setActiveCategory('')}
          >
            All
          </button>
          {categories.map(c => (
            <button 
              key={c.id || c._id} 
              className={`snap-start px-5 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all shadow-sm ${activeCategory === (c.id || c._id) ? 'bg-[#1a1a2e] text-white scale-105 transform' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
              onClick={() => setActiveCategory(c.id || c._id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8f0] shadow-sm text-[#94a3b8]">
              <div className="text-4xl mb-3">🍽</div>
              <p className="font-medium text-[15px]">No items available in this category.</p>
            </div>
          ) : (
            filtered.map(item => {
              const itemId = item.id || item._id;
              const qty = getCartQty(itemId);
              return (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden" key={itemId}>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-[10px] mb-1.5">{item.category_name === 'Non-Veg' ? '🔴' : '🟢'}</div>
                    <h4 className="text-[17px] font-bold text-[#1a1a2e] leading-tight mb-1 pr-2">{item.name}</h4>
                    {item.description && <p className="text-[13px] text-[#64748b] mb-2.5 line-clamp-2 leading-relaxed">{item.description}</p>}
                    <div className="text-[15px] font-extrabold text-[#1a1a2e]">₹{item.price}</div>
                  </div>
                  <div className="w-[100px] flex flex-col items-center justify-between relative">
                    <div className="w-[100px] h-[100px] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-4xl shadow-inner mb-3 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        '🍽'
                      )}
                    </div>
                    {qty === 0 ? (
                      <button className="absolute -bottom-3 bg-white border border-[#c0392b] text-[#c0392b] font-bold text-[13px] px-6 py-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-colors uppercase tracking-wider" onClick={() => addToCart(item)}>ADD</button>
                    ) : (
                      <div className="absolute -bottom-3 bg-[#c0392b] text-white rounded-lg flex items-center shadow-lg overflow-hidden h-[34px]">
                        <button className="w-8 h-full flex items-center justify-center font-bold text-lg hover:bg-[#a93226] transition-colors" onClick={() => updateCartQty(itemId, -1)}>−</button>
                        <span className="w-8 h-full flex items-center justify-center font-bold text-sm bg-white text-[#c0392b]">{qty}</span>
                        <button className="w-8 h-full flex items-center justify-center font-bold text-lg hover:bg-[#a93226] transition-colors" onClick={() => updateCartQty(itemId, 1)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && !showCart && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[400px] bg-[#1a1a2e] text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl z-40 cursor-pointer hover:-translate-y-1 transition-transform animate-slide-up" 
          onClick={() => setShowCart(true)}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-lg">🛒</div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] leading-tight">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
              <span className="text-[11px] text-gray-300 font-medium">View Cart</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[17px]">₹{cartTotal}</span>
            <span className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-lg">→</span>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col justify-end transition-opacity animate-fade-in" onClick={() => setShowCart(false)}>
          <div className="bg-white w-full max-w-[600px] mx-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>
            <div className="px-6 py-3 border-b border-[#e2e8f0] flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#1a1a2e]">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 pb-32">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-[#94a3b8] font-medium">Your cart is empty</div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 mb-6">
                    {cart.map(item => (
                      <div className="flex items-start justify-between" key={item.menu_item_id}>
                        <div className="flex flex-col pr-4">
                          <h4 className="font-bold text-[#1a1a2e] text-[15px] mb-1">{item.name}</h4>
                          <span className="text-xs font-semibold text-[#64748b]">₹{item.price} × {item.quantity}</span>
                        </div>
                        <div className="flex items-center bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden h-[36px] shrink-0">
                          <button className="w-9 h-full flex items-center justify-center font-bold text-lg text-gray-600 bg-gray-50 hover:bg-gray-100" onClick={() => updateCartQty(item.menu_item_id, -1)}>−</button>
                          <span className="w-9 h-full flex items-center justify-center font-bold text-[15px] text-[#1a1a2e] border-x border-[#e2e8f0]">{item.quantity}</span>
                          <button className="w-9 h-full flex items-center justify-center font-bold text-lg text-[#c0392b] bg-red-50 hover:bg-red-100" onClick={() => updateCartQty(item.menu_item_id, 1)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 border border-[#e2e8f0] rounded-2xl p-5 mb-6">
                    <div className="flex justify-between items-center mb-3 text-[14px]">
                      <span className="text-[#64748b] font-medium">Subtotal</span>
                      <span className="font-bold text-[#1a1a2e]">₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-[14px]">
                      <span className="text-[#64748b] font-medium">Tax (5%)</span>
                      <span className="font-bold text-[#1a1a2e]">₹{tax}</span>
                    </div>
                    <div className="w-full h-px bg-gray-200 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[#1a1a2e] text-[16px]">Grand Total</span>
                      <span className="font-extrabold text-[#c0392b] text-2xl">₹{grandTotal}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <input 
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 focus:border-[#c0392b] transition-all shadow-sm" 
                      placeholder="Your name *" 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)} 
                      required 
                    />
                    <input 
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 focus:border-[#c0392b] transition-all shadow-sm" 
                      placeholder="Phone number *" 
                      type="tel" 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)} 
                      required 
                    />
                    <textarea 
                      className="w-full bg-white border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c0392b]/20 focus:border-[#c0392b] transition-all shadow-sm min-h-[100px] resize-none" 
                      placeholder="Any special notes? (Optional)" 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)} 
                    />
                  </div>
                </>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-[#e2e8f0] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <button 
                  className="w-full py-4 bg-[#c0392b] text-white rounded-xl font-bold text-[17px] shadow-lg shadow-red-900/25 hover:bg-[#a93226] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  onClick={placeOrder} 
                  disabled={placing}
                >
                  {placing ? 'Placing order...' : `Place Order — ₹${grandTotal}`}
                  {!placing && <span className="opacity-80">→</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
