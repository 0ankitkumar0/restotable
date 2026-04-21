'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function TablesPage() {
  const { authFetch } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [form, setForm] = useState({ table_number: '', seats: '4' });

  useEffect(() => { loadTables(); }, []);

  async function loadTables() {
    setLoading(true);
    try {
      const res = await authFetch('/api/tables');
      if (res.ok) { const d = await res.json(); setTables(d.tables || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function addTable(e) {
    e.preventDefault();
    try {
      const res = await authFetch('/api/tables', {
        method: 'POST',
        body: JSON.stringify({ table_number: parseInt(form.table_number), seats: parseInt(form.seats) }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ table_number: '', seats: '4' });
        loadTables();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add table');
      }
    } catch (e) { console.error(e); }
  }

  async function deleteTable(id) {
    if (!confirm('Delete this table?')) return;
    await authFetch(`/api/tables/${id}`, { method: 'DELETE' });
    loadTables();
  }

  async function toggleStatus(table) {
    const newStatus = table.status === 'available' ? 'occupied' : 'available';
    await authFetch(`/api/tables/${table.id || table._id}`, {
      method: 'PUT',
      body: JSON.stringify({ table_number: table.table_number, seats: table.seats, status: newStatus }),
    });
    loadTables();
  }

  async function viewQR(table) {
    setShowQR(table);
    setQrData(null);
    try {
      const res = await authFetch(`/api/tables/${table.id || table._id}/qr`);
      if (res.ok) {
        const d = await res.json();
        setQrData(d);
      }
    } catch (e) { console.error(e); }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Tables &amp; QR</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Each table gets a unique QR — guests scan to browse and order.</p>
        </div>
        <div>
          <button className="bg-[#c0392b] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#a93226] transition-colors shadow-sm" onClick={() => setShowModal(true)}>+ Add table</button>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">🪑</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No tables yet. Add your first.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {tables.map(table => (
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow" key={table.id || table._id}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-3">🪑</div>
              <h4 className="text-lg font-bold text-[#1a1a2e] mb-1">Table {table.table_number}</h4>
              <div className="text-[13px] font-medium text-[#64748b] mb-3">{table.seats} seats</div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize mb-5 ${table.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{table.status}</span>
              <div className="flex flex-wrap justify-center gap-2 w-full mt-auto">
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors flex-1" onClick={() => viewQR(table)}>QR Code</button>
                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors flex-1" onClick={() => toggleStatus(table)}>
                  {table.status === 'available' ? 'Occupy' : 'Free'}
                </button>
                <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 transition-colors w-full mt-1" onClick={() => deleteTable(table.id || table._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[400px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#1a1a2e]">Add Table</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={addTable}>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Table Number</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="number" value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })} required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Number of Seats</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} required min="1" />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-gray-50 flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">Add Table</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-5" onClick={() => setShowQR(null)}>
          <div className="bg-white rounded-xl w-full max-w-[450px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-[#1a1a2e]">QR Code — Table {showQR.table_number}</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowQR(null)}>✕</button>
            </div>
            <div className="p-8 text-center flex flex-col items-center">
              {qrData ? (
                <>
                  <img src={qrData.qr} alt={`QR Code for Table ${showQR.table_number}`} className="w-[260px] h-[260px] object-contain mx-auto mb-5 rounded-xl border-2 border-[#e2e8f0]" />
                  <p className="text-[13px] text-[#94a3b8] mb-4 break-all max-w-[300px] mx-auto bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                    {qrData.url}
                  </p>
                  <p className="text-sm text-[#64748b] leading-relaxed mb-6">
                    Customers scan this QR code to browse the menu and place orders from <strong className="text-[#1a1a2e]">Table {showQR.table_number}</strong>.
                  </p>
                  <div className="flex gap-3 justify-center w-full">
                    <a href={qrData.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-semibold hover:bg-[#a93226] transition-colors shadow-sm flex-1">Open Menu Link</a>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm flex-1" onClick={() => {
                      const link = document.createElement('a');
                      link.download = `table-${showQR.table_number}-qr.png`;
                      link.href = qrData.qr;
                      link.click();
                    }}>Download QR</button>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center py-20">
                  <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
