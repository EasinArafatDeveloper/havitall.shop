'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Flame, 
  Star,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { formatImageUrl } from '@/lib/mediaUtils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'featured' | 'hot'>('all');
  const [scannedDrivePhotos, setScannedDrivePhotos] = useState<string[]>([]);
  const [driveScanUrl, setDriveScanUrl] = useState('');
  const [isScanningDrive, setIsScanningDrive] = useState(false);
  const { success, error, info } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'luxury-watches',
    stock: '15',
    imageUrls: '',
    videoUrl: '',
    description: '',
    shortDescription: '',
    isHot: false,
    isFeatured: false,
    badge: '',
    colors: '',
    sizes: '',
    features: '',
  });

  const handleScanDrive = async () => {
    if (!driveScanUrl.trim()) {
      error('Please enter a Google Drive link (Folder or File)');
      return;
    }
    setIsScanningDrive(true);
    try {
      const res = await fetch('/api/admin/media-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveUrl: driveScanUrl.trim() }),
      });
      const data = await res.json();
      if (data.success && data.images?.length > 0) {
        success(`${data.images.length} Drive photo(s) found! Click on the photos below to select only the ones you want.`);
        // Set scanned photos for this product session
        setScannedDrivePhotos(data.images);
        // Note: Photos remain unselected by default so user can choose specifically
        setDriveScanUrl('');
      } else {
        error(data.error || 'No images found in this Google Drive link');
      }
    } catch {
      error('Failed to scan Google Drive link');
    } finally {
      setIsScanningDrive(false);
    }
  };

  const toggleImageSelection = (imgUrl: string) => {
    const currentList = formData.imageUrls
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const existsIndex = currentList.indexOf(imgUrl);
    let updatedList: string[];
    if (existsIndex > -1) {
      updatedList = currentList.filter((u) => u !== imgUrl);
    } else {
      updatedList = [...currentList, imgUrl];
    }
    setFormData((prev) => ({
      ...prev,
      imageUrls: updatedList.join('\n'),
    }));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?limit=100'),
        fetch('/api/categories'),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      if (prodData.success) {
        setProducts(prodData.products || []);
      }
      if (catData.success) setCategories(catData.categories || []);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFeatured = async (product: any) => {
    const newStatus = !product.isFeatured;
    const targetId = product.slug || product._id || product.businessKoroId;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id || p.slug === product.slug
          ? { ...p, isFeatured: newStatus }
          : p
      )
    );

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFeatured: newStatus,
          name: product.name,
          slug: product.slug,
          businessKoroId: product.businessKoroId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus) {
          success(`⭐ "${product.name}" is now LIVE on Homepage Featured Collections!`);
        } else {
          info(`Removed "${product.name}" from Featured Collections.`);
        }
      } else {
        error(data.error || 'Failed to update featured status on server');
        loadData();
      }
    } catch {
      error('Network error updating status');
      loadData();
    }
  };

  const handleToggleHot = async (product: any) => {
    const newStatus = !product.isHot;
    const targetId = product.slug || product._id || product.businessKoroId;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id || p.slug === product.slug
          ? { ...p, isHot: newStatus }
          : p
      )
    );

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHot: newStatus,
          name: product.name,
          slug: product.slug,
          businessKoroId: product.businessKoroId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus) {
          success(`🔥 "${product.name}" marked as Hot Deal!`);
        } else {
          info(`Removed "${product.name}" from Hot Deals.`);
        }
      } else {
        error(data.error || 'Failed to update hot status on server');
        loadData();
      }
    } catch {
      error('Network error updating hot status');
      loadData();
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setScannedDrivePhotos([]);
    setDriveScanUrl('');
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: categories[0]?.slug || 'luxury-watches',
      stock: '15',
      imageUrls: '',
      videoUrl: '',
      description: '',
      shortDescription: '',
      isHot: false,
      isFeatured: false,
      badge: 'New',
      colors: '',
      sizes: '',
      features: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setScannedDrivePhotos([]);
    setDriveScanUrl('');
    const existingImgs = (Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || '']).filter(Boolean);
    setFormData({
      name: product.name || '',
      price: String(product.price ?? ''),
      originalPrice: String(product.originalPrice ?? ''),
      category: product.category || 'luxury-watches',
      stock: String(product.stock ?? 10),
      imageUrls: existingImgs.join('\n'),
      videoUrl: product.videoUrl || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      isHot: Boolean(product.isHot),
      isFeatured: Boolean(product.isFeatured),
      badge: product.badge || '',
      colors: Array.isArray(product.variants?.colors)
        ? product.variants.colors.join(', ')
        : (typeof product.variants?.colors === 'string' ? product.variants.colors : ''),
      sizes: Array.isArray(product.variants?.sizes)
        ? product.variants.sizes.join(', ')
        : (typeof product.variants?.sizes === 'string' ? product.variants.sizes : ''),
      features: Array.isArray(product.features)
        ? product.features.join(', ')
        : (typeof product.features === 'string' ? product.features : ''),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success(`Product "${name}" deleted successfully`);
        loadData();
      } else {
        error(data.error || 'Failed to delete product');
      }
    } catch {
      error('Failed to delete product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) {
      error('Please fill in product name, price, and description');
      return;
    }
    if (Number(formData.price) <= 0) {
      error('Price must be greater than ৳0');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const parsedImages = formData.imageUrls
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      _id: editingProduct?._id,
      slug: editingProduct?.slug,
      businessKoroId: editingProduct?.businessKoroId || (editingProduct?.source === 'businesskoro' ? editingProduct?._id : undefined),
      name: formData.name.trim(),
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category,
      stock: Number(formData.stock),
      images: parsedImages.length > 0 ? parsedImages : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000'],
      videoUrl: formData.videoUrl.trim(),
      description: formData.description.trim(),
      shortDescription: formData.shortDescription.trim(),
      isHot: formData.isHot,
      isFeatured: formData.isFeatured,
      badge: formData.badge.trim(),
      variants: {
        colors: formData.colors.split(',').map((s) => s.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      },
      features: formData.features.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      let res;
      if (editingProduct) {
        const targetId = editingProduct._id || editingProduct.slug || editingProduct.businessKoroId;
        res = await fetch(`/api/products/${encodeURIComponent(targetId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        success(editingProduct ? 'Product updated successfully! 🎉' : 'New product published successfully! 🎉');
        setIsModalOpen(false);
        loadData();
      } else {
        error(data.error || 'Failed to save product');
      }
    } catch {
      error('Error saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const featuredCount = products.filter((p) => Boolean(p.isFeatured)).length;
  const hotCount = products.filter((p) => Boolean(p.isHot)).length;

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilterMode =
      filterMode === 'all' ||
      (filterMode === 'featured' && Boolean(p.isFeatured)) ||
      (filterMode === 'hot' && Boolean(p.isHot));
    return matchesCat && matchesSearch && matchesFilterMode;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Product Management
          </h1>
          <p className="text-xs text-slate-500">
            Select featured products for homepage, manage prices, stock, and live dropshipping sync.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Product</span>
        </button>
      </div>

      {/* Featured Collection Selection Info Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 flex items-start gap-3 shadow-sm">
        <Star className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-slate-950">
            ⭐ Homepage Featured Collections Selection:
          </p>
          <p className="text-slate-600 leading-relaxed">
            যে যে প্রোডাক্ট আপনি হোমপেজের <strong>"Featured Collections"</strong> সেকশনে দেখাতে চান, নিচের টেবিলে শুধু সেই প্রোডাক্টটির <strong>⭐ Star</strong> বাটনে ক্লিক করে গোল্ডেন অন করুন। বর্তমানে <strong>{featuredCount} টি</strong> প্রোডাক্ট হোমপেজে Featured হিসেবে ডাটাবেজে সংরক্ষিত আছে।
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('featured')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'featured'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Featured on Homepage ({featuredCount})</span>
          </button>
          <button
            onClick={() => setFilterMode('hot')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'hot'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Hot Deals ({hotCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md justify-end">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-950"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Product</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3 text-center">Featured on Homepage</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id || product.slug || product.businessKoroId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 flex items-center gap-3">
                      <img
                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200'}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                      />
                      <div className="max-w-xs">
                        <p className="font-bold text-slate-950 line-clamp-1">{product.name}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{product.shortDescription}</p>
                      </div>
                    </td>
                    <td className="py-3.5 capitalize text-slate-700 font-medium">
                      {product.category?.replace('-', ' ')}
                    </td>
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-950">৳{product.price?.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ৳{product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          product.stock > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        title={product.isFeatured ? "Click to remove from Homepage Featured Collections" : "Click to showcase on Homepage Featured Collections"}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm ${
                          product.isFeatured
                            ? 'bg-amber-100 border border-amber-300 text-amber-900 hover:bg-amber-200 scale-105'
                            : 'bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${product.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        <span>{product.isFeatured ? 'Featured ⭐' : 'Not Featured'}</span>
                      </button>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleToggleHot(product)}
                        title={product.isHot ? "Hot Deal Active" : "Set as Hot Deal"}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          product.isHot
                            ? 'bg-rose-100 border-rose-300 text-rose-700'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id || product.slug, product.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Dialog with Fixed Height and Internal Scroll */}
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-base shadow-xs">
                  {editingProduct ? '✏️' : '✨'}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 font-display leading-snug">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingProduct ? `Updating details for "${editingProduct.name}"` : 'Fill in the information below to add a new product'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden text-xs">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Price (৳) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Original Price (For Discount %)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c._id || c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  {/* Multi-Image Gallery & Visual Photoshoot Selector */}
                  <div className="space-y-3 sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>📸 Product Photo Selection Gallery</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {formData.imageUrls.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length} Selected
                          </span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                          নিচের ছবিগুলোতে ক্লিক করে যে যে ছবি প্রোডাক্ট পেজে দেখাতে চান সেগুলো সিলেক্ট করুন (১ম ছবি কভার হবে)
                        </p>
                      </div>

                      {/* Drive Folder Scanner */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Drive Folder Link..."
                          value={driveScanUrl}
                          onChange={(e) => setDriveScanUrl(e.target.value)}
                          className="text-[11px] bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 w-44 sm:w-52 focus:outline-none focus:border-slate-950 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleScanDrive}
                          disabled={isScanningDrive}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white text-[10px] font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
                        >
                          {isScanningDrive ? 'Scanning...' : 'Scan Drive'}
                        </button>
                      </div>
                    </div>

                    {/* Visual Clickable Photoshoot Grid */}
                    {(() => {
                      const currentSelected = formData.imageUrls
                        .split(/[\n,]+/)
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const availableProductPhotos = Array.from(
                        new Set([...currentSelected, ...scannedDrivePhotos])
                      );

                      if (availableProductPhotos.length === 0) {
                        return (
                          <div className="text-center py-6 px-4 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-500">
                            <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                            <p className="text-xs font-semibold text-slate-700">এই প্রোডাক্টের জন্য কোনো ড্রাইভ ফটো স্ক্যান করা হয়নি</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              উপরে আপনার Google Drive লিঙ্ক দিয়ে <strong>Scan Drive</strong> বাটনে ক্লিক করলে ছবিগুলো এখানে শো করবে।
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                            <span>Available Photos ({availableProductPhotos.length} Photos):</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const all = availableProductPhotos.join('\n');
                                  setFormData((prev) => ({ ...prev, imageUrls: all }));
                                }}
                                className="text-indigo-600 hover:underline cursor-pointer font-bold"
                              >
                                Select All
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, imageUrls: '' }))}
                                className="text-rose-600 hover:underline cursor-pointer font-bold"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-2 bg-white rounded-2xl border border-slate-200 shadow-inner">
                            {availableProductPhotos.map((photoUrl, idx) => {
                              const selectIndex = currentSelected.indexOf(photoUrl);
                              const isSelected = selectIndex !== -1;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => toggleImageSelection(photoUrl)}
                                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-1 group cursor-pointer ${
                                    isSelected
                                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50 scale-95'
                                      : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400 bg-slate-50'
                                  }`}
                                >
                                  <img
                                    src={formatImageUrl(photoUrl)}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                  {isSelected ? (
                                    <span className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center shadow-xs">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="absolute top-1 right-1 bg-slate-900/40 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      +
                                    </span>
                                  )}
                                  {isSelected && (
                                    <span className="absolute bottom-0 inset-x-0 bg-emerald-800/90 text-white text-[8px] font-bold text-center py-0.5 truncate px-0.5">
                                      {selectIndex === 0 ? '★ Cover' : `#${selectIndex + 1}`}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Selected Gallery Order List & Manual Link Input */}
                    <div className="space-y-1.5 pt-1">
                      <label className="font-semibold text-slate-700 text-[11px]">
                        Selected Product Image URLs (সরাসরি বা কাস্টম লিংক এডিট করুন):
                      </label>
                      <textarea
                        rows={2}
                        placeholder="https://... or /uploads/products/..."
                        value={formData.imageUrls}
                        onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-950 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Product Video Showcase URL */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700">
                        Product Video URL (ভিডিও লিংক — YouTube, Shorts, Google Drive Video বা MP4)
                      </label>
                      <span className="text-[10px] text-amber-600 font-semibold">
                        🎬 Customer can watch directly on website
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/file/d/.../preview"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                    <p className="text-[10px] text-slate-400">
                      টিপ: ইউটিউব ভিডিও লিংক, গুগল ড্রাইভ ভিডিও লিংক বা সরাসরি MP4 দিলে প্রোডাক্ট পেজে ভিডিও প্লেয়ার চালু হবে।
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">Short Description</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-semibold text-slate-700">Detailed Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Color Variants (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Black, Silver, Gold"
                      value={formData.colors}
                      onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Hot Deal, Bestseller"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white text-xs font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isHot}
                        onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                        className="accent-slate-950 w-4 h-4"
                      />
                      <span>🔥 Mark as Hot Product</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="accent-slate-950 w-4 h-4"
                      />
                      <span>⭐ Mark as Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  {formData.name ? (
                    <span className="truncate max-w-xs block">
                      Product: <strong className="text-slate-900">{formData.name}</strong> (৳{formData.price || 0})
                    </span>
                  ) : (
                    <span>Fill in product details and click save</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
