import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <img src="/web-app-manifest-512x512.png" alt="RestoTable Logo" className="w-10 h-10 rounded-lg shadow-sm" />
            <span className="font-bold text-xl text-[#1a1a2e]">RestoTable</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-[#c0392b] font-medium transition-colors">Features</a>
            <a href="#why-us" className="text-gray-600 hover:text-[#c0392b] font-medium transition-colors">Why Us</a>
            <a href="#demo" className="text-gray-600 hover:text-[#c0392b] font-medium transition-colors">Get Demo</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-[#1a1a2e] font-semibold hover:text-[#c0392b] transition-colors">
              Login
            </Link>
            <a href="#demo" className="hidden md:inline-flex bg-[#c0392b] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#a93226] transition-all shadow-lg shadow-red-900/20 hover:-translate-y-0.5">
              Get Demo
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
