import { initialProducts, initialCategories, initialBanners, initialOrders } from './seedData';

// Global cache for development / memory fallback
declare global {
  var __havitallMemoryStore: {
    products: any[];
    categories: any[];
    banners: any[];
    orders: any[];
    offers: any[];
    isInitialized: boolean;
  } | undefined;
}

if (!global.__havitallMemoryStore) {
  const defaultProducts = JSON.parse(JSON.stringify(initialProducts)).map((p: any, i: number) => ({
    ...p,
    _id: `prod_${i + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  global.__havitallMemoryStore = {
    products: defaultProducts,
    categories: JSON.parse(JSON.stringify(initialCategories)).map((c: any, i: number) => ({
      ...c,
      _id: `cat_${i + 1}`,
      itemCount: 4,
    })),
    banners: JSON.parse(JSON.stringify(initialBanners)).map((b: any, i: number) => ({
      ...b,
      _id: `ban_${i + 1}`,
    })),
    orders: JSON.parse(JSON.stringify(initialOrders)).map((o: any, i: number) => ({
      ...o,
      _id: `ord_${i + 1}`,
      createdAt: new Date().toISOString(),
    })),
    offers: [
      {
        _id: 'offer_1',
        productId: defaultProducts[0]?._id || 'prod_1',
        productName: defaultProducts[0]?.name || 'Luxury Chronograph Watch',
        productImage: defaultProducts[0]?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
        productSlug: defaultProducts[0]?.slug || 'luxury-chronograph-watch-bk1',
        originalPrice: defaultProducts[0]?.originalPrice || 4500,
        offerPrice: defaultProducts[0]?.price || 3200,
        discountPercentage: 30,
        title: 'Upgrade Your Lifestyle with 30% OFF',
        subtitle: 'Exclusive flash offer on our verified flagship collection. Claim your premium discount before countdown ends.',
        badgeText: '⚡ LIMITED FLASH DEAL',
        couponCode: 'HAVITALL30',
        endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        isActive: true,
        order: 1,
      },
    ],
    isInitialized: true,
  };
}

export const memoryStore = global.__havitallMemoryStore;

