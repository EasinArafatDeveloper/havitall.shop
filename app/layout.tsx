import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import StoreLayoutWrapper from "@/components/layout/StoreLayoutWrapper";

export const metadata: Metadata = {
  title: "HavItAll | Luxury & Lifestyle E-Commerce Sanctuary",
  description: "Discover exclusive horological timepieces, hi-res acoustics, handcrafted Italian leather, and futuristic tech lifestyle gear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-600 selection:text-white">
        <ToastProvider>
          <CartProvider>
            <StoreLayoutWrapper>
              {children}
            </StoreLayoutWrapper>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
