import { cache } from "react";
import type { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { fetchBusinessKoroProducts } from "@/lib/businessKoro";
import { toJsonLdHtml } from "@/lib/jsonld";
import { getProductFaq } from "@/lib/seoContent";

const SITE_URL = "https://havitall.shop";

const getProductForMetadata = cache(async (id: string) => {
  const cleanId = id.trim().toLowerCase();

  try {
    const db = await connectToDatabase();
    if (db) {
      const filterConditions: any[] = [];
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        filterConditions.push({ _id: id });
      }
      filterConditions.push({ slug: cleanId });
      filterConditions.push({ businessKoroId: id });

      const product: any = await Product.findOne({
        $or: filterConditions,
        isDeleted: { $ne: true },
      }).lean();

      if (product) return product;
    }

    const bkProducts = await fetchBusinessKoroProducts();
    if (Array.isArray(bkProducts)) {
      const found = bkProducts.find(
        (p: any) =>
          String(p._id).toLowerCase() === cleanId ||
          String(p.slug).toLowerCase() === cleanId ||
          String(p.businessKoroId).toLowerCase() === cleanId
      );
      if (found) return found;
    }
  } catch {
    // fall through to null — page component handles the not-found case
  }

  return null;
});

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProductForMetadata(params.id);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const effectivePrice = product.offerPrice || product.price;
  const priceFormatted = effectivePrice ? `৳${Number(effectivePrice).toLocaleString()}` : '';
  const title = priceFormatted 
    ? `${product.name} — ${priceFormatted} | HavItAll`
    : `${product.name} — Best Price in Bangladesh | HavItAll`;

  const rawDesc = product.shortDescription || product.description || `Buy original ${product.name} online at HavItAll Bangladesh.`;
  const cleanDesc = String(rawDesc).replace(/<[^>]*>?/gm, '').substring(0, 160).trim();
  const description = `${cleanDesc} ${priceFormatted ? `Price: ${priceFormatted}.` : ''} Cash on delivery available nationwide.`;

  // Ensure absolute image URL for Facebook / WhatsApp / Messenger crawlers
  let rawImage = (product.images && product.images.length > 0 ? product.images[0] : product.image) || `${SITE_URL}/opengraph-image`;
  if (rawImage.startsWith('/')) {
    rawImage = `${SITE_URL}${rawImage}`;
  }

  const url = `${SITE_URL}/product/${product.slug || params.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "HavItAll",
      locale: "en_US",
      url,
      title,
      description,
      images: [
        {
          url: rawImage,
          width: 1000,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [rawImage],
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const product = await getProductForMetadata(params.id);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || product.shortDescription,
        image: product.images || [],
        sku: String(product.businessKoroId || product._id || params.id),
        brand: { "@type": "Brand", name: "HavItAll" },
        aggregateRating:
          product.numReviews > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: product.rating || 4.8,
                reviewCount: product.numReviews,
              }
            : undefined,
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${product.slug || params.id}`,
          priceCurrency: "BDT",
          price: product.offerPrice || product.price,
          availability:
            product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      }
    : null;

  const faqJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: getProductFaq(product).map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  const breadcrumbJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: `${SITE_URL}/product/${product.slug || params.id}`,
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdHtml(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdHtml(breadcrumbJsonLd) }}
        />
      )}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdHtml(faqJsonLd) }}
        />
      )}
      {children}
    </>
  );
}
