
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  ownerEmail: string;
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
  foodNote?: string;
  taxAmount?: number;
  ownerEmail: string;
  createdAt: Date;
}

export interface IUser extends Document {
  email: string;
  companyName: string;
  password?: string;
  hasSetPassword?: boolean;
  createdAt: Date;
}

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  companyName: { type: String },
  password: { type: String },
  hasSetPassword: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const OtpSchema: Schema<IOtp> = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const ProductSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  image: { type: String },
  ownerEmail: { type: String, required: true },
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
  foodNote: { type: String },
  taxAmount: { type: Number, default: 0 },
  ownerEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation errors in development, but allow schema updates
if (process.env.NODE_ENV !== 'production') {
  delete mongoose.models.Product;
  delete mongoose.models.Order;
  delete mongoose.models.Settings;
  delete mongoose.models.User;
  delete mongoose.models.Otp;
}

export interface ISettings extends Document {
  auth: {
    chief: string;
    inventory: string;
    billing: string;
    menu: string;
    master: string;
  };
  ownerEmail: string;
}

const SettingsSchema = new Schema<ISettings>({
  auth: {
    chief: { type: String, default: 'admin123' },
    inventory: { type: String, default: 'admin123' },
    billing: { type: String, default: 'admin123' },
    menu: { type: String, default: 'admin123' },
    master: { type: String, default: 'admin123' },
  },
  ownerEmail: { type: String, required: true }
});

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);
