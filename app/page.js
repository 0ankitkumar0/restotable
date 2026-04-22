import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import DemoForm from '@/components/landing/DemoForm';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#c0392b] selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WhyChooseUs />
        <DemoForm />
      </main>
      <Footer />
    </div>
  );
}
