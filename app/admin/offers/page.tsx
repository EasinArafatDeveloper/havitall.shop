'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Power, 
  Check, 
  ExternalLink, 
  Search, 
  X,
  Flame,
  ArrowRight,
  Eye,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Link2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  Layers,
  ShoppingBag,
  BellRing,
  Truck,
  Gift,
  Palette,
  Megaphone,
  Copy
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface OfferItem {
  _id?: string;
  offerType: 'popup_poster' | 'flash_deal' | 'top_bar';
  productId?: string;
  productName?: string;
  productImage?: string;
  productSlug?: string;
  targetUrl?: string;
  posterImage?: string;
  originalPrice?: number;
  offerPrice?: number;
  discountPercentage?: number;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  buttonText?: string;
  couponCode?: string;
  endDate?: string;
  isActive: boolean;
  showAsPopup?: boolean;
  popupDelaySeconds?: number;
  order?: number;
  topBarText?: string;
  topBarHighlight?: string;
  topBarSuffix?: string;
  topBarLink?: string;
  topBarTheme?: string;
  topBarIcon?: string;
  createdAt?: string;
}

const TOP_BAR_PRESETS = [
  {
    name: '🚀 Grand Launch Offer',
    title: 'Grand Launch Announcement',
    topBarText: 'Grand Launch Special:',
    topBarHighlight: 'Flat 20% OFF Everything',
    topBarSuffix: '| Free Shipping over ৳1,500',
    topBarLink: '/shop',
    topBarTheme: 'dark_gold',
    topBarIcon: 'sparkles',
  },
  {
    name: '🔥 Mega Flash Sale',
    title: 'Flash Sale Alert',
    topBarText: 'Flash Sale Live:',
    topBarHighlight: 'Up to 50% OFF Today',
    topBarSuffix: '| Limited Stock Available',
    topBarLink: '/shop?isHot=true',
    topBarTheme: 'crimson',
    topBarIcon: 'flame',
  },
  {
    name: '🚚 Free Delivery Promo',
    title: 'Free Delivery Weekend',
    topBarText: 'Special Weekend Offer:',
    topBarHighlight: '100% Free Shipping',
    topBarSuffix: 'across Bangladesh on all orders',
    topBarLink: '/shop',
    topBarTheme: 'emerald',
    topBarIcon: 'truck',
  },
  {
    name: '🎁 Luxury Member Deal',
    title: 'VIP Exclusive Discount',
    topBarText: 'Exclusive Deal:',
    topBarHighlight: 'Save Extra ৳500',
    topBarSuffix: 'on min. ৳3,000 spend',
    topBarLink: '/shop',
    topBarTheme: 'neon_gradient',
    topBarIcon: 'gift',
  },
];

