/**
 * Business Koro API Integration Client
 * Base URL: https://api.businesskoro.com/api/v1/storefront
 * Headers: x-api-key, Origin
 */

const API_KEY = process.env.BUSINESS_KORO_API_KEY || 'bkr_5c498792bc7a89dbc6c1426c141ef8c8a581bd577865feb0';
const BASE_URL = process.env.BUSINESS_KORO_BASE_URL || 'https://api.businesskoro.com/api/v1/storefront';
const ORIGIN_HEADER = process.env.BUSINESS_KORO_ORIGIN || 'https://havitall.shop';

export interface BusinessKoroRawProduct {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  suggestedPrice?: number;
  price?: number;
  inStock?: boolean;
  category?: string;
  [key: string]: any;
}

export interface BusinessKoroOrderPayload {
  productId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerDivision?: string;
  customerDistrict?: string;
  customerArea?: string;
  sellingPrice: number;
  deliveryChargePaidByCustomer?: boolean;
  customerNote?: string;
}

/**
 * Format raw Business Koro product to HavItAll rich product schema
 */
export function formatBusinessKoroProduct(item: BusinessKoroRawProduct, index: number = 0) {
  const price = item.suggestedPrice || item.price || 999;
  const originalPrice = Math.round(price * 1.25);
  const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);

  // Generate URL slug
  const slug = item.name
    ? item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${item.id?.substring(0, 6) || index + 1}`
    : `product-${item.id || index + 1}`;

  // Fallback high-res image
  const defaultImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000',
  ];

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [defaultImages[index % defaultImages.length]];

  // Guess category
  let category = 'all-collection';
  const nameLower = (item.name || '').toLowerCase();
  if (nameLower.includes('watch') || nameLower.includes('ঘড়ি') || nameLower.includes('smartwatch')) {
    category = 'luxury-watches';
  } else if (nameLower.includes('headphone') || nameLower.includes('earbud') || nameLower.includes('audio') || nameLower.includes('speaker')) {
    category = 'audio-acoustics';
  } else if (nameLower.includes('bag') || nameLower.includes('leather') || nameLower.includes('wallet') || nameLower.includes('ব্যাগ')) {
    category = 'bags-leather';
  } else if (nameLower.includes('glass') || nameLower.includes('sunglass') || nameLower.includes('চশমা')) {
    category = 'eyewear-shades';
  } else if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('জুতা')) {
    category = 'footwear-kicks';
  } else {
    category = 'smart-gadgets';
  }

  return {
    _id: String(item.id || `bk_${index + 1}`),
    businessKoroId: String(item.id),
    name: item.name,
    slug,
    shortDescription: item.description 
      ? item.description.substring(0, 130) + '...'
      : 'Premium lifestyle product with guaranteed authentic quality and fast nationwide shipping.',
    description: item.description || `${item.name}. Premium luxury item verified for high performance and durability.`,
    price,
    originalPrice,
    discountPercentage,
    category,
    images,
    stock: item.inStock !== false ? 50 : 0,
    rating: 4.8,
    numReviews: 24 + (index * 7) % 50,
    isHot: index < 6,
    isFeatured: true,
    isNewArrival: true,
    badge: index % 2 === 0 ? 'Official Supplier' : 'Fast Delivery',
    variants: {
      colors: ['Standard Original'],
      sizes: ['Default'],
    },
    features: [
      '100% Verified Authentic from Business Koro Supplier',
      'Fast Express Delivery across Bangladesh',
      'Quality inspected before packaging',
      'Cash on Delivery & Mobile Payment Supported',
    ],
    tags: ['businesskoro', 'verified', category],
    source: 'businesskoro',
  };
}

/**
 * Fetch live products from Business Koro API
 */
export async function fetchBusinessKoroProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Origin': ORIGIN_HEADER,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      console.warn(`Business Koro API returned status ${res.status}: ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    const rawList = Array.isArray(json) 
      ? json 
      : json.data || json.products || json.result || [];

    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((item: any, i: number) => formatBusinessKoroProduct(item, i));
    }

    return [];
  } catch (error: any) {
    console.error('Error fetching products from Business Koro API:', error.message);
    return null;
  }
}

/**
 * Push an order placed on HavItAll to Business Koro for automated fulfillment
 */
export async function pushOrderToBusinessKoro(orderData: BusinessKoroOrderPayload) {
  try {
    console.log('Pushing order to Business Koro:', orderData);
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Origin': ORIGIN_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const json = await res.json();
    console.log('Business Koro order placement response:', json);
    return {
      success: res.ok,
      status: res.status,
      data: json,
    };
  } catch (error: any) {
    console.error('Error pushing order to Business Koro:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Fetch real-time order tracking status from Business Koro
 */
export async function getBusinessKoroOrderStatus(orderId: string) {
  try {
    const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
        'Origin': ORIGIN_HEADER,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error: any) {
    console.error('Error fetching order status from Business Koro:', error);
    return null;
  }
}
