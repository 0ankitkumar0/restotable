export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-24 bg-[#1a1a2e] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-[#c0392b] font-bold tracking-wide uppercase text-sm mb-2">Why RestoTable</h2>
            <h3 className="text-4xl font-extrabold mb-6 leading-tight">Built for modern restaurants that want to scale.</h3>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              We eliminate the friction between your front-of-house and back-of-house. Experience seamless operations, happier staff, and delighted customers.
            </p>
            <ul className="space-y-6">
              {[
                { title: 'Cloud-Based SaaS', desc: 'Access your restaurant data from anywhere, on any device.' },
                { title: 'Faster Table Turnovers', desc: 'QR ordering and quick billing means serving more guests.' },
                { title: 'Zero Setup Hassle', desc: 'No complex hardware required. Works on tablets and phones.' },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#c0392b]/20 flex items-center justify-center text-[#c0392b] shrink-0 mt-1">✓</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-tr from-[#c0392b] to-[#e67e22] p-1 opacity-90">
               <div className="w-full h-full bg-[#16213e] rounded-[22px] flex items-center justify-center p-8">
                 <div className="text-center">
                    <div className="text-6xl mb-6">🚀</div>
                    <div className="text-2xl font-bold text-white mb-2">Real-Time Sync</div>
                    <div className="text-gray-400">Waiters, Kitchen, and Billing are instantly connected.</div>
                 </div>
               </div>
            </div>
            {/* Decorative blurs */}
            <div className="absolute -inset-4 bg-[#c0392b]/20 blur-3xl -z-10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
