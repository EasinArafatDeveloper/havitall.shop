'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Power, 
  Check, 
  Clock, 
  Tag, 
  Percent, 
  ExternalLink, 
  AlertCircle, 
  Search, 
  X,
  Flame,
  ArrowRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface OfferItem {
  _id?: string;
  productId: string;
  productName: string;
  productImage: string;
  productSlug: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  title: string;
  subtitle?: string;
  badgeText: string;
  couponCode: string;
  endDate: string;
  isActive: boolean;
  order?: number;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { success, error, info } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    title: 'Upgrade Your Lifestyle with 30% OFF',
    subtitle: 'Exclusive flash offer on our verified luxury collection. Claim your discount before the countdown runs out.',
    badgeText: '⚡ LIMITED FLASH DEAL',
    couponCode: 'HAVITALL30',
    originalPrice: 4500,
    offerPrice: 3150,
    discountPercentage: 30,
    durationHours: 48,
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersRes, prodsRes] = await Promise.all([
        fetch('/api/offers'),
        fetch('/api/products?limit=100'),
      ]);

      const offersData = await offersRes.json();
      const prodsData = await prodsRes.json();

      if (offersData.success) {
        setOffers(offersData.offers || []);
      }
      if (prodsData.success && prodsData.products) {
        setProducts(prodsData.products);
      }
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeOffersCount = offers.filter((o) => o.isActive).length;

  const handleOpenCreateModal = () => {
    setEditingOffer(null);
    const firstProd = products[0] || null;
    setSelectedProduct(firstProd);
    
    if (firstProd) {
      const orig = Number(firstProd.originalPrice || firstProd.price * 1.3 || 4500);
      const off = Number(firstProd.price || 3150);
      const disc = Math.round(((orig - off) / orig) * 100) || 25;
      setFormData({
        title: `Exclusive Flash Deal on ${firstProd.name.slice(0, 32)}`,
        subtitle: 'Limited-time special pricing on our top-rated luxury selection.',
        badgeText: '🔥 LIMITED FLASH DEAL',
        couponCode: 'HAVITALL25',
        originalPrice: orig,
        offerPrice: off,
        discountPercentage: disc,
        durationHours: 48,
        isActive: true,
      });
    } else {
      setFormData({
        title: 'Exclusive Flash Deal',
        subtitle: 'Limited-time special pricing on our top-rated luxury selection.',
        badgeText: '🔥 LIMITED FLASH DEAL',
        couponCode: 'HAVITALL25',
        originalPrice: 4500,
        offerPrice: 3150,
        discountPercentage: 30,
        durationHours: 48,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: OfferItem) => {
    setEditingOffer(offer);
    const matchedProd = products.find((p) => String(p._id) === String(offer.productId) || p.slug === offer.productSlug);
    setSelectedProduct(matchedProd || {
      _id: offer.productId,
      name: offer.productName,
      images: [offer.productImage],
      slug: offer.productSlug,
      price: offer.offerPrice,
      originalPrice: offer.originalPrice,
    });

    // Calculate remaining hours
    let hours = 48;
    if (offer.endDate) {
      const diffMs = new Date(offer.endDate).getTime() - Date.now();
      hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    }

    setFormData({
      title: offer.title,
      subtitle: offer.subtitle || '',
      badgeText: offer.badgeText || '⚡ LIMITED FLASH DEAL',
      couponCode: offer.couponCode || 'HAVITALL20',
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      discountPercentage: offer.discountPercentage,
      durationHours: hours,
      isActive: offer.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSelectProduct = (prod: any) => {
    setSelectedProduct(prod);
    const orig = Number(prod.originalPrice || prod.price * 1.35 || 4000);
    const off = Number(prod.price || 2800);
    const disc = Math.round(((orig - off) / orig) * 100) || 25;
    
    setFormData((prev) => ({
      ...prev,
      title: `Special Flash Deal on ${prod.name.slice(0, 32)}`,
      originalPrice: orig,
      offerPrice: off,
      discountPercentage: disc,
    }));
  };

  const handleOriginalPriceChange = (val: number) => {
    const orig = Number(val);
    const off = formData.offerPrice;
    const disc = orig > off ? Math.round(((orig - off) / orig) * 100) : 0;
    setFormData((prev) => ({ ...prev, originalPrice: orig, discountPercentage: disc }));
  };

  const handleOfferPriceChange = (val: number) => {
    const off = Number(val);
    const orig = formData.originalPrice;
    const disc = orig > off ? Math.round(((orig - off) / orig) * 100) : 0;
    setFormData((prev) => ({ ...prev, offerPrice: off, discountPercentage: disc }));
  };

  const handleDiscountChange = (val: number) => {
    const disc = Number(val);
    const orig = formData.originalPrice;
    const off = Math.round(orig * (1 - disc / 100));
    setFormData((prev) => ({ ...prev, discountPercentage: disc, offerPrice: off }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      error('Please select a product from the catalog list.');
      return;
    }

    try {
      setSubmitting(true);
      const endDate = new Date(Date.now() + formData.durationHours * 60 * 60 * 1000).toISOString();

      const payload = {
        productId: String(selectedProduct._id || selectedProduct.id || selectedProduct.slug || `prod_${Date.now()}`),
        productName: selectedProduct.name || formData.title,
        productImage: selectedProduct.images?.[0] || selectedProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
        productSlug: selectedProduct.slug || selectedProduct._id || 'flash-deal',
        originalPrice: Number(formData.originalPrice),
        offerPrice: Number(formData.offerPrice),
        discountPercentage: Number(formData.discountPercentage),
        title: formData.title,
        subtitle: formData.subtitle,
        badgeText: formData.badgeText,
        couponCode: formData.couponCode.toUpperCase().trim(),
        endDate,
        isActive: formData.isActive,
      };

      let res;
      if (editingOffer && editingOffer._id) {
        res = await fetch(`/api/offers/${editingOffer._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        success(editingOffer ? 'Flash offer updated successfully!' : 'New flash offer created!');
        setIsModalOpen(false);
        loadData();
      } else {
        error(data.error || 'Failed to save offer.');
      }
    } catch (err) {
      error('An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (offer: OfferItem) => {
    try {
      const newStatus = !offer.isActive;
      if (newStatus && activeOffersCount >= 2) {
        info('Max 2 active offers allowed. Oldest active offer will be replaced.');
      }

      // Optimistic update
      setOffers((prev) =>
        prev.map((o) => (o._id === offer._id ? { ...o, isActive: newStatus } : o))
      );

      const res = await fetch(`/api/offers/${offer._id || offer.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        success(`Offer "${offer.title}" is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
        loadData();
      } else {
        error(data.error || 'Failed to update offer status.');
        loadData();
      }
    } catch (err) {
      error('Failed to toggle active status.');
      loadData();
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this flash offer?')) return;
    try {
      // Optimistic update
      setOffers((prev) => prev.filter((o) => o._id !== offerId && o.productId !== offerId));

      const res = await fetch(`/api/offers/${offerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Flash offer removed.');
        loadData();
      } else {
        error(data.error || 'Failed to delete offer.');
        loadData();
      }
    } catch (err) {
      error('Failed to delete offer.');
      loadData();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
              Flash Offers & Deals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> Max 2 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick any real products from your catalog to run as high-converting homepage Flash Deals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            title="Refresh Offers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Flash Deal</span>
          </button>
        </div>
      </div>

      {/* Info Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            activeOffersCount > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400'
          }`}>
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live Active Deals</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-950 font-display">{activeOffersCount} / 2</h3>
              <span className="text-xs font-semibold text-slate-500">Active on Homepage</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Flash Offers</span>
            <h3 className="text-2xl font-black text-slate-950 font-display">{offers.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Highlight in Orders</span>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Flash offer items are highlighted with a special badge in customer cart, invoice & admin orders.
            </p>
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 shrink-0 ml-2" />
        </div>
      </div>

      {/* Active Offers List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-950 font-display">
          Configured Flash Deals ({offers.length})
        </h2>

        {offers.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">No flash deals configured yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create your first flash deal by picking a product from your catalog and setting a special price.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div
                key={offer._id || offer.productId}
                className={`p-6 rounded-3xl border transition-all ${
                  offer.isActive
                    ? 'bg-white border-slate-900 shadow-md ring-1 ring-slate-950'
                    : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Card Top: Badges & Status */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      offer.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${offer.isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                      {offer.isActive ? 'Active on Homepage' : 'Inactive'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                      {offer.badgeText || '⚡ FLASH DEAL'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(offer)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        offer.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                      title={offer.isActive ? 'Deactivate offer' : 'Activate offer on homepage'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(offer)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Offer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => (offer._id || offer.productId) && handleDeleteOffer(offer._id || offer.productId)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Offer Content */}
                <div className="pt-4 flex gap-4">
                  <img
                    src={offer.productImage}
                    alt={offer.productName}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl bg-slate-50 border border-slate-200 p-2 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-base font-bold text-slate-950 font-display line-clamp-1">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {offer.subtitle || `Special offer on ${offer.productName}`}
                    </p>

                    <div className="flex flex-wrap items-baseline gap-2 pt-1">
                      <span className="text-lg font-black text-slate-950 font-display">
                        ৳{offer.offerPrice.toLocaleString()}
                      </span>
                      {offer.originalPrice > offer.offerPrice && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            ৳{offer.originalPrice.toLocaleString()}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black">
                            {offer.discountPercentage}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        CODE: {offer.couponCode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Ends: {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Homepage Preview Banner */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                    Target: <strong className="text-slate-800">{offer.productName}</strong>
                  </span>
                  <Link
                    href={`/product/${offer.productSlug || offer.productId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-semibold text-[11px]"
                  >
                    <span>View Product</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Flash Offer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 font-display">
                  {editingOffer ? 'Edit Flash Deal' : 'Create Flash Deal'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Product Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  1. Select Product from Catalog <span className="text-rose-600">*</span>
                </label>

                {/* Selected Product summary badge */}
                {selectedProduct && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-300">
                    <img
                      src={selectedProduct.images?.[0] || selectedProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'}
                      alt={selectedProduct.name}
                      className="w-12 h-12 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Selected Product</span>
                      <p className="text-xs font-bold text-slate-950 truncate mt-0.5">{selectedProduct.name}</p>
                      <p className="text-[11px] text-slate-500">Regular Price: ৳{selectedProduct.originalPrice || selectedProduct.price}</p>
                    </div>
                  </div>
                )}

                {/* Search in products */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Product Select List */}
                <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50 p-2 space-y-1">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-slate-400 py-3 text-xs">No products found matching "{productSearch}"</p>
                  ) : (
                    filteredProducts.slice(0, 20).map((prod) => {
                      const isSel = selectedProduct && (String(selectedProduct._id) === String(prod._id) || selectedProduct.slug === prod.slug);
                      return (
                        <div
                          key={prod._id || prod.slug}
                          onClick={() => handleSelectProduct(prod)}
                          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                            isSel
                              ? 'bg-slate-950 text-white font-semibold'
                              : 'hover:bg-slate-200/70 text-slate-900'
                          }`}
                        >
                          <img
                            src={prod.images?.[0] || prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'}
                            alt={prod.name}
                            className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs truncate">{prod.name}</p>
                            <p className={`text-[11px] ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>
                              {prod.category} • Current Price: ৳{prod.price}
                            </p>
                          </div>
                          {isSel && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 2. Offer Marketing Copy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Flash Deal Headline / Title <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Subtitle / Promotional Text
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Coupon Promo Code
                  </label>
                  <input
                    type="text"
                    value={formData.couponCode}
                    onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 uppercase font-mono font-bold focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              {/* 3. Pricing & Discounts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Regular Price (৳)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.originalPrice}
                    onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Offer Price (৳) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.offerPrice}
                    onChange={(e) => handleOfferPriceChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black text-emerald-700 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={formData.discountPercentage}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold text-amber-700 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              {/* 4. Timer & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Countdown Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 self-end">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Active on Homepage</span>
                    <span className="text-[10px] text-slate-500">Max 2 active simultaneously</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 accent-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingOffer ? 'Save Changes' : 'Create Flash Deal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
