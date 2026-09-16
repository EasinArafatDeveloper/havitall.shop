declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1089367523503019';

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

const fbEvent = (name: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, params);
  }
};

export const trackViewContent = (params: { id: string; name: string; price: number }) => {
  fbEvent('ViewContent', {
    content_ids: [params.id],
    content_name: params.name,
    content_type: 'product',
    value: params.price,
    currency: 'BDT',
  });
};

export const trackAddToCart = (params: { id: string; name: string; price: number; quantity: number }) => {
  fbEvent('AddToCart', {
    content_ids: [params.id],
    content_name: params.name,
    content_type: 'product',
    value: params.price * params.quantity,
    currency: 'BDT',
  });
};

export const trackInitiateCheckout = (params: { ids: string[]; value: number; numItems: number }) => {
  fbEvent('InitiateCheckout', {
    content_ids: params.ids,
    content_type: 'product',
    value: params.value,
    currency: 'BDT',
    num_items: params.numItems,
  });
};

export const trackPurchase = (params: { ids: string[]; value: number; orderId: string }) => {
  fbEvent('Purchase', {
    content_ids: params.ids,
    content_type: 'product',
    value: params.value,
    currency: 'BDT',
  });
};
