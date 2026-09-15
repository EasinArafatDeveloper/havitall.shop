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
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Category Management
          </h1>
          <p className="text-xs text-slate-500">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
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
            className="p-5 rounded-3xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200'}
                alt={cat.name}
                className="w-16 h-16 object-contain rounded-2xl bg-slate-50 border border-slate-200 p-1 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-950">{cat.name}</h3>
                <p className="text-[11px] text-slate-600 font-mono">slug: {cat.slug}</p>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(cat._id || cat.slug, cat.name)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-950 font-display">
                Add New Category
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minimalist Footwear"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Custom Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. minimalist-footwear"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Short description of this collection"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-slate-950 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
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
