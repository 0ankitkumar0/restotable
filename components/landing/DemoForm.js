'use client';
import { useState } from 'react';

export default function DemoForm() {
  const [status, setStatus] = useState('idle');

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', note: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', email: '', note: '' });
      } else {
        setStatus('idle');
        alert('Failed to send request. Please try again.');
      }
    } catch {
      setStatus('idle');
      alert('Network error. Please try again.');
    }
  }

  return (
    <section id="demo" className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-10 sm:p-14">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-extrabold text-[#1a1a2e] mb-4">Request a Free Demo</h3>
              <p className="text-gray-600 text-lg">See how RestoTable can transform your restaurant operations today.</p>
            </div>

            {status === 'success' ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
                <h4 className="text-2xl font-bold text-[#1a1a2e] mb-2">Request Received!</h4>
                <p className="text-gray-600">Our team at Ncodex will contact you shortly to schedule your demo.</p>
                <button onClick={() => setStatus('idle')} className="mt-8 text-[#c0392b] font-semibold hover:underline">
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c0392b] focus:ring-2 focus:ring-[#c0392b]/20 transition-all outline-none bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="+1 (555) 000-0000" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c0392b] focus:ring-2 focus:ring-[#c0392b]/20 transition-all outline-none bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="john@restaurant.com" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c0392b] focus:ring-2 focus:ring-[#c0392b]/20 transition-all outline-none bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
                  <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Tell us about your restaurant or ask any questions..." rows="3" className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#c0392b] focus:ring-2 focus:ring-[#c0392b]/20 transition-all outline-none bg-gray-50 focus:bg-white"></textarea>
                </div>
                <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-[#c0392b] text-white rounded-xl font-bold text-lg hover:bg-[#a93226] transition-all shadow-lg shadow-red-900/20 hover:-translate-y-0.5 disabled:opacity-70">
                  {status === 'loading' ? 'Submitting...' : 'Get Demo'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
