import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import StoreLayoutWrapper from "@/components/layout/StoreLayoutWrapper";
import MetaPixel from "@/components/analytics/MetaPixel";

const SITE_URL = "https://havitall.shop";
const SITE_NAME = "HavItAll";
const SITE_TITLE = "HavItAll | Luxury & Lifestyle E-Commerce in Bangladesh";
const SITE_DESCRIPTION =
  "Shop exclusive horological timepieces, hi-res acoustics, handcrafted Italian leather, and futuristic tech lifestyle gear at HavItAll — Bangladesh's luxury lifestyle destination with cash on delivery and nationwide shipping.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | HavItAll",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HavItAll",
    "luxury lifestyle Bangladesh",
    "online shopping Bangladesh",
    "watches Bangladesh",
    "leather bags Bangladesh",
    "gadgets and accessories",
    "premium ecommerce Bangladesh",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f172a",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description: SITE_DESCRIPTION,
  sameAs: ["https://www.facebook.com/havitall"],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/shop?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-600 selection:text-white">
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
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
