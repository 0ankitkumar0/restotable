export default function Features() {
  const features = [
    { icon: '📱', title: 'QR Code Ordering', desc: 'Let customers order and pay directly from their phones.' },
    { icon: '💳', title: 'POS Billing', desc: 'Fast, reliable, and intuitive point-of-sale system for your cashiers.' },
    { icon: '🪑', title: 'Table Management', desc: 'Real-time floor plans and table status tracking.' },
    { icon: '👨‍🍳', title: 'Kitchen Display', desc: 'Streamline orders straight to the kitchen instantly.' },
    { icon: '📊', title: 'Sales Analytics', desc: 'Actionable insights to grow your restaurant business.' },
    { icon: '👥', title: 'Staff Management', desc: 'Role-based access for admins, waiters, and kitchen staff.' },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[#c0392b] font-bold tracking-wide uppercase text-sm mb-2">Features</h2>
          <h3 className="text-4xl font-extrabold text-[#1a1a2e]">Everything you need to run your restaurant</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-8 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl transition-all group cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-[#c0392b] transition-all">
                <span className="group-hover:grayscale group-hover:brightness-200">{f.icon}</span>
              </div>
              <h4 className="text-xl font-bold text-[#1a1a2e] mb-3">{f.title}</h4>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
