import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';

// Lazy load components below the fold for better performance
const Universities = dynamic(() => import('@/components/Universities'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gradient-to-b from-[#071026] to-[#0a1435]" />
});
const Partners = dynamic(() => import('@/components/Partners'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gradient-to-b from-[#071026] to-[#0a1435]" />
});
const Features = dynamic(() => import('@/components/Features'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gradient-to-b from-[#071026] to-[#0a1435]" />
});
const ContactSection = dynamic(() => import('@/components/ContactSection'), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-gradient-to-b from-[#071026] to-[#0a1435]" />
});

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <Hero />
      <Universities />
      <Partners />
      <Features />
      <ContactSection />
    </div>
  );
}
