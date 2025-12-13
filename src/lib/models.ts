
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
}

export interface IOrder extends Document {
  seatNumber: string;
  items: {
    product: mongoose.Types.ObjectId;
    name: string; // denormalize for display ease
    quantity: number;
    price: number;
  }[];
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Paid';
  totalAmount: number;
  createdAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String },
});

const OrderSchema: Schema<IOrder> = new Schema({
  seatNumber: { type: String, required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
    },
  ],
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled', 'Paid'], default: 'Pending' },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation errors in development, but allow schema updates
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Product;
  delete mongoose.models.Order;
  delete mongoose.models.Settings;
}

export interface ISettings extends Document {
  auth: {
    chief: string;
    inventory: string;
    billing: string;
    menu: string;
    master: string;
  };
}

const SettingsSchema = new Schema<ISettings>({
  auth: {
    chief: { type: String, default: 'admin123' },
    inventory: { type: String, default: 'admin123' },
    billing: { type: String, default: 'admin123' },
    menu: { type: String, default: 'admin123' },
    master: { type: String, default: 'admin123' },
  }
});

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
