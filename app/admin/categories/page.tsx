'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layers, X, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
    icon: 'Watch',
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Category removed');
        loadCategories();
      } else {
        error(data.error || 'Failed to delete category');
      }
    } catch (err) {
      error('Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      error('Category name is required');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        success('New category added! 🎉');
        setIsModalOpen(false);
        loadCategories();
      } else {
        error(data.error || 'Failed to create category');
      }
    } catch (err) {
      error('Failed to create category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Category Management
          </h1>
          <p className="text-xs text-slate-400">
            Manage store departments and custom icons.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: '',
              slug: '',
              description: '',
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000',
              icon: 'Watch',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-rose-600 to-amber-500 hover:from-brand-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id || cat.slug}
            className="p-5 rounded-3xl bg-dark-100 border border-slate-800 flex items-center justify-between gap-4 shadow-xl hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200'}
                alt={cat.name}
                className="w-16 h-16 object-cover rounded-2xl bg-slate-900 border border-slate-800 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                <p className="text-[11px] text-rose-400 font-mono">slug: {cat.slug}</p>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(cat._id || cat.slug, cat.name)}
              className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-dark-100 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-display">
                Add New Category
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Footwear"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Custom Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. minimalist-footwear"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Description</label>
                <input
                  type="text"
                  placeholder="Short description of this collection"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
