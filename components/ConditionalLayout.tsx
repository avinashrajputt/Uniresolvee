'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className={!isAuthPage ? 'pt-20' : ''}>{children}</div>
      {!isAuthPage && <Footer />}
    </>
  );
}
