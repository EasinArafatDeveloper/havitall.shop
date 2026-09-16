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
  Printer,
  Flame,
  Trash2,
  Send,
  AlertCircle,
  RefreshCw,
  Check
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [approvingIds, setApprovingIds] = useState<Record<string, boolean>>({});
  const { success, error, info } = useToast();

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

  const handleApproveAndForward = async (orderId: string, orderNum: string) => {
    if (!confirm(`আপনি কি অর্ডার #${orderNum} অনুমোদন করে Business Koro সাপ্লায়ারে পাঠাতে চান?`)) {
      return;
    }

    try {
      setApprovingIds((prev) => ({ ...prev, [orderId]: true }));
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve_and_forward',
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.supplierDispatched) {
          success(`অর্ডার #${orderNum} সফলভাবে অনুমোদন করা হয়েছে এবং Business Koro সাপ্লায়ারে পাঠানো হয়েছে! 🎉`);
        } else {
          info(`অর্ডার #${orderNum} আপডেট হয়েছে: ${data.message || 'সাপ্লায়ার স্ট্যাটাস চেক করুন'}`);
        }
        loadOrders();
        if (selectedOrder && (selectedOrder.orderNumber === orderId || selectedOrder._id === orderId)) {
          setSelectedOrder(data.order);
        }
      } else {
        error(data.error || 'অর্ডার অনুমোদন করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      error('এরর: ' + err.message);
    } finally {
      setApprovingIds((prev) => ({ ...prev, [orderId]: false }));
    }
  };

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

  const handleDeleteOrder = async (orderId: string, orderNum: string) => {
    if (!confirm(`Are you sure you want to delete order #${orderNum}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success(`Order #${orderNum} deleted successfully`);
        if (selectedOrder && (selectedOrder.orderNumber === orderId || selectedOrder._id === orderId)) {
          setSelectedOrder(null);
        }
        loadOrders();
      } else {
        error(data.error || 'Failed to delete order');
      }
    } catch (err) {
      error('Failed to delete order');
    }
  };

  const pendingApprovalCount = orders.filter(
    (o) => !o.supplierStatus || o.supplierStatus === 'Pending Approval'
  ).length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
    const currentSupplierStatus = o.supplierStatus || 'Pending Approval';
    const matchesSupplier = supplierFilter === 'all' || currentSupplierStatus.toLowerCase() === supplierFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.fullName?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.customer?.city?.toLowerCase().includes(q);
    return matchesStatus && matchesSupplier && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold shadow-sm">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-950">
                Orders & Supplier Fulfillment
              </h1>
              <p className="text-xs text-slate-500">
                গ্রাহকদের নতুন অর্ডার রিভিউ করুন, অনুমোদন দিয়ে সরাসরি Business Koro সাপ্লায়ারে পাঠান।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingApprovalCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{pendingApprovalCount}টি অর্ডার অনুমোদনের অপেক্ষায়</span>
            </div>
          )}

          <button
            onClick={loadOrders}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Search by Order ID, name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-950 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Supplier Approval Filter Pill */}
          <button
            onClick={() => {
              setSupplierFilter(supplierFilter === 'Pending Approval' ? 'all' : 'Pending Approval');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              supplierFilter === 'Pending Approval'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⏳ Awaiting Approval ({pendingApprovalCount})</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {['all', 'Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setSupplierFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === status && supplierFilter === 'all'
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
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3.5">Order Number</th>
                <th className="pb-3.5">Customer Info</th>
                <th className="pb-3.5">Items & Qty</th>
                <th className="pb-3.5">Total Amount</th>
                <th className="pb-3.5">Payment</th>
                <th className="pb-3.5">Supplier Dispatch</th>
                <th className="pb-3.5">Order Status</th>
                <th className="pb-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const hasOfferItem = order.items?.some((it: any) => it.isOffer);
                  const orderKey = order.orderNumber || order._id;
                  const isApproving = Boolean(approvingIds[orderKey]);
                  const isPendingApproval = !order.supplierStatus || order.supplierStatus === 'Pending Approval';
                  const isDispatched = order.supplierStatus === 'Dispatched to Supplier';

                  return (
                    <tr key={order._id || order.orderNumber} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Number */}
                      <td className="py-4 font-mono font-bold text-slate-950">
                        <div className="flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                          {hasOfferItem && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black" title="Contains Flash Offer Product">
                              <Flame className="w-2.5 h-2.5 text-amber-600" />
                              <span>OFFER</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-sans font-normal mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4">
                        <p className="font-bold text-slate-950">{order.customer?.fullName}</p>
                        <p className="text-[11px] text-slate-500">{order.customer?.phone} • {order.customer?.city}</p>
                      </td>

                      {/* Items */}
                      <td className="py-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{order.items?.length || 1} item(s)</span>
                      </td>

                      {/* Total */}
                      <td className="py-4 font-bold text-slate-950 font-display">
                        ৳{order.totalAmount?.toLocaleString()}
                      </td>

                      {/* Payment */}
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Supplier Status & Direct Approval Button */}
                      <td className="py-4">
                        {isDispatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Sent to Supplier</span>
                          </span>
                        ) : order.supplierStatus === 'Failed to Dispatch' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              <span>Dispatch Failed</span>
                            </span>
                            <button
                              onClick={() => handleApproveAndForward(orderKey, order.orderNumber)}
                              disabled={isApproving}
                              className="text-[10px] font-bold text-slate-900 underline block cursor-pointer"
                            >
                              Retry Send
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApproveAndForward(orderKey, order.orderNumber)}
                            disabled={isApproving}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-[11px] shadow-sm transform active:scale-95 transition-all cursor-pointer"
                            title="Approve order and send to Business Koro supplier"
                          >
                            <Send className={`w-3 h-3 ${isApproving ? 'animate-spin' : ''}`} />
                            <span>{isApproving ? 'Sending...' : 'Approve & Send'}</span>
                          </button>
                        )}
                      </td>

                      {/* Order Status Select */}
                      <td className="py-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(orderKey, e.target.value)}
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

                      {/* Action Buttons */}
                      <td className="py-4 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
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
                        <button
                          onClick={() => handleDeleteOrder(orderKey, order.orderNumber)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
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
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Supplier Approval Banner in Modal */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              selectedOrder.supplierStatus === 'Dispatched to Supplier'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-slate-800" />
                <div>
                  <h4 className="text-xs font-bold">
                    সাপ্লায়ার স্ট্যাটাস: {selectedOrder.supplierStatus || 'Pending Approval'}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {selectedOrder.supplierStatus === 'Dispatched to Supplier'
                      ? 'অর্ডারটি Business Koro সাপ্লায়ার সিস্টেমে পাঠানো হয়েছে।'
                      : 'অর্ডারটি এখনও সাপ্লায়ারে পাঠানো হয়নি। আপনি রিভিউ করে অনুমোদন দিন।'}
                  </p>
                </div>
              </div>

              {selectedOrder.supplierStatus !== 'Dispatched to Supplier' && (
                <button
                  onClick={() => handleApproveAndForward(selectedOrder.orderNumber || selectedOrder._id, selectedOrder.orderNumber)}
                  disabled={Boolean(approvingIds[selectedOrder.orderNumber || selectedOrder._id])}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {approvingIds[selectedOrder.orderNumber || selectedOrder._id]
                      ? 'Sending...'
                      : 'Approve & Send to Supplier'}
                  </span>
                </button>
              )}
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                        {item.isOffer && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 mb-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black">
                            <Flame className="w-2.5 h-2.5 text-amber-600" />
                            <span>{item.offerBadge || '🔥 Flash Deal'}</span>
                          </span>
                        )}
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
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
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
