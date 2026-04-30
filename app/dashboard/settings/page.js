'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function SettingsPage() {
  const { authFetch } = useAuth();
  const [settings, setSettings] = useState({
    upi_id: '',
    payee_name: '',
    gst_percentage: 0,
    restaurant_logo: '',
    footer_message: 'Thank you for dining with us!'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await authFetch('/api/settings');
      if (res.ok) {
        const d = await res.json();
        if (d.settings) setSettings(d.settings);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e) {
      console.error(e);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Billing Settings</h1>
        <p className="text-[15px] text-[#64748b] mt-1">Configure UPI payments, GST, and invoice details.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 max-w-2xl shadow-sm">
        {message && (
          <div className={`p-3 rounded-lg text-sm font-semibold mb-6 ${message.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {message}
          </div>
        )}

        <form onSubmit={saveSettings} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">UPI ID</label>
              <input 
                type="text" 
                value={settings.upi_id || ''} 
                onChange={e => setSettings({...settings, upi_id: e.target.value})}
                placeholder="e.g. restaurant@upi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Payee Name</label>
              <input 
                type="text" 
                value={settings.payee_name || ''} 
                onChange={e => setSettings({...settings, payee_name: e.target.value})}
                placeholder="e.g. RestoTable Official"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">GST Percentage (%)</label>
              <input 
                type="number" 
                value={settings.gst_percentage || ''} 
                onChange={e => setSettings({...settings, gst_percentage: parseFloat(e.target.value) || 0})}
                placeholder="e.g. 5"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Restaurant Logo URL (optional)</label>
              <input 
                type="text" 
                value={settings.restaurant_logo || ''} 
                onChange={e => setSettings({...settings, restaurant_logo: e.target.value})}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">Invoice Footer Message</label>
            <textarea 
              value={settings.footer_message || ''} 
              onChange={e => setSettings({...settings, footer_message: e.target.value})}
              placeholder="Thank you for dining with us!"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#c0392b] focus:ring-1 focus:ring-[#c0392b]"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-[#c0392b] text-white font-bold rounded-lg hover:bg-[#a93226] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
