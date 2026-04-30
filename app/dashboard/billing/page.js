'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import QRCode from 'qrcode';

export default function BillingPage() {
  const { authFetch } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Create Invoice Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    tableNo: '', customer_name: '', customer_phone: '', items: [], discount: 0, service_charge: 0, paymentMethod: 'cash'
  });
  
  // View/Print Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [invRes, menuRes, tablesRes, setRes] = await Promise.all([
        authFetch('/api/invoices'),
        authFetch('/api/menu'),
        authFetch('/api/tables'),
        authFetch('/api/settings')
      ]);
      
      if (invRes.ok) setInvoices((await invRes.json()).invoices || []);
      if (menuRes.ok) setMenuItems((await menuRes.json()).items || []);
      if (tablesRes.ok) setTables((await tablesRes.json()).tables || []);
      if (setRes.ok) setSettings((await setRes.json()).settings || {});
    } catch (e) {
      console.error('Error loading data', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedInvoice && settings?.upi_id) {
      const upiString = `upi://pay?pa=${settings.upi_id}&pn=${encodeURIComponent(settings.payee_name || 'Restaurant')}&am=${selectedInvoice.total}&cu=INR&tn=${selectedInvoice.invoiceNumber}`;
      QRCode.toDataURL(upiString, { width: 150, margin: 1 }).then(url => setQrUrl(url));
    } else {
      setQrUrl('');
    }
  }, [selectedInvoice, settings]);

  const calculateTotals = (items, discount, service_charge) => {
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const gstPercent = settings?.gst_percentage || 0;
    const tax = (subtotal * gstPercent) / 100;
    const total = subtotal + tax + Number(service_charge) - Number(discount);
    return { subtotal, tax, total };
  };

  const addItemToInvoice = (menuItem) => {
    const existing = newInvoice.items.find(i => i.menu_item_id === menuItem.id);
    if (existing) {
      const updated = newInvoice.items.map(i => i.menu_item_id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i);
      setNewInvoice({ ...newInvoice, items: updated });
    } else {
      setNewInvoice({ 
        ...newInvoice, 
        items: [...newInvoice.items, { menu_item_id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }] 
      });
    }
  };

  const updateItemQty = (id, delta) => {
    const updated = newInvoice.items.map(i => {
      if (i.menu_item_id === id) return { ...i, quantity: Math.max(1, i.quantity + delta) };
      return i;
    });
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const removeItem = (id) => {
    setNewInvoice({ ...newInvoice, items: newInvoice.items.filter(i => i.menu_item_id !== id) });
  };

  const handleCreateInvoice = async () => {
    if (newInvoice.items.length === 0) return alert('Add items to the bill');
    const { subtotal, tax, total } = calculateTotals(newInvoice.items, newInvoice.discount, newInvoice.service_charge);
    
    try {
      const res = await authFetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({ ...newInvoice, subtotal, tax, total })
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewInvoice({ tableNo: '', customer_name: '', customer_phone: '', items: [], discount: 0, service_charge: 0, paymentMethod: 'cash' });
        loadData();
      }
    } catch (e) { console.error(e); }
  };

  const updatePaymentStatus = async (id, status) => {
    try {
      await authFetch(`/api/invoices/${id}`, { method: 'PUT', body: JSON.stringify({ paymentStatus: status }) });
      setSelectedInvoice({ ...selectedInvoice, paymentStatus: status });
      setInvoices(invoices.map(inv => (inv.id || inv._id) === id ? { ...inv, paymentStatus: status } : inv));
    } catch (e) { console.error(e); }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  const { subtotal: newSub, tax: newTax, total: newTotal } = calculateTotals(newInvoice.items, newInvoice.discount, newInvoice.service_charge);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; max-width: 80mm; margin: 0 auto; padding: 10px; font-family: monospace; font-size: 12px; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Billing & POS</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Manage invoices, payments, and generate bills.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#c0392b] text-white px-5 py-2.5 rounded-lg font-bold shadow-sm hover:bg-[#a93226] transition-colors flex items-center gap-2"
        >
          <span>➕</span> New Bill
        </button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#64748b]">
            <thead className="bg-gray-50/50 text-[#1a1a2e] text-xs uppercase font-bold border-b border-[#e2e8f0]">
              <tr>
                <th className="px-5 py-4">Invoice #</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-500">No invoices generated yet.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id || inv._id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-gray-50/30">
                  <td className="px-5 py-3.5 font-bold text-[#1a1a2e]">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">{inv.customer_name || 'Walk-in'} {inv.tableNo ? `(T-${inv.tableNo})` : ''}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-600">₹{inv.total.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setSelectedInvoice(inv)} className="text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                      View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-[#1a1a2e]">Create New Bill</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Menu Selection (Left) */}
              <div className="w-full lg:w-1/2 p-5 border-r border-gray-100 overflow-y-auto bg-gray-50/30">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Add Items</h3>
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.filter(m => m.available).map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => addItemToInvoice(item)}
                      className="bg-white p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-[#c0392b] hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <span className="font-semibold text-sm text-[#1a1a2e] mb-2">{item.name}</span>
                      <span className="text-[#c0392b] font-bold text-sm">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Details (Right) */}
              <div className="w-full lg:w-1/2 p-5 overflow-y-auto flex flex-col">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Customer Name</label>
                    <input type="text" value={newInvoice.customer_name} onChange={e => setNewInvoice({...newInvoice, customer_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Walk-in" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                    <input type="text" value={newInvoice.customer_phone} onChange={e => setNewInvoice({...newInvoice, customer_phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Table No</label>
                    <select value={newInvoice.tableNo} onChange={e => setNewInvoice({...newInvoice, tableNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="">None (Takeaway)</option>
                      {tables.map(t => <option key={t.id} value={t.table_number}>Table {t.table_number}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Payment Method</label>
                    <select value={newInvoice.paymentMethod} onChange={e => setNewInvoice({...newInvoice, paymentMethod: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
                      <option value="cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4 overflow-y-auto">
                  {newInvoice.items.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No items added</div>
                  ) : (
                    <div className="space-y-3">
                      {newInvoice.items.map(item => (
                        <div key={item.menu_item_id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                          <div className="text-sm font-semibold text-[#1a1a2e] flex-1">{item.name} <span className="text-gray-400 font-normal">@ ₹{item.price}</span></div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateItemQty(item.menu_item_id, -1)} className="w-6 h-6 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 font-bold">-</button>
                            <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateItemQty(item.menu_item_id, 1)} className="w-6 h-6 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 font-bold">+</button>
                            <button onClick={() => removeItem(item.menu_item_id)} className="w-6 h-6 text-red-500 hover:text-red-700 ml-2">🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span>Subtotal</span> <span className="font-semibold">₹{newSub.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span>GST ({settings?.gst_percentage || 0}%)</span> <span className="font-semibold">₹{newTax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm items-center">
                    <span>Discount</span> 
                    <input type="number" value={newInvoice.discount} onChange={e => setNewInvoice({...newInvoice, discount: e.target.value})} className="w-20 px-2 py-1 border rounded text-right text-sm" />
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t text-[#c0392b]"><span>Total</span> <span>₹{newTotal.toFixed(2)}</span></div>
                </div>

                <button onClick={handleCreateInvoice} className="w-full py-3 bg-[#c0392b] text-white rounded-xl font-bold hover:bg-[#a93226] transition-colors shadow-sm">
                  Generate Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View / Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 no-print">
              <h2 className="text-xl font-bold text-[#1a1a2e]">Invoice Details</h2>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
              {/* Receipt Content - This part gets printed */}
              <div id="print-section" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mx-auto">
                <div className="text-center mb-4">
                  {settings?.restaurant_logo && <img src={settings.restaurant_logo} alt="Logo" className="w-16 h-16 mx-auto mb-2 rounded-lg object-contain" />}
                  <h2 className="text-xl font-bold text-[#1a1a2e]">RestoTable</h2>
                  <p className="text-xs text-gray-500">Invoice: {selectedInvoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="mb-4 text-sm">
                  <p><b>Customer:</b> {selectedInvoice.customer_name || 'Walk-in'} {selectedInvoice.customer_phone ? `- ${selectedInvoice.customer_phone}` : ''}</p>
                  {selectedInvoice.tableNo && <p><b>Table:</b> {selectedInvoice.tableNo}</p>}
                </div>

                <div className="border-t border-b border-dashed border-gray-300 py-3 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500"><th className="pb-2">Item</th><th className="pb-2 text-center">Qty</th><th className="pb-2 text-right">Amt</th></tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map(item => (
                        <tr key={item.menu_item_id}>
                          <td className="py-1">{item.name}</td>
                          <td className="py-1 text-center">{item.quantity}</td>
                          <td className="py-1 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1 text-sm text-right mb-4">
                  <p>Subtotal: ₹{selectedInvoice.subtotal.toFixed(2)}</p>
                  <p>GST ({settings?.gst_percentage || 0}%): ₹{selectedInvoice.tax.toFixed(2)}</p>
                  {selectedInvoice.discount > 0 && <p>Discount: -₹{selectedInvoice.discount.toFixed(2)}</p>}
                  <p className="text-lg font-bold mt-2 pt-2 border-t border-gray-200">Total: ₹{selectedInvoice.total.toFixed(2)}</p>
                </div>

                {qrUrl && selectedInvoice.paymentStatus !== 'paid' && (
                  <div className="text-center my-5 p-3 border rounded-xl bg-gray-50">
                    <p className="text-xs font-bold mb-2 text-gray-600">Scan to Pay via UPI</p>
                    <img src={qrUrl} alt="UPI QR" className="mx-auto w-[120px] h-[120px]" />
                    <p className="text-[10px] text-gray-500 mt-2">{settings?.upi_id}</p>
                  </div>
                )}

                {settings?.footer_message && (
                  <div className="text-center text-xs text-gray-500 mt-5 italic">
                    {settings.footer_message}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-between gap-3 bg-white no-print">
              {selectedInvoice.paymentStatus === 'pending' ? (
                <button onClick={() => updatePaymentStatus(selectedInvoice.id || selectedInvoice._id, 'paid')} className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors">
                  Mark as Paid
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold rounded-lg px-4">
                  ✅ Paid
                </div>
              )}
              <button onClick={handlePrint} className="flex-1 py-2 bg-[#c0392b] text-white font-bold rounded-lg shadow-sm hover:bg-[#a93226] transition-colors flex justify-center items-center gap-2">
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
