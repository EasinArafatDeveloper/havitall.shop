export interface FaqItem {
  question: string;
  answer: string;
}

const CATEGORY_DESCRIPTORS: Record<string, string> = {
  "audio-acoustics": "earbuds and audio gear",
  "luxury-watches": "watches",
  "bags-leather": "leather bags",
  "smart-gadgets": "smart gadgets",
  "eyewear-shades": "eyewear",
};

export function getCategoryDescriptor(category?: string): string {
  if (!category) return "products";
  return CATEGORY_DESCRIPTORS[category] || category.replace(/-/g, " ");
}

export function getProductSeoIntro(product: any): string {
  const descriptor = getCategoryDescriptor(product?.category);
  const price = product?.offerPrice || product?.price;
  return `Looking for the best ${descriptor} in Bangladesh at a low price? The ${product?.name} is one of HavItAll's most popular picks${
    price ? ` at just ৳${price}` : ""
  } — trusted for daily use, gaming, and travel, with fast delivery and cash on delivery available nationwide.`;
}

export function getProductFaq(product: any): FaqItem[] {
  const price = product?.offerPrice || product?.price;
  const descriptor = getCategoryDescriptor(product?.category);
  const name = product?.name || "this product";

  return [
    {
      question: `What is the price of ${name} in Bangladesh?`,
      answer: price
        ? `The current price of ${name} at HavItAll is ৳${price}, with cash on delivery available across Bangladesh.`
        : `You can check the current price of ${name} above on this page — HavItAll offers cash on delivery across Bangladesh.`,
    },
    {
      question: `Is ${name} good for gaming and daily use?`,
      answer: `Yes, ${name} is built for everyday use including music, calls, and gaming, making it one of the best ${descriptor} options for the price at HavItAll.`,
    },
    {
      question: `Does HavItAll offer cash on delivery for ${name}?`,
      answer: `Yes, HavItAll offers cash on delivery (COD) for ${name} anywhere in Bangladesh, along with bKash and Nagad mobile payment options.`,
    },
    {
      question: `Is ${name} original and authentic?`,
      answer: `Yes, ${name} sold on HavItAll is 100% genuine and quality-checked before dispatch, backed by a 7-day easy return policy.`,
    },
  ];
}
