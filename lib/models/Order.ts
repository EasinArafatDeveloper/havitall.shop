import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  isOffer?: boolean;
  offerBadge?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    fullName: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: 'COD' | 'BKASH' | 'NAGAD' | 'CARD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  supplierStatus?: 'Pending Approval' | 'Dispatched to Supplier' | 'Failed to Dispatch' | 'Manual Handling';
  supplierResponse?: any;
  approvedAt?: Date;
  approvedBy?: string;
  timeline: {
    status: string;
    time: Date;
    note: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    selectedColor: { type: String },
    selectedSize: { type: String },
    isOffer: { type: Boolean, default: false },
    offerBadge: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      note: { type: String },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponCode: { type: String },
    paymentMethod: {
      type: String,
      enum: ['COD', 'BKASH', 'NAGAD', 'CARD'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    supplierStatus: {
      type: String,
      enum: ['Pending Approval', 'Dispatched to Supplier', 'Failed to Dispatch', 'Manual Handling'],
      default: 'Pending Approval',
    },
    supplierResponse: { type: Schema.Types.Mixed },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    timeline: [
      {
        status: { type: String, required: true },
        time: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default models.Order || model<IOrder>('Order', OrderSchema);
