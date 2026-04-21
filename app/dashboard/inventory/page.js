'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function InventoryPage() {
  const { authFetch } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'pcs', low_stock_threshold: '10', cost_per_unit: '0' });

  useEffect(() => { loadInventory(); }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await authFetch('/api/inventory');
      if (res.ok) { const d = await res.json(); setInventory(d.inventory || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setEditItem(null);
    setForm({ name: '', quantity: '', unit: 'pcs', low_stock_threshold: '10', cost_per_unit: '0' });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({ name: item.name, quantity: String(item.quantity), unit: item.unit, low_stock_threshold: String(item.low_stock_threshold), cost_per_unit: String(item.cost_per_unit) });
    setShowModal(true);
  }

  async function save(e) {
    e.preventDefault();
    const body = { ...form, quantity: parseFloat(form.quantity), low_stock_threshold: parseFloat(form.low_stock_threshold), cost_per_unit: parseFloat(form.cost_per_unit) };
    if (editItem) {
      await authFetch(`/api/inventory/${editItem.id || editItem._id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await authFetch('/api/inventory', { method: 'POST', body: JSON.stringify(body) });
    }
    setShowModal(false);
    loadInventory();
  }

  async function deleteItem(id) {
    if (!confirm('Delete this inventory item?')) return;
    await authFetch(`/api/inventory/${id}`, { method: 'DELETE' });
    loadInventory();
  }

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Inventory</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Track stock levels and manage your supplies.</p>
        </div>
        <div>
          <button className="bg-[#c0392b] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#a93226] transition-colors shadow-sm" onClick={openAdd}>+ Add Item</button>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No inventory items yet</h3>
          <p className="text-sm">Add your first inventory item to start tracking.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Name</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Quantity</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Unit</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Low Stock At</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Cost/Unit</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Status</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id || item._id} className="hover:bg-gray-50/50">
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0] font-semibold">{item.name}</td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{item.quantity}</td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{item.unit}</td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{item.low_stock_threshold}</td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">₹{item.cost_per_unit}</td>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${item.quantity <= item.low_stock_threshold ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.quantity <= item.low_stock_threshold ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors" onClick={() => openEdit(item)}>Edit</button>
                        <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors" onClick={() => deleteItem(item.id || item._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#1a1a2e]">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Quantity</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="number" step="0.01" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Unit</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="g">Grams</option>
                    <option value="l">Liters</option>
                    <option value="ml">Milliliters</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Low Stock Threshold</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="number" step="0.01" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Cost per Unit (₹)</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="number" step="0.01" value={form.cost_per_unit} onChange={e => setForm({ ...form, cost_per_unit: e.target.value })} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-gray-50 flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">{editItem ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
