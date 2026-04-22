import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#16213e] py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/web-app-manifest-512x512.png" alt="RestoTable Logo" className="w-8 h-8 rounded-md grayscale opacity-80" />
            <span className="font-bold text-xl text-white">RestoTable</span>
          </div>
          <div className="flex gap-8 text-gray-400 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <a href="#demo" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} RestoTable. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Developed with <span className="text-[#c0392b]">♥</span> by <strong className="text-white">Ncodex</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