const THEME_OPTIONS = [
  { id: 'dark_gold', label: '🟡 Luxury Gold & Slate', bg: 'bg-slate-900', border: 'border-slate-800', highlight: 'text-amber-400' },
  { id: 'crimson', label: '🔴 Royal Crimson Red', bg: 'bg-rose-950', border: 'border-rose-800', highlight: 'text-rose-300' },
  { id: 'emerald', label: '🟢 Emerald Green', bg: 'bg-emerald-950', border: 'border-emerald-800', highlight: 'text-emerald-300' },
  { id: 'indigo', label: '🟣 Cyber Indigo', bg: 'bg-indigo-950', border: 'border-indigo-800', highlight: 'text-indigo-300' },
  { id: 'neon_gradient', label: '🌈 Neon Sunset Gradient', bg: 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500', border: 'border-transparent', highlight: 'bg-white/20 text-white' },
  { id: 'black', label: '⚫ Obsidian Black', bg: 'bg-zinc-950', border: 'border-zinc-800', highlight: 'text-white underline' },
];

const ICON_OPTIONS = [
  { id: 'sparkles', label: '✨ Sparkles' },
  { id: 'flame', label: '🔥 Flame / Hot' },
  { id: 'tag', label: '🏷️ Discount Tag' },
  { id: 'truck', label: '🚚 Fast Delivery' },
  { id: 'gift', label: '🎁 Gift Box' },
  { id: 'bell', label: '🔔 Alert Bell' },
];

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'popup_poster' | 'flash_deal' | 'top_bar'>('popup_poster');

  // Modals
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isTopBarModalOpen, setIsTopBarModalOpen] = useState(false);
  const [previewPoster, setPreviewPoster] = useState<OfferItem | null>(null);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);

  // Search & Upload State
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { success, error } = useToast();

  // Poster Form State
  const [posterFormData, setPosterFormData] = useState({
    title: 'ওয়েবসাইট এন্ট্রি অফার পোস্টার',
    posterImage: '',
    targetUrl: '/shop',
    isActive: true,
    popupDelaySeconds: 1,
  });

  // Deal Form State
  const [dealFormData, setDealFormData] = useState({
    title: 'সীমিত সময়ের ধামাকা ফ্ল্যাশ সেল!',
    subtitle: 'আমাদের এক্সক্লুসিভ লাক্সারি কালেকশনে উপভোগ করুন আকর্ষণীয় অফার। স্টক শেষ হওয়ার আগেই অর্ডার করুন।',
    badgeText: '🔥 LIMITED FLASH DEAL',
    originalPrice: 4500,
    offerPrice: 3150,
    discountPercentage: 30,
    durationHours: 48,
    isActive: true,
  });

  // Top Bar Form State
  const [topBarFormData, setTopBarFormData] = useState({
    title: 'গ্র্যান্ড লঞ্চ প্রমোশনাল টপ বার',
    topBarText: 'Grand Launch Special:',
    topBarHighlight: 'Flat 20% OFF Everything',
    topBarSuffix: '| Free Shipping over ৳1,500',
    topBarLink: '/shop',
    topBarTheme: 'dark_gold',
    topBarIcon: 'sparkles',
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

  const popupPosters = offers.filter((o) => o.offerType === 'popup_poster' || (!o.offerType && o.posterImage && !o.productId));
  const flashDeals = offers.filter((o) => o.offerType === 'flash_deal' || (!o.offerType && o.productId));
  const topBarOffers = offers.filter((o) => o.offerType === 'top_bar');

  const activePoster = popupPosters.find((o) => o.isActive);
  const activeDealsCount = flashDeals.filter((o) => o.isActive).length;
  const activeTopBar = topBarOffers.find((o) => o.isActive);

  // --- POSTER MODAL HANDLERS ---
  const handleOpenCreatePoster = () => {
    setEditingOffer(null);
    const firstProd = products[0] || null;
    setPosterFormData({
      title: 'নতুন অফার পোস্টার',
      posterImage: firstProd?.images?.[0] || firstProd?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
      targetUrl: firstProd ? `/product/${firstProd.slug || firstProd._id}` : '/shop',
      isActive: true,
      popupDelaySeconds: 1,
    });
    setIsPosterModalOpen(true);
  };

  const handleOpenEditPoster = (offer: OfferItem) => {
    setEditingOffer(offer);
    setPosterFormData({
      title: offer.title || 'অফার পোস্টার',
      posterImage: offer.posterImage || '',
      targetUrl: offer.targetUrl || (offer.productSlug ? `/product/${offer.productSlug}` : '/shop'),
      isActive: offer.isActive,
      popupDelaySeconds: offer.popupDelaySeconds || 1,
    });
    setIsPosterModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setPosterFormData((prev) => ({ ...prev, posterImage: json.url }));
        success('পোস্টার ইমেজ আপলোড হয়েছে! 🎉');
      } else {
        error(json.error || 'ইমেজ আপলোড ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      error('আপলোড এরর: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectProductForUrl = (prod: any) => {
    const slug = prod.slug || prod._id;
    setPosterFormData((prev) => ({
      ...prev,
      targetUrl: `/product/${slug}`,
      title: `অফার: ${prod.name.slice(0, 35)}`,
      posterImage: prev.posterImage || prod.images?.[0] || prod.image || '',
    }));
    success(`টার্গেট লিঙ্ক সেট করা হয়েছে: /product/${slug}`);
  };

  const handleSubmitPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterFormData.posterImage) {
      error('অনুগ্রহ করে একটি পোস্টার ইমেজ আপলোড করুন বা লিঙ্ক দিন।');
      return;
    }
    if (!posterFormData.targetUrl) {
      error('অনুগ্রহ করে টার্গেট লিঙ্ক / ডেস্টিনেশন URL দিন।');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        offerType: 'popup_poster',
        title: posterFormData.title.trim(),
        posterImage: posterFormData.posterImage.trim(),
        targetUrl: posterFormData.targetUrl.trim(),
        isActive: posterFormData.isActive,
        showAsPopup: true,
        popupDelaySeconds: Number(posterFormData.popupDelaySeconds) || 1,
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
        success(editingOffer ? 'পোস্টার আপডেট হয়েছে!' : 'নতুন এন্ট্রি পোস্টার সেভ হয়েছে! 🎉');
        setIsPosterModalOpen(false);
        loadData();
      } else {
        error(data.error || 'পোস্টার সেভ করতে সমস্যা হয়েছে।');
      }
    } catch {
      error('সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  // --- DEAL CARD MODAL HANDLERS ---
  const handleOpenCreateDeal = () => {
    setEditingOffer(null);
    const firstProd = products[0] || null;
    setSelectedProduct(firstProd);

    if (firstProd) {
      const orig = Number(firstProd.originalPrice || firstProd.price * 1.35 || 4500);
      const off = Number(firstProd.price || 3150);
      const disc = orig > off ? Math.round(((orig - off) / orig) * 100) : 25;
      setDealFormData({
        title: `স্পেশাল ফ্ল্যাশ ডিল: ${firstProd.name.slice(0, 32)}`,
        subtitle: 'সীমিত সময়ের স্পেশাল প্রাইস! স্টক শেষ হওয়ার আগেই অর্ডার করুন।',
        badgeText: '🔥 LIMITED FLASH DEAL',
        originalPrice: orig,
        offerPrice: off,
        discountPercentage: disc,
        durationHours: 48,
        isActive: true,
      });
    } else {
      setDealFormData({
        title: 'স্পেশাল ফ্ল্যাশ ডিল',
        subtitle: 'সীমিত সময়ের জন্য আকর্ষণীয় অফার। স্টক শেষ হওয়ার আগেই অর্ডার করুন।',
        badgeText: '🔥 LIMITED FLASH DEAL',
        originalPrice: 4500,
        offerPrice: 3150,
        discountPercentage: 30,
        durationHours: 48,
        isActive: true,
      });
    }
    setIsDealModalOpen(true);
  };

  const handleOpenEditDeal = (offer: OfferItem) => {
    setEditingOffer(offer);
    const matchedProd = products.find((p) => String(p._id) === String(offer.productId) || p.slug === offer.productSlug);
    setSelectedProduct(matchedProd || {
      _id: offer.productId,
      name: offer.productName,
      images: [offer.productImage || ''],
      slug: offer.productSlug,
      price: offer.offerPrice,
      originalPrice: offer.originalPrice,
    });

    let hours = 48;
    if (offer.endDate) {
      const diffMs = new Date(offer.endDate).getTime() - Date.now();
      hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    }

    setDealFormData({
      title: offer.title || '',
      subtitle: offer.subtitle || '',
      badgeText: offer.badgeText || '🔥 LIMITED FLASH DEAL',
      originalPrice: offer.originalPrice || 4500,
      offerPrice: offer.offerPrice || 3150,
      discountPercentage: offer.discountPercentage || 25,
      durationHours: hours,
      isActive: offer.isActive,
    });
    setIsDealModalOpen(true);
  };

  const handleSelectProductForDeal = (prod: any) => {
    setSelectedProduct(prod);
    const orig = Number(prod.originalPrice || prod.price * 1.35 || 4000);
    const off = Number(prod.price || 2800);
    const disc = orig > off ? Math.round(((orig - off) / orig) * 100) : 25;
    
    setDealFormData((prev) => ({
      ...prev,
      title: `স্পেশাল ফ্ল্যাশ ডিল: ${prod.name.slice(0, 32)}`,
      originalPrice: orig,
      offerPrice: off,
      discountPercentage: disc,
    }));
  };

  const handleSubmitDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      error('অনুগ্রহ করে ক্যাটালগ থেকে একটি প্রোডাক্ট সিলেক্ট করুন।');
      return;
    }

    try {
      setSubmitting(true);
      const endDate = new Date(Date.now() + dealFormData.durationHours * 60 * 60 * 1000).toISOString();
      const img = selectedProduct.images?.[0] || selectedProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';

      const payload = {
        offerType: 'flash_deal',
        productId: String(selectedProduct._id || selectedProduct.id || selectedProduct.slug),
        productName: selectedProduct.name || dealFormData.title,
        productImage: img,
        productSlug: selectedProduct.slug || selectedProduct._id || 'flash-deal',
        originalPrice: Number(dealFormData.originalPrice),
        offerPrice: Number(dealFormData.offerPrice),
        discountPercentage: Number(dealFormData.discountPercentage),
        title: dealFormData.title.trim(),
        subtitle: dealFormData.subtitle.trim(),
        badgeText: dealFormData.badgeText.trim(),
        endDate,
        isActive: dealFormData.isActive,
        showAsPopup: false,
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
        success(editingOffer ? 'ফ্ল্যাশ ডিল কার্ড আপডেট হয়েছে!' : 'হোমপেজ ফ্ল্যাশ ডিল কার্ড তৈরি হয়েছে! 🎉');
        setIsDealModalOpen(false);
        loadData();
      } else {
        error(data.error || 'ডিল সেভ করতে সমস্যা হয়েছে।');
      }
    } catch {
      error('সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  // --- TOP BAR MODAL HANDLERS ---
  const handleOpenCreateTopBar = () => {
    setEditingOffer(null);
    setTopBarFormData({
      title: 'গ্র্যান্ড লঞ্চ প্রমোশনাল টপ বার',
      topBarText: 'Grand Launch: Use code',
      topBarHighlight: 'HAVITALL20 for 20% OFF',
      topBarSuffix: '| Free Shipping over ৳1,500',
      topBarLink: '/shop',
      topBarTheme: 'dark_gold',
      topBarIcon: 'sparkles',
      isActive: true,
    });
    setIsTopBarModalOpen(true);
  };

  const handleOpenEditTopBar = (offer: OfferItem) => {
    setEditingOffer(offer);
    setTopBarFormData({
      title: offer.title || 'টপ অ্যানাউন্সমেন্ট বার',
      topBarText: offer.topBarText || 'Grand Launch: Use code',
      topBarHighlight: offer.topBarHighlight || 'HAVITALL20 for 20% OFF',
      topBarSuffix: offer.topBarSuffix || '| Free Shipping over ৳1,500',
      topBarLink: offer.topBarLink || '/shop',
      topBarTheme: offer.topBarTheme || 'dark_gold',
      topBarIcon: offer.topBarIcon || 'sparkles',
      isActive: offer.isActive,
    });
    setIsTopBarModalOpen(true);
  };

  const handleApplyTopBarPreset = (preset: typeof TOP_BAR_PRESETS[0]) => {
    setTopBarFormData((prev) => ({
      ...prev,
      title: preset.title,
      topBarText: preset.topBarText,
      topBarHighlight: preset.topBarHighlight,
      topBarSuffix: preset.topBarSuffix,
      topBarLink: preset.topBarLink,
      topBarTheme: preset.topBarTheme,
      topBarIcon: preset.topBarIcon,
    }));
    success(`প্রিসেট "${preset.name}" অ্যাপ্লাই করা হয়েছে!`);
  };

  const handleSubmitTopBar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topBarFormData.topBarHighlight && !topBarFormData.topBarText) {
      error('অনুগ্রহ করে টপ বারের টেক্সট বা হাইলাইট লিখুন।');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        offerType: 'top_bar',
        title: topBarFormData.title.trim(),
        topBarText: topBarFormData.topBarText.trim(),
        topBarHighlight: topBarFormData.topBarHighlight.trim(),
        topBarSuffix: topBarFormData.topBarSuffix.trim(),
        topBarLink: topBarFormData.topBarLink.trim(),
        topBarTheme: topBarFormData.topBarTheme,
        topBarIcon: topBarFormData.topBarIcon,
        isActive: topBarFormData.isActive,
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
        success(editingOffer ? 'টপ বার আপডেট হয়েছে!' : 'নতুন টপ অ্যানাউন্সমেন্ট বার পাবলিশ হয়েছে! 🎉');
        setIsTopBarModalOpen(false);
        loadData();
      } else {
        error(data.error || 'টপ বার সেভ করতে সমস্যা হয়েছে।');
      }
    } catch {
      error('সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  // --- GENERAL HANDLERS ---
  const handleToggleActive = async (offer: OfferItem) => {
    try {
      const newStatus = !offer.isActive;
      setOffers((prev) =>
        prev.map((o) => (o._id === offer._id ? { ...o, isActive: newStatus } : o))
      );

      const res = await fetch(`/api/offers/${offer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus, offerType: offer.offerType }),
      });

      const data = await res.json();
      if (data.success) {
        success(`স্ট্যাটাস এখন ${newStatus ? 'সক্রিয় (ACTIVE) ✅' : 'বন্ধ (INACTIVE)'}`);
        loadData();
      } else {
        error(data.error || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
        loadData();
      }
    } catch {
      error('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      loadData();
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('আপনি কি এই অফারটি মুছে ফেলতে চান?')) return;
    try {
      setOffers((prev) => prev.filter((o) => o._id !== offerId));
      const res = await fetch(`/api/offers/${offerId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('অফার মুছে ফেলা হয়েছে।');
        loadData();
      } else {
        error(data.error || 'মুছতে ব্যর্থ হয়েছে।');
        loadData();
      }
    } catch {
      error('মুছতে ব্যর্থ হয়েছে।');
      loadData();
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const renderIconPreview = (iconName?: string, className = 'w-3.5 h-3.5 shrink-0') => {
    switch (iconName) {
      case 'flame':
        return <Flame className={className} />;
      case 'tag':
        return <Tag className={className} />;
      case 'truck':
        return <Truck className={className} />;
      case 'gift':
        return <Gift className={className} />;
      case 'bell':
        return <BellRing className={className} />;
      case 'sparkles':
      default:
        return <Sparkles className={className} />;
    }
  };

  const getThemeDisplay = (themeId?: string) => {
    switch (themeId) {
      case 'crimson':
        return { wrapper: 'bg-rose-950 text-rose-100 border-rose-800', highlight: 'text-rose-300 underline decoration-rose-400 font-bold', icon: 'text-rose-400' };
      case 'emerald':
        return { wrapper: 'bg-emerald-950 text-emerald-100 border-emerald-800', highlight: 'text-emerald-300 underline decoration-emerald-400 font-bold', icon: 'text-emerald-400' };
      case 'indigo':
        return { wrapper: 'bg-indigo-950 text-indigo-100 border-indigo-800', highlight: 'text-indigo-300 underline decoration-indigo-400 font-bold', icon: 'text-indigo-400' };
      case 'neon_gradient':
        return { wrapper: 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 text-white shadow-xs border-transparent', highlight: 'bg-white/20 px-2 py-0.5 rounded text-white font-bold', icon: 'text-amber-200' };
      case 'black':
        return { wrapper: 'bg-zinc-950 text-zinc-200 border-zinc-800', highlight: 'text-white underline decoration-zinc-400 font-bold', icon: 'text-zinc-400' };
      case 'dark_gold':
      default:
        return { wrapper: 'bg-slate-900 text-slate-200 border-slate-800', highlight: 'text-amber-400 underline decoration-amber-400 font-bold', icon: 'text-amber-400' };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-sm">
              <Flame className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
                Offers & Promotions Hub
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                ৩ ধরনের অফার ম্যানেজ করুন: <strong>পপআপ পোস্টার</strong>, <strong>ফ্ল্যাশ ডিল কার্ড</strong> এবং <strong>টপ অ্যানাউন্সমেন্ট বার</strong>।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {activeTab === 'popup_poster' && (
            <button
              onClick={handleOpenCreatePoster}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Entry Poster</span>
            </button>
          )}

          {activeTab === 'flash_deal' && (
            <button
              onClick={handleOpenCreateDeal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create Flash Deal Card</span>
            </button>
          )}

          {activeTab === 'top_bar' && (
            <button
              onClick={handleOpenCreateTopBar}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all transform active:scale-95 cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Create Top Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switcher Tabs (3 Tabs) */}
      <div className="flex p-1.5 rounded-2xl bg-slate-200/80 max-w-2xl gap-1">
        <button
          onClick={() => setActiveTab('popup_poster')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'popup_poster'
              ? 'bg-white text-slate-950 shadow-md scale-100'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">১. এন্ট্রি পপআপ পোস্টার ({popupPosters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flash_deal')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'flash_deal'
              ? 'bg-white text-slate-950 shadow-md scale-100'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="truncate">২. ফ্ল্যাশ ডিল কার্ড ({flashDeals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('top_bar')}
          className={`flex-1 py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'top_bar'
              ? 'bg-white text-slate-950 shadow-md scale-100'
              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
          }`}
        >
          <Megaphone className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate">৩. টপ অ্যানাউন্সমেন্ট বার ({topBarOffers.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WEBSITE ENTRY POPUP POSTER SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'popup_poster' && (
        <div className="space-y-6">
          {/* Active Status Highlight Card */}
          {activePoster ? (
            <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img
                  src={activePoster.posterImage}
                  alt="Active Poster"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-slate-900 border border-slate-700 p-1 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Currently Live on Website Entry
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate font-display">
                    {activePoster.title || 'Live Promotional Poster'}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono truncate flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Target URL: {activePoster.targetUrl || '/shop'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <button
                  onClick={() => setPreviewPoster(activePoster)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Preview Popup</span>
                </button>
                <button
                  onClick={() => handleOpenEditPoster(activePoster)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Change Poster / URL</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">No Active Popup Poster</p>
                  <p className="text-xs text-amber-800">বর্তমানে ওয়েবসাইটে কোনো এন্ট্রি পপআপ পোস্টার সক্রিয় নেই। পোস্টার চালু করতে নিচে তৈরি করুন বা সক্রিয় করুন।</p>
                </div>
              </div>
              <button
                onClick={handleOpenCreatePoster}
                className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
              >
                Upload Poster
              </button>
            </div>
          )}

          {/* Posters Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Configured Entry Posters ({popupPosters.length})</h3>

            {popupPosters.length === 0 ? (
              <div className="p-10 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
                <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">কোনো পোস্টার আপলোড করা নেই। আপনার কম্পিউটার থেকে একটি ইমেজ আপলোড করুন।</p>
                <button
                  onClick={handleOpenCreatePoster}
                  className="px-5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold"
                >
                  Upload Poster
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {popupPosters.map((poster) => (
                  <div
                    key={poster._id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                      poster.isActive
                        ? 'bg-white border-slate-950 shadow-md ring-2 ring-slate-950/10'
                        : 'bg-white border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                          poster.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${poster.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {poster.isActive ? 'Active on Website' : 'Disabled'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewPoster(poster)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(poster)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              poster.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={poster.isActive ? 'Disable' : 'Enable'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditPoster(poster)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => poster._id && handleDeleteOffer(poster._id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 space-y-3">
                        <div 
                          onClick={() => setPreviewPoster(poster)}
                          className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden cursor-pointer group border border-slate-200"
                        >
                          <img
                            src={poster.posterImage}
                            alt="Poster"
                            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Click to Preview Popup</span>
                            </span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900">{poster.title || 'Untitled Poster'}</p>
                          <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                            Target: <strong>{poster.targetUrl || '/shop'}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <Link
                        href={poster.targetUrl || '/shop'}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-950 font-semibold text-[11px]"
                      >
                        <span>Test Destination URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOMEPAGE FLASH DEALS (CARD FORMAT) */}
      {/* ========================================================================= */}
      {activeTab === 'flash_deal' && (
        <div className="space-y-6">
          {/* Flash Deals Header Info */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Homepage Flash Deals Section</span>
                <h3 className="text-lg font-bold text-white font-display">Active Deals on Homepage: {activeDealsCount} / 2</h3>
                <p className="text-xs text-slate-400">এই অফারগুলো হোমপেজের "Deal of the Day" সেকশনে কার্ড আকারে কাউন্টডাউন টাইমার ও ডিসকাউন্ট সহ শো হবে।</p>
              </div>
            </div>
            <button
              onClick={handleOpenCreateDeal}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 hidden sm:block cursor-pointer"
            >
              + New Deal Card
            </button>
          </div>

          {/* Flash Deals Cards Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Configured Flash Deals ({flashDeals.length})</h3>

            {flashDeals.length === 0 ? (
              <div className="p-10 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
                <Flame className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">হোমপেজে দেখানোর জন্য কোনো ফ্ল্যাশ ডিল তৈরি করা নেই।</p>
                <button
                  onClick={handleOpenCreateDeal}
                  className="px-5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Deal Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {flashDeals.map((deal) => (
                  <div
                    key={deal._id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                      deal.isActive
                        ? 'bg-white border-slate-950 shadow-md ring-2 ring-slate-950/10'
                        : 'bg-white border-slate-200 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Top bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                            deal.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${deal.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {deal.isActive ? 'Active on Homepage' : 'Disabled'}
                          </span>

                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {deal.badgeText || '⚡ DEAL'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleActive(deal)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              deal.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={deal.isActive ? 'Disable' : 'Enable'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditDeal(deal)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deal._id && handleDeleteOffer(deal._id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-4 flex gap-4">
                        <img
                          src={deal.productImage || deal.posterImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200'}
                          alt={deal.productName}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <h4 className="text-sm font-bold text-slate-950 font-display line-clamp-1">{deal.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{deal.subtitle}</p>

                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-base font-black text-slate-950 font-display">৳{deal.offerPrice?.toLocaleString()}</span>
                            {deal.originalPrice && deal.originalPrice > (deal.offerPrice || 0) && (
                              <>
                                <span className="text-xs text-slate-400 line-through">৳{deal.originalPrice?.toLocaleString()}</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">{deal.discountPercentage}% OFF</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                      <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        Target: <strong>{deal.productName}</strong>
                      </span>
                      <Link
                        href={`/product/${deal.productSlug || deal.productId}`}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TOP ANNOUNCEMENT BAR SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'top_bar' && (
        <div className="space-y-6">
          {/* Active Top Bar Live Showcase Card */}
          {activeTopBar ? (
            <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Currently Live on Top of Website Navbar
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display">
                    {activeTopBar.title || 'Active Announcement Bar'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditTopBar(activeTopBar)}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Top Bar</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Live Visual Preview on Storefront:</span>
                
                {(() => {
                  const style = getThemeDisplay(activeTopBar.topBarTheme);
                  return (
                    <div className={`py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 font-medium text-center border shadow-xs ${style.wrapper}`}>
                      <span className={style.icon}>
                        {renderIconPreview(activeTopBar.topBarIcon)}
                      </span>
                      <span>
                        {activeTopBar.topBarText || 'Grand Launch: Use code'}{' '}
                        <span className={style.highlight}>
                          {activeTopBar.topBarHighlight || 'HAVITALL20 for 20% OFF'}
                        </span>{' '}
                        {activeTopBar.topBarSuffix || '| Free Shipping over ৳1,500'}
                      </span>
                      {activeTopBar.topBarLink && (
                        <ArrowRight className="w-3.5 h-3.5 opacity-75 shrink-0" />
                      )}
                    </div>
                  );
                })()}
              </div>

              {activeTopBar.topBarLink && (
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Click Action Destination: <strong className="text-slate-200">{activeTopBar.topBarLink}</strong></span>
                </p>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-sm">No Active Top Announcement Bar</p>
                  <p className="text-xs text-amber-800">বর্তমানে ওয়েবসাইটের টপ বার অফ করা আছে। চালু করতে নতুন বার তৈরি করুন অথবা নিচের তালিকা থেকে সক্রিয় করুন।</p>
                </div>
              </div>
              <button
                onClick={handleOpenCreateTopBar}
                className="px-4 py-2 bg-slate-950 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer"
              >
                Create Top Bar
              </button>
            </div>
          )}

          {/* Quick Presets Showcase */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900">One-Click Quick Announcement Templates</h4>
              </div>
              <span className="text-[10px] text-slate-400">ক্লিক করে সরাসরি তৈরি করুন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TOP_BAR_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleApplyTopBarPreset(preset);
                    setIsTopBarModalOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-950 group-hover:text-amber-900">{preset.name}</span>
                    <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {preset.topBarText} <strong>{preset.topBarHighlight}</strong> {preset.topBarSuffix}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Bar List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Configured Top Bars ({topBarOffers.length})</h3>

            {topBarOffers.length === 0 ? (
              <div className="p-10 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
                <Megaphone className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">কোনো টপ অ্যানাউন্সমেন্ট বার তৈরি করা নেই।</p>
                <button
                  onClick={handleOpenCreateTopBar}
                  className="px-5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Create Top Announcement
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {topBarOffers.map((item) => {
                  const style = getThemeDisplay(item.topBarTheme);
                  return (
                    <div
                      key={item._id}
                      className={`p-4 rounded-3xl border transition-all ${
                        item.isActive
                          ? 'bg-white border-slate-950 shadow-md ring-2 ring-slate-950/10'
                          : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 ${
                              item.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              {item.isActive ? 'Active on Top Bar' : 'Disabled'}
                            </span>

                            <span className="text-xs font-bold text-slate-900">{item.title || 'Top Announcement'}</span>
                          </div>

                          {/* Preview Bar */}
                          <div className={`py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-2 font-medium text-center border ${style.wrapper}`}>
                            <span className={style.icon}>
                              {renderIconPreview(item.topBarIcon)}
                            </span>
                            <span className="truncate">
                              {item.topBarText || 'Grand Launch: Use code'}{' '}
                              <span className={style.highlight}>
                                {item.topBarHighlight || 'HAVITALL20 for 20% OFF'}
                              </span>{' '}
                              {item.topBarSuffix || '| Free Shipping over ৳1,500'}
                            </span>
                          </div>

                          {item.topBarLink && (
                            <p className="text-[11px] text-slate-500 font-mono truncate">
                              Destination Link: <strong>{item.topBarLink}</strong>
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              item.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title={item.isActive ? 'Disable' : 'Set as Active Top Bar'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{item.isActive ? 'Active' : 'Enable'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditTopBar(item)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => item._id && handleDeleteOffer(item._id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT POSTER POPUP */}
      {/* ========================================================================= */}
      {isPosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div onClick={() => setIsPosterModalOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-950 text-white flex items-center justify-center">
                  <Upload className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 font-display">
                    {editingOffer ? 'Edit Entry Poster & Link' : 'Upload Entry Poster & Set Destination URL'}
                  </h3>
                  <p className="text-[11px] text-slate-500">ওয়েবসাইটে ঢোকার সাথে সাথে যে পোস্টারটি ভেসে উঠবে</p>
                </div>
              </div>
              <button onClick={() => setIsPosterModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPoster} className="space-y-6">
              {/* Poster Upload */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-700" />
                  <span>১. পোস্টার ইমেজ আপলোড করুন (কম্পিউটার বা ডিভাইস থেকে) <span className="text-rose-600">*</span></span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="poster-upload-input"
                  />
                  <label
                    htmlFor="poster-upload-input"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Uploading Image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Choose Image File (PNG, JPG, WEBP)</span>
                      </>
                    )}
                  </label>

                  <span className="text-xs text-slate-400 font-semibold">অথবা সরাসরি লিঙ্ক দিন:</span>
                </div>

                <input
                  type="text"
                  placeholder="https://... (পোস্টার ইমেজের সরাসরি লিঙ্ক)"
                  value={posterFormData.posterImage}
                  onChange={(e) => setPosterFormData({ ...posterFormData, posterImage: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />

                {posterFormData.posterImage && (
                  <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-4">
                    <img
                      src={posterFormData.posterImage}
                      alt="Preview"
                      className="w-24 h-24 object-contain rounded-xl bg-slate-900 p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000';
                      }}
                    />
                    <div className="text-xs text-slate-600">
                      <p className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Poster Ready
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">ওয়েবসাইটে ঢুকলে এই পোস্টারটি কাস্টমারের সামনে ভেসে উঠবে।</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Destination URL */}
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-amber-700" />
                  <span>২. টার্গেট Destination URL (পোস্টারে ক্লিক করলে যে পেজে যাবে) <span className="text-rose-600">*</span></span>
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. /product/rolex-submariner or /shop"
                  value={posterFormData.targetUrl}
                  onChange={(e) => setPosterFormData({ ...posterFormData, targetUrl: e.target.value })}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-950 font-bold font-mono focus:outline-none focus:border-slate-950"
                />

                {/* Quick Pick helper */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 block">ক্যাটালগের প্রোডাক্ট থেকে লিঙ্ক সিলেক্ট করুন:</span>
                  <div className="max-h-28 overflow-y-auto divide-y divide-slate-100 border border-amber-200 rounded-xl bg-white p-1">
                    {products.slice(0, 15).map((prod) => (
                      <div
                        key={prod._id || prod.slug}
                        onClick={() => handleSelectProductForUrl(prod)}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-amber-100/60 cursor-pointer text-xs"
                      >
                        <span className="font-medium text-slate-900 truncate max-w-[320px]">{prod.name}</span>
                        <span className="text-[10px] text-amber-900 font-bold shrink-0 ml-2">Select URL ➔</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-950 block">⚡ Active on Website Entry</span>
                  <span className="text-[10px] text-slate-500">ওয়েবসাইটে পোস্টারটি চালু রাখুন</span>
                </div>
                <input
                  type="checkbox"
                  checked={posterFormData.isActive}
                  onChange={(e) => setPosterFormData({ ...posterFormData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-slate-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsPosterModalOpen(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingOffer ? 'Save Changes' : 'Save & Publish Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT HOMEPAGE FLASH DEAL CARD */}
      {/* ========================================================================= */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div onClick={() => setIsDealModalOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                  <Flame className="w-5 h-5 fill-white text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 font-display">
                    {editingOffer ? 'Edit Homepage Flash Deal Card' : 'Create Homepage Flash Deal Card'}
                  </h3>
                  <p className="text-[11px] text-slate-500">হোমপেজে Deal of the Day সেকশনে কার্ড আকারে কাউন্টডাউন সহ শো হবে</p>
                </div>
              </div>
              <button onClick={() => setIsDealModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeal} className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">
                  ১. ক্যাটালগ থেকে প্রোডাক্ট সিলেক্ট করুন <span className="text-rose-600">*</span>
                </label>

                {selectedProduct && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                    <img
                      src={selectedProduct.images?.[0] || selectedProduct.image || ''}
                      alt={selectedProduct.name}
                      className="w-12 h-12 object-contain rounded-xl bg-white border border-rose-200 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded">Selected Product</span>
                      <p className="text-xs font-bold text-slate-950 truncate mt-0.5">{selectedProduct.name}</p>
                      <p className="text-[11px] text-slate-600 font-medium">Regular Price: ৳{selectedProduct.originalPrice || selectedProduct.price}</p>
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search product from catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-slate-50 p-2 space-y-1">
                  {filteredProducts.slice(0, 15).map((prod) => {
                    const isSel = selectedProduct && (String(selectedProduct._id) === String(prod._id) || selectedProduct.slug === prod.slug);
                    return (
                      <div
                        key={prod._id || prod.slug}
                        onClick={() => handleSelectProductForDeal(prod)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors ${
                          isSel ? 'bg-slate-950 text-white font-semibold' : 'hover:bg-slate-200/70 text-slate-900'
                        }`}
                      >
                        <img
                          src={prod.images?.[0] || prod.image || ''}
                          alt={prod.name}
                          className="w-8 h-8 object-contain rounded bg-white p-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">{prod.name}</p>
                          <p className={`text-[10px] ${isSel ? 'text-slate-300' : 'text-slate-500'}`}>{prod.category} • ৳{prod.price}</p>
                        </div>
                        {isSel && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Headlines & Copy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Deal Title / Headline <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    required
                    value={dealFormData.title}
                    onChange={(e) => setDealFormData({ ...dealFormData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Subtitle / Description</label>
                  <input
                    type="text"
                    value={dealFormData.subtitle}
                    onChange={(e) => setDealFormData({ ...dealFormData, subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Badge Text (e.g. 🔥 LIMITED FLASH DEAL)</label>
                  <input
                    type="text"
                    value={dealFormData.badgeText}
                    onChange={(e) => setDealFormData({ ...dealFormData, badgeText: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Regular Price (৳)</label>
                  <input
                    type="number"
                    min="1"
                    value={dealFormData.originalPrice}
                    onChange={(e) => {
                      const orig = Number(e.target.value);
                      const off = dealFormData.offerPrice;
                      const disc = orig > off ? Math.round(((orig - off) / orig) * 100) : 0;
                      setDealFormData((prev) => ({ ...prev, originalPrice: orig, discountPercentage: disc }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Offer Price (৳) *</label>
                  <input
                    type="number"
                    min="1"
                    value={dealFormData.offerPrice}
                    onChange={(e) => {
                      const off = Number(e.target.value);
                      const orig = dealFormData.originalPrice;
                      const disc = orig > off ? Math.round(((orig - off) / orig) * 100) : 0;
                      setDealFormData((prev) => ({ ...prev, offerPrice: off, discountPercentage: disc }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-black text-emerald-700 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={dealFormData.discountPercentage}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      const orig = dealFormData.originalPrice;
                      const off = Math.round(orig * (1 - disc / 100));
                      setDealFormData((prev) => ({ ...prev, discountPercentage: disc, offerPrice: off }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold text-amber-700 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-950 block">⚡ Active on Homepage (Max 2 simultaneous)</span>
                  <span className="text-[10px] text-slate-500">হোমপেজে ফ্ল্যাশ ডিল সেকশনে চালু রাখুন</span>
                </div>
                <input
                  type="checkbox"
                  checked={dealFormData.isActive}
                  onChange={(e) => setDealFormData({ ...dealFormData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-slate-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsDealModalOpen(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingOffer ? 'Save Changes' : 'Create Flash Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE / EDIT TOP ANNOUNCEMENT BAR */}
      {/* ========================================================================= */}
      {isTopBarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div onClick={() => setIsTopBarModalOpen(false)} className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950 font-display">
                    {editingOffer ? 'Edit Top Announcement Bar' : 'Create Top Announcement Bar'}
                  </h3>
                  <p className="text-[11px] text-slate-500">ওয়েবসাইটের একদম উপরে (Navbar-এর শীর্ষে) নোটিফিকেশন বার শো হবে</p>
                </div>
              </div>
              <button onClick={() => setIsTopBarModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Live Preview (লাইভ প্রিভিউ)
              </span>

              {(() => {
                const style = getThemeDisplay(topBarFormData.topBarTheme);
                return (
                  <div className={`py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 font-medium text-center border shadow-xs transition-all ${style.wrapper}`}>
                    <span className={style.icon}>
                      {renderIconPreview(topBarFormData.topBarIcon)}
                    </span>
                    <span>
                      {topBarFormData.topBarText || 'Grand Launch: Use code'}{' '}
                      <span className={style.highlight}>
                        {topBarFormData.topBarHighlight || 'HAVITALL20 for 20% OFF'}
                      </span>{' '}
                      {topBarFormData.topBarSuffix || '| Free Shipping over ৳1,500'}
                    </span>
                    {topBarFormData.topBarLink && (
                      <ArrowRight className="w-3.5 h-3.5 opacity-75 shrink-0" />
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Quick Templates Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700">Quick Templates (এক ক্লিকে প্রিসেট বসান):</span>
              <div className="flex flex-wrap gap-2">
                {TOP_BAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTopBarPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-950 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitTopBar} className="space-y-5">
              {/* Internal Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Announcement Title / Internal Name</label>
                <input
                  type="text"
                  value={topBarFormData.title}
                  onChange={(e) => setTopBarFormData({ ...topBarFormData, title: e.target.value })}
                  placeholder="e.g. Grand Launch Discount Bar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              {/* Lead Text + Highlight + Suffix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">১. Lead Text (শুরুর লেখা)</label>
                  <input
                    type="text"
                    value={topBarFormData.topBarText}
                    onChange={(e) => setTopBarFormData({ ...topBarFormData, topBarText: e.target.value })}
                    placeholder="e.g. Grand Launch: Use code"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-800">২. Highlight (মূল অফার/কুপন) *</label>
                  <input
                    type="text"
                    required
                    value={topBarFormData.topBarHighlight}
                    onChange={(e) => setTopBarFormData({ ...topBarFormData, topBarHighlight: e.target.value })}
                    placeholder="e.g. HAVITALL20 for 20% OFF"
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-950 font-bold focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">৩. Suffix (শেষের বার্তা)</label>
                  <input
                    type="text"
                    value={topBarFormData.topBarSuffix}
                    onChange={(e) => setTopBarFormData({ ...topBarFormData, topBarSuffix: e.target.value })}
                    placeholder="e.g. | Free Shipping over ৳1,500"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              {/* Destination URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-indigo-700" />
                  <span>ক্লিক করলে যে পেজে যাবে (Destination URL)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. /shop, /shop?isHot=true, or /product/slug"
                  value={topBarFormData.topBarLink}
                  onChange={(e) => setTopBarFormData({ ...topBarFormData, topBarLink: e.target.value })}
                  className="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-mono font-bold focus:outline-none focus:border-slate-950"
                />
              </div>

              {/* Theme & Icon Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Theme Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-slate-700" />
                    <span>কালার থিম (Color Palette)</span>
                  </label>
                  <select
                    value={topBarFormData.topBarTheme}
                    onChange={(e) => setTopBarFormData({ ...topBarFormData, topBarTheme: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-950 cursor-pointer"
                  >
                    {THEME_OPTIONS.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Icon */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-slate-700" />
                    <span>আইকন (Prefix Icon)</span>
                  </label>
                  <select
                    value={topBarFormData.topBarIcon}
                    onChange={(e) => setTopBarFormData({ ...topBarFormData, topBarIcon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-950 cursor-pointer"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon.id} value={icon.id}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-950 block">⚡ Active on Website Top Bar</span>
                  <span className="text-[10px] text-slate-500">এটি সক্রিয় করলে ওয়েবসাইটের শীর্ষে এই অফারটি দেখা যাবে (অন্যান্য টপ বার অটোমেটিক নিষ্ক্রিয় হবে)</span>
                </div>
                <input
                  type="checkbox"
                  checked={topBarFormData.isActive}
                  onChange={(e) => setTopBarFormData({ ...topBarFormData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-slate-950 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsTopBarModalOpen(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingOffer ? 'Save Changes' : 'Publish Top Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Poster Popup Preview Modal */}
      {previewPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
          <div onClick={() => setPreviewPoster(null)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer" />

          <div className="relative z-10 my-auto max-w-lg sm:max-w-xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setPreviewPoster(null)}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white border-2 border-white/30 flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div 
              onClick={() => {
                alert(`Clicked poster! In live mode, this will open: ${previewPoster.targetUrl || '/shop'}`);
                setPreviewPoster(null);
              }}
              className="relative w-full overflow-hidden rounded-3xl shadow-2xl border border-white/10 cursor-pointer group bg-slate-900"
            >
              <img
                src={previewPoster.posterImage}
                alt={previewPoster.title || 'Special Promotional Offer'}
                className="w-full h-auto max-h-[82vh] object-contain block group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none flex items-end justify-center pb-4">
                <div className="bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                  <span>ক্লিক করলে এই লিঙ্কে যাবে: {previewPoster.targetUrl || '/shop'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
