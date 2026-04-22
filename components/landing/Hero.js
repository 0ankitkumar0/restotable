export default function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1a1a2e] tracking-tight mb-8 leading-tight">
            Smart Restaurant Management <span className="text-[#c0392b]">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            All-in-one POS, table management, QR ordering, and real-time analytics. Built to streamline your operations and boost your revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-[#c0392b] text-white rounded-xl font-bold text-lg hover:bg-[#a93226] transition-all shadow-xl shadow-red-900/20 hover:-translate-y-1">
              Get a Free Demo
            </a>
            <a href="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-[#1a1a2e] border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-[#c0392b] hover:text-[#c0392b] transition-all">
              Sign In
            </a>
          </div>
        </div>
        
        {/* Mockup Dashboard Image placeholder */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white p-2">
            <div className="bg-[#1a1a2e] rounded-xl aspect-[16/9] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 p-8">
                  <div className="flex gap-6 h-full">
                    <div className="w-64 bg-white/5 rounded-xl border border-white/10 hidden md:block"></div>
                    <div className="flex-1 flex flex-col gap-6">
                       <div className="h-20 bg-white/5 rounded-xl border border-white/10"></div>
                       <div className="flex-1 flex gap-6">
                          <div className="flex-1 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                            <span className="text-white/20 text-3xl font-bold">POS Terminal</span>
                          </div>
                          <div className="w-1/3 bg-white/5 rounded-xl border border-white/10 hidden lg:block"></div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
