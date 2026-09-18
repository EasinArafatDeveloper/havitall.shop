import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import StoreLayoutWrapper from "@/components/layout/StoreLayoutWrapper";
import MetaPixel from "@/components/analytics/MetaPixel";
import RouteProgressBar from "@/components/layout/RouteProgressBar";
import { toJsonLdHtml } from "@/lib/jsonld";

const SITE_URL = "https://havitall.shop";
const SITE_NAME = "HavItAll";
const SITE_TITLE = "HavItAll — Best Gadget & Lifestyle Shop in Bangladesh | বাংলাদেশের সেরা গ্যাজেট শপ";
const SITE_DESCRIPTION =
  "HavItAll (হ্যাভইটঅল) is Bangladesh's trusted online shop for wireless earbuds, smart watches, power banks, luxury watches, and lifestyle gadgets — with cash on delivery and nationwide shipping. বাংলাদেশের সেরা গ্যাজেট ও লাইফস্টাইল প্রোডাক্টের অনলাইন শপ, ক্যাশ অন ডেলিভারি সুবিধাসহ।";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | HavItAll",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "HavItAll",
    "Havitall Bangladesh",
    "havitall.shop",
    "best gadget shop in Bangladesh",
    "বাংলাদেশের সেরা গ্যাজেট শপ",
    "online gadget shop Bangladesh",
    "গ্যাজেট শপ বাংলাদেশ",
    "wireless earbuds Bangladesh",
    "smart watch price in Bangladesh",
    "power bank price in Bangladesh",
    "luxury watches Bangladesh",
    "electronics shop Dhaka",
    "ঢাকা গ্যাজেট শপ",
    "online shopping Bangladesh cash on delivery",
    "leather bags Bangladesh",
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
  verification: {
    other: {
      "facebook-domain-verification": ["9mkp6356fcq33kkdcebbh9mm1r03i0"],
    },
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
  "@type": "Store",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Havitall",
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  image: `${SITE_URL}/opengraph-image`,
  description: SITE_DESCRIPTION,
  email: "havitall.info@gmail.com",
  telephone: "+8801356593305",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bashundhara",
    addressLocality: "Dhaka",
    postalCode: "1229",
    addressCountry: "BD",
  },
  areaServed: "BD",
  priceRange: "৳৳",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
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
        <meta
          name="facebook-domain-verification"
          content="9mkp6356fcq33kkdcebbh9mm1r03i0"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdHtml(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdHtml(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-rose-600 selection:text-white">
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <RouteProgressBar />
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
