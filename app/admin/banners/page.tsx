'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  ExternalLink,
  ArrowRight,
  Eye,
  UploadCloud,
  Link as LinkIcon,
  CheckCircle2,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileDetails, setFileDetails] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error, info } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    image: '',
    buttonLink: '/shop',
    order: '1',
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (data.success) {
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
          try {
            localStorage.setItem('havitall_hero_banners', JSON.stringify(data.banners));
          } catch (e) {}
        } else {
          // Check if local cache has stored posters (e.g. after serverless cold start)
          try {
            const cachedStr = localStorage.getItem('havitall_hero_banners');
            if (cachedStr) {
              const cached = JSON.parse(cachedStr);
              if (Array.isArray(cached) && cached.length > 0) {
                setBanners(cached);
                // Re-sync cached banners to server
                for (const b of cached) {
                  fetch('/api/banners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(b),
                  }).catch(() => {});
                }
              } else {
                setBanners([]);
              }
            } else {
              setBanners([]);
            }
          } catch (e) {
            setBanners([]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      try {
        const cachedStr = localStorage.getItem('havitall_hero_banners');
        if (cachedStr) {
          setBanners(JSON.parse(cachedStr));
        }
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete this poster?`)) return;
    try {
      const updated = banners.filter((b) => b._id !== id && b.title !== title);
      setBanners(updated);
      try {
        localStorage.setItem('havitall_hero_banners', JSON.stringify(updated));
      } catch (e) {}
      
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Hero poster deleted successfully');
      } else {
        error(data.error || 'Failed to delete banner');
      }
    } catch (err) {
      error('Failed to delete banner');
    }
  };

  // Process & compress file to optimized Base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      error('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    setUploadingFile(true);
    setFileDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Use canvas to optimize if larger than 1920px width
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDim = 1920;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.88);
          setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
        } else {
          setFormData((prev) => ({ ...prev, image: e.target?.result as string }));
        }
        setUploadingFile(false);
        success('Poster image uploaded & prepared!');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      error('Failed to read file.');
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      error('Please upload an image file or provide a valid Image URL');
      return;
    }

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim() || `Hero Poster #${banners.length + 1}`,
          image: formData.image.trim(),
          buttonLink: formData.buttonLink.trim() || '/shop',
          order: Number(formData.order) || (banners.length + 1),
          isActive: true
        }),
      });

      const data = await res.json();
      if (data.success) {
        success('New hero poster added to storefront slider! 🎉');
        setIsModalOpen(false);
        setFileDetails(null);
        if (data.banner) {
          const updatedList = [data.banner, ...banners.filter((b) => b._id !== data.banner._id)];
          setBanners(updatedList);
          try {
            localStorage.setItem('havitall_hero_banners', JSON.stringify(updatedList));
          } catch (e) {}
        }
        loadBanners();
      } else {
        error(data.error || 'Failed to create banner');
      }
    } catch (err) {
      error('Failed to create banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Hero Slider Posters
          </h1>
          <p className="text-xs text-slate-500">
            Directly upload poster images from your computer to display in the homepage interactive hero slider.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadBanners}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            title="Refresh banners"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFormData({
                title: `Poster #${banners.length + 1}`,
                image: '',
                buttonLink: '/shop',
                order: String(banners.length + 1),
              });
              setFileDetails(null);
              setUploadMode('file');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Poster</span>
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner._id || index}
            className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all duration-300"
          >
            {/* Pure Poster Image Preview */}
            <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-slate-100 overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title || 'Poster preview'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-slate-800 text-[10px] font-black uppercase tracking-wider">
                  Slide #{banner.order || index + 1}
                </span>
              </div>

              <button
                onClick={() => handleDelete(banner._id, banner.title)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-sm cursor-pointer"
                title="Delete poster"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Poster Info & Link */}
            <div className="p-5 flex items-center justify-between text-xs border-t border-slate-100 bg-slate-50/60">
              <div className="min-w-0 pr-3">
                <h3 className="font-bold text-slate-950 font-display truncate">
                  {banner.title || `Hero Poster #${index + 1}`}
                </h3>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <span>Redirect:</span>
                  <span className="text-slate-800 font-medium truncate">{banner.buttonLink || '/shop'}</span>
                </p>
              </div>

              <a
                href={banner.image}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                title="View full poster image"
              >
                <Eye className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Poster Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-950 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 font-display">
                  Add New Hero Poster
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Method Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadMode === 'file'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  uploadMode === 'url'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Paste Image Link</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Option A: Direct File Upload Zone */}
              {uploadMode === 'file' ? (
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 block">
                    Choose Poster Image (Recommended: 1920 × 720 px) <span className="text-rose-600">*</span>
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    className="hidden"
                  />

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragging
                        ? 'border-slate-950 bg-slate-100 scale-[1.01]'
                        : formData.image
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-300 hover:border-slate-950 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    {uploadingFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-semibold text-slate-600">Optimizing poster image...</span>
                      </div>
                    ) : formData.image ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900 text-xs">
                            {fileDetails?.name || 'Image ready for slider'}
                          </p>
                          <p className="text-[10px] text-emerald-700">
                            {fileDetails?.size ? `Size: ${fileDetails.size} • ` : ''}Click to change or replace file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            Click to upload or drag & drop poster
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Supports JPG, PNG, WebP (Widescreen 16:9 / 21:8)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Option B: Image URL Input */
                <div className="space-y-1">
                  <label className="font-bold text-slate-900">Poster Image URL (High-Res 16:9 or 21:9) *</label>
                  <input
                    type="text"
                    required={uploadMode === 'url'}
                    placeholder="https://images.unsplash.com/... or your image link"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-400">
                    Tip: Direct URL of the poster graphic designed with Canva/Photoshop.
                  </p>
                </div>
              )}

              {/* Live Image Preview */}
              {formData.image.trim() && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700">Live Poster Preview</label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, image: '' }));
                        setFileDetails(null);
                      }}
                      className="text-[10px] text-rose-600 hover:underline font-semibold"
                    >
                      Remove Image
                    </button>
                  </div>
                  <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Click Link (Where user goes when clicking poster)</label>
                <input
                  type="text"
                  placeholder="/shop or /shop?category=luxury-watches"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Poster Name / Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Eid Mega Sale Banner"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Slide Order Position</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile || !formData.image}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <span>Publish Poster</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
