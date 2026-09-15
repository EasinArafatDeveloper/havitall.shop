'use client';

import React from 'react';
import FeaturedCollections from './FeaturedCollections';

export default function CategoryGrid({ products, categories }: { products?: any[]; categories?: any[] }) {
  return <FeaturedCollections products={products || []} />;
}

