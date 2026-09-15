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
    offers: [],
    isInitialized: true,
  };
}

export const memoryStore = global.__havitallMemoryStore;

