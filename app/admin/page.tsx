'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Plus, 
  Layers, 
  Image as ImageIcon,
  Truck,
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders'),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setRecentOrders(ordersData.orders?.slice(0, 6) || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        success(`Order status updated to ${newStatus}`);
        loadDashboard();
      } else {
        error(data.error || 'Failed to update order');
      }
    } catch (err) {
      error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              MongoDB Database Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Admin Overview & Analytics
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>
          <Link
            href="/admin/banners"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs border border-slate-200 transition-colors shadow-sm"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-950" /> Hero Banners
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            ৳{stats?.totalRevenue?.toLocaleString() || 0}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Gross Sales
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-950 border border-slate-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {stats?.totalOrders || 0}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats?.pendingOrders || 0} pending processing
          </span>
        </div>

        {/* Total Products */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-950 border border-slate-200">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {stats?.totalProducts || 0}
          </p>
          <span className="text-[11px] text-slate-500">
            Across {stats?.totalCategories || 6} categories
          </span>
        </div>

        {/* Active Hero Banners */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Hero Posters</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-950 border border-slate-200">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 font-display">
            {stats?.totalBanners || 0}
          </p>
          <span className="text-[11px] text-slate-600 font-semibold">
            Swipeable Carousel active
          </span>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-950 font-display">Recent Customer Orders</h2>
            <p className="text-xs text-slate-500">Manage incoming orders and update delivery fulfillment.</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-slate-900 hover:text-slate-600 flex items-center gap-1"
          >
            View all orders <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Order Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id || order.orderNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-950">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <p className="font-semibold text-slate-900">{order.customer?.fullName}</p>
                      <p className="text-[11px] text-slate-500">{order.customer?.phone}</p>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {order.items?.length || 1} items
                    </td>
                    <td className="py-3.5 font-bold text-slate-950 font-display">
                      ৳{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : order.orderStatus === 'Processing'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {order.orderStatus !== 'Shipped' && order.orderStatus !== 'Delivered' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.orderNumber || order._id, 'Shipped')}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-sm"
                        >
                          Ship
                        </button>
                      )}
                      {order.orderStatus === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.orderNumber || order._id, 'Delivered')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm"
                        >
                          Deliver
                        </button>
                      )}
                      <Link
                        href={`/track-order?id=${order.orderNumber}`}
                        target="_blank"
                        className="p-1 text-slate-400 hover:text-slate-900 inline-block"
                        title="View tracking"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
