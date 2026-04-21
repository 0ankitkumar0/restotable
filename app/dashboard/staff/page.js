'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function StaffPage() {
  const { authFetch } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'waiter' });

  useEffect(() => { loadStaff(); }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await authFetch('/api/staff');
      if (res.ok) { const d = await res.json(); setStaff(d.staff || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function addStaff(e) {
    e.preventDefault();
    try {
      const res = await authFetch('/api/staff', { method: 'POST', body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: '', email: '', password: '', role: 'waiter' });
        loadStaff();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to add staff');
      }
    } catch (e) { console.error(e); }
  }

  async function deleteStaff(id) {
    if (!confirm('Remove this staff member?')) return;
    try {
      const res = await authFetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) loadStaff();
      else { const d = await res.json(); alert(d.error); }
    } catch (e) { console.error(e); }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  const roleBadgeStyles = {
    waiter: 'bg-blue-100 text-blue-700',
    kitchen: 'bg-orange-100 text-orange-700',
    manager: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700'
  };

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Staff</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Invite managers and servers to your restaurant.</p>
        </div>
        <div>
          <button className="bg-[#c0392b] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#a93226] transition-colors shadow-sm" onClick={() => setShowModal(true)}>+ Add Staff</button>
        </div>
      </div>

      {staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No staff yet.</h3>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Name</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Email</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Role</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member.id || member._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c0392b] to-[#e74c3c] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {member.name?.[0] || '?'}
                        </div>
                        <span className="font-semibold text-sm text-[#1a1a2e]">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{member.email}</td>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${roleBadgeStyles[member.role] || 'bg-gray-100 text-gray-700'}`}>{member.role}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors" onClick={() => deleteStaff(member.id || member._id)}>Remove</button>
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
              <h2 className="text-lg font-bold text-[#1a1a2e]">Add Staff Member</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={addStaff}>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Email</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Password</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="waiter">Waiter</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#e2e8f0] bg-gray-50 flex items-center justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
