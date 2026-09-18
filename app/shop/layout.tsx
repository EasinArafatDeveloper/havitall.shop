import type { Metadata } from "next";

const SITE_URL = "https://havitall.shop";
const TITLE = "Shop All Products";
const DESCRIPTION =
  "Browse HavItAll's full luxury lifestyle collection — timepieces, audio gear, leather goods, eyewear, footwear, and smart gadgets, with nationwide delivery across Bangladesh.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/shop` },
  openGraph: {
    type: "website",
    siteName: "HavItAll",
    locale: "en_US",
    url: `${SITE_URL}/shop`,
    title: `${TITLE} | HavItAll`,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "HavItAll Shop All Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | HavItAll`,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
