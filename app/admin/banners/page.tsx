'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  ExternalLink,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

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
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
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
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Hero poster deleted successfully');
        loadBanners();
      } else {
        error(data.error || 'Failed to delete banner');
      }
    } catch (err) {
      error('Failed to delete banner');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image.trim()) {
      error('Please provide a valid Poster Image URL');
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
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Hero Slider Posters
          </h1>
          <p className="text-xs text-slate-400">
            Posters uploaded here will be displayed as full pure banners in the homepage interactive slider (No overlaid text).
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              title: `Poster #${banners.length + 1}`,
              image: '',
              buttonLink: '/shop',
              order: String(banners.length + 1),
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-rose-600 to-amber-500 hover:from-brand-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Poster</span>
        </button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, index) => (
          <div
            key={banner._id || index}
            className="rounded-3xl bg-dark-100 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-rose-500/40 transition-all duration-300"
          >
            {/* Pure Poster Image Preview */}
            <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-slate-900 overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title || 'Poster preview'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-100/90 via-transparent to-black/30 pointer-events-none" />
              
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-700/60 text-[10px] font-black uppercase tracking-wider">
                  Slide #{banner.order || index + 1}
                </span>
              </div>

              <button
                onClick={() => handleDelete(banner._id, banner.title)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-colors shadow-lg"
                title="Delete poster"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Poster Info & Link */}
            <div className="p-5 flex items-center justify-between text-xs border-t border-slate-800/80 bg-slate-900/30">
              <div className="min-w-0 pr-3">
                <h3 className="font-bold text-white font-display truncate">
                  {banner.title || `Hero Poster #${index + 1}`}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <span>Redirect:</span>
                  <span className="text-rose-400 font-medium truncate">{banner.buttonLink || '/shop'}</span>
                </p>
              </div>

              <a
                href={banner.image}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-dark-100 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  Add New Hero Poster
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Poster Image URL (High-Res 16:9 or 21:9) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... or your image link"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                <p className="text-[10px] text-slate-500">
                  Tip: Use Canva, Photoshop, or high-res banner URL with offer/text already included on the image.
                </p>
              </div>

              {/* Image Preview if provided */}
              {formData.image.trim() && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-400">Live Poster Preview</label>
                  <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-900">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Target Click Link (Where user goes when clicking poster)</label>
                <input
                  type="text"
                  placeholder="/shop or /shop?category=luxury-watches"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Poster Name / Label (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Eid Mega Sale Banner"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Slide Order Position</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 flex items-center gap-1.5"
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
