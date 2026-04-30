'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';


export default function StaffPage() {
  const { authFetch } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [form, setForm] = useState({ id: null, name: '', email: '', phone: '', password: '', role: 'waiter' });

  useEffect(() => { loadStaff(); }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await authFetch('/api/staff');
      if (res.ok) { 
        const d = await res.json(); 
        setStaff(d.staff || []); 
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/staff/${form.id}` : '/api/staff';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        resetForm();
        loadStaff();
      } else {
        const d = await res.json();
        alert(d.error || `Failed to ${isEditing ? 'update' : 'add'} staff`);
      }
    } catch (e) { console.error(e); }
  }

  async function deleteStaff(id, e) {
    e.stopPropagation();
    if (!confirm('Remove this staff member?')) return;
    try {
      const res = await authFetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) loadStaff();
      else { const d = await res.json(); alert(d.error); }
    } catch (e) { console.error(e); }
  }

  function resetForm() {
    setForm({ id: null, name: '', email: '', phone: '', password: '', role: 'waiter' });
    setIsEditing(false);
    setShowPassword(false);
  }

  function openEditModal(member) {
    setForm({
      id: member.id || member._id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      password: '', // blank by default for edit
      role: member.role || 'waiter'
    });
    setIsEditing(true);
    setShowModal(true);
  }

  function openAddModal() {
    resetForm();
    setShowModal(true);
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

  const nonAdmins = staff.filter(s => s.role !== 'admin');
  
  const roles = ['All', 'waiter', 'kitchen', 'manager'];
  
  const filteredStaff = activeTab === 'All' 
    ? nonAdmins 
    : nonAdmins.filter(member => member.role === activeTab);

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Staff</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Manage managers, waiters, and kitchen staff.</p>
        </div>
        <div>
          <button className="bg-[#c0392b] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#a93226] transition-colors shadow-sm" onClick={openAddModal}>+ Add Staff</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              activeTab === role 
                ? 'bg-[#c0392b] text-white border-[#c0392b] shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            } capitalize`}
          >
            {role}
          </button>
        ))}
      </div>

      {filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8] bg-white border border-[#e2e8f0] rounded-xl shadow-sm">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No staff found for {activeTab !== 'All' ? activeTab : 'this view'}.</h3>
        </div>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Name</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Email</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Phone</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Role</th>
                  <th className="text-[13px] font-semibold text-[#64748b] px-5 py-3 border-b border-[#e2e8f0] bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(member => (
                  <tr key={member.id || member._id} className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => openEditModal(member)}>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#c0392b] to-[#e74c3c] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                          {member.name?.[0] || '?'}
                        </div>
                        <span className="font-semibold text-sm text-[#1a1a2e]">{member.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{member.email}</td>
                    <td className="text-sm text-[#1a1a2e] px-5 py-4 border-b border-[#e2e8f0]">{member.phone || '-'}</td>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize ${roleBadgeStyles[member.role] || 'bg-gray-100 text-gray-700'}`}>{member.role}</span>
                    </td>
                    <td className="px-5 py-4 border-b border-[#e2e8f0]">
                      <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium hover:bg-red-200 transition-colors" onClick={(e) => deleteStaff(member.id || member._id, e)}>Remove</button>
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
              <h2 className="text-lg font-bold text-[#1a1a2e]">{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Name</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Phone Number</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +1 234 567 8900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">Email</label>
                  <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b]" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                    {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-[#c0392b] pr-10" 
                      type={showPassword ? "text" : "password"} 
                      value={form.password} 
                      onChange={e => setForm({ ...form, password: e.target.value })} 
                      required={!isEditing} 
                      minLength={6} 
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center justify-center w-5 h-5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
                <button type="submit" className="px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-medium hover:bg-[#a93226] transition-colors">{isEditing ? 'Save Changes' : 'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
