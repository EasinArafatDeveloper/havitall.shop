'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X, 
  MapPin, 
  Phone, 
  ExternalLink,
  Printer
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [customNote, setCustomNote] = useState('');
  const { success, error } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, noteText?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          note: noteText || `Status changed to ${newStatus} by store admin`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        success(`Order #${orderId} updated to ${newStatus}`);
        loadOrders();
        if (selectedOrder && (selectedOrder.orderNumber === orderId || selectedOrder._id === orderId)) {
          setSelectedOrder(data.order);
        }
      } else {
        error(data.error || 'Failed to update order');
      }
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !customNote.trim()) return;

    await handleUpdateStatus(selectedOrder.orderNumber || selectedOrder._id, selectedOrder.orderStatus, customNote);
    setCustomNote('');
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.customer?.city?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
            Orders Fulfillment & Management
          </h1>
          <p className="text-xs text-slate-500">
            Track customer orders, print receipts, and manage courier shipment dispatching.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Search by Order ID, name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === status
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer Info</th>
                <th className="pb-3">Items & Qty</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id || order.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-950">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <p className="font-bold text-slate-950">{order.customer?.fullName}</p>
                      <p className="text-[11px] text-slate-500">{order.customer?.phone} • {order.customer?.city}</p>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {order.items?.length || 1} item(s)
                    </td>
                    <td className="py-3.5 font-bold text-slate-950 font-display">
                      ৳{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.orderNumber || order._id, e.target.value)}
                        className={`text-[11px] font-extrabold uppercase rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : order.orderStatus === 'Processing'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/track-order?id=${order.orderNumber}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 inline-block"
                        title="Track Page"
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

      {/* Full Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-500">Order Information</span>
                <h3 className="text-lg font-mono font-black text-slate-950">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Customer</span>
                <p className="font-bold text-slate-950 text-sm">{selectedOrder.customer?.fullName}</p>
                <p className="text-slate-700">{selectedOrder.customer?.phone}</p>
                {selectedOrder.customer?.email && <p className="text-slate-500">{selectedOrder.customer?.email}</p>}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Shipping Address</span>
                <p className="text-slate-800">{selectedOrder.customer?.address}</p>
                <p className="text-slate-600 font-semibold">{selectedOrder.customer?.city}</p>
                {selectedOrder.customer?.note && (
                  <p className="text-amber-800 text-[11px] pt-1 font-medium">Note: {selectedOrder.customer?.note}</p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Ordered Items</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-slate-50 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 object-contain rounded-lg bg-white border border-slate-200 p-0.5" />
                      <div>
                        <p className="font-bold text-slate-950">{item.name}</p>
                        <p className="text-[11px] text-slate-500">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-950">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Math Breakdown */}
            <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <div>
                <span>Payment: <strong className="text-slate-950">{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-950 font-display">Grand Total: ৳{selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Timeline History */}
            <div className="space-y-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Tracking Milestones</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedOrder.timeline?.map((t: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-950">{t.status}:</span>
                    <span className="text-slate-700 flex-1">{t.note}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Custom Note Form */}
            <form onSubmit={handleAddTimelineNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add milestone update note (e.g. Dispatched with RedX Tracking #RX-1029)"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
