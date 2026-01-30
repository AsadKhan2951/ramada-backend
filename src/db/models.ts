import mongoose, { Schema, Document } from 'mongoose';

// Staff Member
export interface IStaffMember extends Document {
  name: string;
  email: string;
  password: string;
  jobTitle: string;
  department: 'sales' | 'operations' | 'food' | 'finance';
  accessLevel: 'full' | 'limited';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn?: Date;
}

const staffMemberSchema = new Schema<IStaffMember>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  jobTitle: { type: String, required: true },
  department: { type: String, enum: ['sales', 'operations', 'food', 'finance'], required: true },
  accessLevel: { type: String, enum: ['full', 'limited'], default: 'limited' },
  isActive: { type: Boolean, default: true },
  lastSignedIn: { type: Date },
}, { timestamps: true });

export const StaffMember = mongoose.model<IStaffMember>('StaffMember', staffMemberSchema);

// User (OAuth users)
export interface IUser extends Document {
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role: 'user' | 'admin' | 'sales_executive' | 'manager';
  department?: 'sales' | 'operations' | 'food' | 'finance';
  accessLevel: 'full' | 'limited';
  jobTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const userSchema = new Schema<IUser>({
  openId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  loginMethod: String,
  role: { type: String, enum: ['user', 'admin', 'sales_executive', 'manager'], default: 'user' },
  department: { type: String, enum: ['sales', 'operations', 'food', 'finance'] },
  accessLevel: { type: String, enum: ['full', 'limited'], default: 'limited' },
  jobTitle: String,
  lastSignedIn: { type: Date, default: Date.now },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);

// Banquet Hall
export interface IBanquetHall extends Document {
  name: string;
  capacity: number;
  facilities?: string;
  baseRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const banquetHallSchema = new Schema<IBanquetHall>({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  facilities: String,
  baseRate: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const BanquetHall = mongoose.model<IBanquetHall>('BanquetHall', banquetHallSchema);

// Food Menu
export interface IFoodMenu extends Document {
  name: string;
  description?: string;
  pricePerPerson: number;
  menuItems?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const foodMenuSchema = new Schema<IFoodMenu>({
  name: { type: String, required: true },
  description: String,
  pricePerPerson: { type: Number, required: true },
  menuItems: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const FoodMenu = mongoose.model<IFoodMenu>('FoodMenu', foodMenuSchema);

// Additional Service
export interface IAdditionalService extends Document {
  name: string;
  description?: string;
  price: number;
  category: 'sound' | 'effects' | 'decoration' | 'other';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const additionalServiceSchema = new Schema<IAdditionalService>({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ['sound', 'effects', 'decoration', 'other'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const AdditionalService = mongoose.model<IAdditionalService>('AdditionalService', additionalServiceSchema);

// Booking
export interface IBooking extends Document {
  bookingNumber: string;
  banquetHallId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientCnic?: string;
  clientNtn?: string;
  isTaxFiler: boolean;
  eventDate: Date;
  eventTime?: string;
  eventType?: string;
  numberOfGuests: number;
  expectedGuests?: number;
  roomsRequired: number;
  status: 'tentative_block' | 'soft_reservation' | 'confirmed' | 'completed' | 'cancelled';
  blockType?: 'tentative' | 'definite';
  blockExpiresAt?: Date;
  hallRate: number;
  subtotal: number;
  salesTax: number;
  advanceTax: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  vendorDetails?: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
}

const bookingSchema = new Schema<IBooking>({
  bookingNumber: { type: String, required: true, unique: true },
  banquetHallId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: String,
  clientPhone: { type: String, required: true },
  clientCnic: String,
  clientNtn: String,
  isTaxFiler: { type: Boolean, default: true },
  eventDate: { type: Date, required: true },
  eventTime: String,
  eventType: String,
  numberOfGuests: { type: Number, required: true },
  expectedGuests: Number,
  roomsRequired: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['tentative_block', 'soft_reservation', 'confirmed', 'completed', 'cancelled'], 
    default: 'soft_reservation' 
  },
  blockType: { type: String, enum: ['tentative', 'definite'] },
  blockExpiresAt: Date,
  hallRate: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  salesTax: { type: Number, default: 0 },
  advanceTax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  notes: String,
  vendorDetails: String,
  createdBy: { type: String, required: true },
  assignedTo: String,
  confirmedAt: Date,
}, { timestamps: true });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

// Payment
export interface IPayment extends Document {
  bookingId: string;
  amount: number;
  paymentType: 'token' | 'partial' | 'final' | 'second_payment' | 'final_payment';
  paymentStage?: number;
  paymentMethod?: string;
  paymentDate: Date;
  notes?: string;
  recordedBy: string;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  bookingId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentType: { 
    type: String, 
    enum: ['token', 'partial', 'final', 'second_payment', 'final_payment'], 
    required: true 
  },
  paymentStage: Number,
  paymentMethod: String,
  paymentDate: { type: Date, required: true },
  notes: String,
  recordedBy: { type: String, required: true },
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

// Booking Menu
export interface IBookingMenu extends Document {
  bookingId: string;
  foodMenuId: string;
  numberOfPeople: number;
  totalPrice: number;
  isLocked: boolean;
  createdAt: Date;
}

const bookingMenuSchema = new Schema<IBookingMenu>({
  bookingId: { type: String, required: true },
  foodMenuId: { type: String, required: true },
  numberOfPeople: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

export const BookingMenu = mongoose.model<IBookingMenu>('BookingMenu', bookingMenuSchema);

// Booking Service
export interface IBookingService extends Document {
  bookingId: string;
  serviceId: string;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
}

const bookingServiceSchema = new Schema<IBookingService>({
  bookingId: { type: String, required: true },
  serviceId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
}, { timestamps: true });

export const BookingService = mongoose.model<IBookingService>('BookingService', bookingServiceSchema);

// Booking Comment
export interface IBookingComment extends Document {
  bookingId: string;
  userId: string;
  department: 'sales' | 'operations' | 'food' | 'finance';
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingCommentSchema = new Schema<IBookingComment>({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  department: { type: String, enum: ['sales', 'operations', 'food', 'finance'], required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

export const BookingComment = mongoose.model<IBookingComment>('BookingComment', bookingCommentSchema);

// Booking Activity Log
export interface IBookingActivityLog extends Document {
  bookingId: string;
  userId: string;
  action: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

const bookingActivityLogSchema = new Schema<IBookingActivityLog>({
  bookingId: { type: String, required: true },
  userId: { type: String, required: true },
  action: { type: String, required: true },
  description: { type: String, required: true },
  oldValue: String,
  newValue: String,
}, { timestamps: true });

export const BookingActivityLog = mongoose.model<IBookingActivityLog>('BookingActivityLog', bookingActivityLogSchema);

// Date Note
export interface IDateNote extends Document {
  date: Date;
  note: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const dateNoteSchema = new Schema<IDateNote>({
  date: { type: Date, required: true },
  note: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export const DateNote = mongoose.model<IDateNote>('DateNote', dateNoteSchema);

// Notification
export interface INotification extends Document {
  userId: string;
  type: 'booking_created' | 'booking_confirmed' | 'payment_due' | 'payment_received' | 'comment_added' | 'status_changed';
  title: string;
  message: string;
  bookingId?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['booking_created', 'booking_confirmed', 'payment_due', 'payment_received', 'comment_added', 'status_changed'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  bookingId: String,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);

// Booking Venue (for multi-venue bookings)
export interface IBookingVenue extends Document {
  bookingId: string;
  banquetHallId: string;
  hallRate: number;
  eventTime?: string;
  notes?: string;
  createdAt: Date;
}

const bookingVenueSchema = new Schema<IBookingVenue>({
  bookingId: { type: String, required: true },
  banquetHallId: { type: String, required: true },
  hallRate: { type: Number, required: true },
  eventTime: String,
  notes: String,
}, { timestamps: true });

export const BookingVenue = mongoose.model<IBookingVenue>('BookingVenue', bookingVenueSchema);

// Custom Service
export interface ICustomService extends Document {
  bookingId: string;
  serviceName: string;
  description?: string;
  price: number;
  createdBy: string;
  createdAt: Date;
}

const customServiceSchema = new Schema<ICustomService>({
  bookingId: { type: String, required: true },
  serviceName: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export const CustomService = mongoose.model<ICustomService>('CustomService', customServiceSchema);

// Custom Food Item
export interface ICustomFoodItem extends Document {
  bookingId: string;
  itemName: string;
  description?: string;
  quantity: number;
  pricePerUnit?: number;
  totalPrice?: number;
  createdBy: string;
  createdAt: Date;
}

const customFoodItemSchema = new Schema<ICustomFoodItem>({
  bookingId: { type: String, required: true },
  itemName: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },
  pricePerUnit: Number,
  totalPrice: Number,
  createdBy: { type: String, required: true },
}, { timestamps: true });

export const CustomFoodItem = mongoose.model<ICustomFoodItem>('CustomFoodItem', customFoodItemSchema);

// Booking Custom Menu
export interface IBookingCustomMenu extends Document {
  bookingId: string;
  menuName: string;
  menuItems?: string;
  pricePerPerson: number;
  numberOfPeople: number;
  totalPrice: number;
  createdBy: string;
  createdAt: Date;
}

const bookingCustomMenuSchema = new Schema<IBookingCustomMenu>({
  bookingId: { type: String, required: true },
  menuName: { type: String, required: true },
  menuItems: String,
  pricePerPerson: { type: Number, required: true },
  numberOfPeople: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export const BookingCustomMenu = mongoose.model<IBookingCustomMenu>('BookingCustomMenu', bookingCustomMenuSchema);
