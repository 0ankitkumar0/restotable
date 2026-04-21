'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function MenuPage() {
  const { authFetch, token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category_id: '', available: true });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, cRes] = await Promise.all([authFetch('/api/menu'), authFetch('/api/categories')]);
      if (mRes.ok) { const d = await mRes.json(); setItems(d.items || []); }
      if (cRes.ok) { const d = await cRes.json(); setCategories(d.categories || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = activeCategory ? items.filter(i => i.category_id === activeCategory) : items;

  function openAddItem() {
    setEditItem(null);
    setForm({ name: '', description: '', price: '', category_id: '', available: true });
    setShowItemModal(true);
  }

  function openEditItem(item) {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: item.price, category_id: item.category_id || '', available: !!item.available });
    setShowItemModal(true);
  }

  async function saveItem(e) {
    e.preventDefault();
    const body = { ...form, price: parseFloat(form.price) };
    try {
      let res;
      if (editItem) {
        res = await authFetch(`/api/menu/${editItem.id || editItem._id}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        res = await authFetch('/api/menu', { method: 'POST', body: JSON.stringify(body) });
      }
      
      if (res.ok) {
        setShowItemModal(false);
        loadAll();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to save item');
      }
    } catch (e) { 
      console.error(e);
      alert('An unexpected error occurred');
    }
  }

  async function deleteItem(id) {
    if (!confirm('Delete this menu item?')) return;
    await authFetch(`/api/menu/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function saveCat(e) {
    e.preventDefault();
    await authFetch('/api/categories', { method: 'POST', body: JSON.stringify(catForm) });
    setCatForm({ name: '', description: '' });
    setShowCatModal(false);
    loadAll();
  }

  async function deleteCat(id) {
    if (!confirm('Delete this category?')) return;
    await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
    loadAll();
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        const d = await res.json();
        setForm({ ...form, image_url: d.url });
      } else {
        alert('Upload failed');
      }
    } catch (e) {
      console.error(e);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
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
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Menu</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Organize categories and items your guests can order.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm" onClick={() => setShowCatModal(true)}>+ Category</button>
          <button className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-semibold hover:bg-[#a93226] transition-colors shadow-sm" onClick={openAddItem}>+ Menu Item</button>
        </div>
      </div>

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
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${activeCategory === (c.id || c._id) ? 'bg-[#c0392b] text-white' : 'bg-white text-[#64748b] hover:bg-gray-50 border border-[#e2e8f0]'}`} 
            onClick={() => setActiveCategory(c.id || c._id)}
          >
            {c.name}
            <span className="opacity-50 hover:opacity-100 cursor-pointer" onClick={ev => { ev.stopPropagation(); deleteCat(c.id || c._id); }}>✕</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">🍽</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No items yet</h3>
          <p className="text-sm">Add your first item.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 relative shadow-sm hover:shadow-md transition-shadow" key={item.id || item._id}>
              <span className={`absolute top-4 right-4 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {item.available ? 'Available' : 'Unavailable'}
              </span>
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl mb-4 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  '🍕'
                )}
              </div>
              <h4 className="text-lg font-bold text-[#1a1a2e] mb-1">{item.name}</h4>
              <div className="text-lg font-extrabold text-[#c0392b] mb-1">₹{item.price}</div>
              <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">{item.category_name || 'Uncategorized'}</div>
              {item.description && <p className="text-[13px] text-[#64748b] mb-4 line-clamp-2">{item.description}</p>}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors w-full" onClick={() => openEditItem(item)}>Edit</button>
                <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors w-full" onClick={() => deleteItem(item.id || item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setShowItemModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#1a1a2e]">{editItem ? 'Edit Item' : 'Add Menu Item'}</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowItemModal(false)}>✕</button>
            </div>
            <form onSubmit={saveItem}>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b] min-h-[80px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Price (₹)</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Category</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Item Photo</label>
                  <div className="flex items-center gap-4">
                    {form.image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#c0392b] hover:file:bg-red-100"
                    />
                    {uploading && <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-red-600 focus:ring-red-500 rounded" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                    <span className="text-sm font-medium text-[#1a1a2e]">Available for ordering</span>
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-gray-50 flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" onClick={() => setShowItemModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">{editItem ? 'Update' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setShowCatModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#1a1a2e]">Add Category</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowCatModal(false)}>✕</button>
            </div>
            <form onSubmit={saveCat}>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b] min-h-[80px]" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-gray-50 flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">Add Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
