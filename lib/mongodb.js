import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rms_project2';

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  console.log('connectDB called, current state:', cached.conn ? 'connected' : 'connecting...');
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  console.log("MongoDB Connected. DB Name:", mongoose.connection.name);

  return cached.conn;
}

// ==================== SCHEMAS ====================

const toJSONOpts = {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'waiter', enum: ['admin', 'waiter', 'kitchen', 'manager'] },
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  sort_order: { type: Number, default: 0 },
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  image_url: String,
  available: { type: Boolean, default: true },
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  low_stock_threshold: { type: Number, default: 10 },
  cost_per_unit: { type: Number, default: 0 },
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const tableSchema = new mongoose.Schema({
  table_number: { type: Number, required: true, unique: true },
  seats: { type: Number, default: 4 },
  status: { type: String, default: 'available', enum: ['available', 'occupied'] },
  qr_code: String,
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const orderItemSchema = new mongoose.Schema({
  menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  notes: String,
}, { toJSON: toJSONOpts, toObject: toJSONOpts });

const orderSchema = new mongoose.Schema({
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  customer_name: String,
  status: { type: String, default: 'pending', enum: ['pending_approval', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] },
  total: { type: Number, default: 0 },
  notes: String,
  order_type: { type: String, default: 'dine-in' },
  items: [orderItemSchema],
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const settingsSchema = new mongoose.Schema({
  upi_id: String,
  payee_name: String,
  gst_percentage: { type: Number, default: 0 },
  restaurant_logo: String,
  footer_message: String,
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

const invoiceItemSchema = new mongoose.Schema({
  menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  quantity: Number,
  price: Number,
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  tableNo: String,
  customer_name: String,
  customer_phone: String,
  items: [invoiceItemSchema],
  subtotal: Number,
  tax: Number,
  service_charge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: Number,
  invoiceNumber: { type: String, unique: true },
  paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid'] },
  paymentMethod: { type: String, enum: ['UPI', 'cash', 'card', ''] },
}, { timestamps: true, toJSON: toJSONOpts, toObject: toJSONOpts });

// ==================== MODELS ====================

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export const Table = mongoose.models.Table || mongoose.model('Table', tableSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

export default connectDB;
