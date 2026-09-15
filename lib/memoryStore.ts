// Global cache for development / memory fallback
declare global {
  var __havitallMemoryStore: {
    products: any[];
    categories: any[];
    banners: any[];
    orders: any[];
    offers: any[];
    deletedProductIds: string[];
    featuredProductIds: string[];
    hotProductIds: string[];
    productOverrides: { [key: string]: any };
    isInitialized: boolean;
  } | undefined;
}

if (!global.__havitallMemoryStore) {
  global.__havitallMemoryStore = {
    products: [],
    categories: [],
    banners: [],
    orders: [],
    offers: [],
    deletedProductIds: [],
    featuredProductIds: [],
    hotProductIds: [],
    productOverrides: {},
    isInitialized: true,
  };
}

export const memoryStore = global.__havitallMemoryStore;
