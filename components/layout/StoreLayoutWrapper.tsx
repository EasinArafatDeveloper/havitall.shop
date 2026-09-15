'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/navbar/Navbar';
import CartDrawer from '@/components/cart/CartDrawer';
import Footer from '@/components/footer/Footer';

export default function StoreLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
