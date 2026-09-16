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
    url: `${SITE_URL}/shop`,
    title: `${TITLE} | HavItAll`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | HavItAll`,
    description: DESCRIPTION,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
