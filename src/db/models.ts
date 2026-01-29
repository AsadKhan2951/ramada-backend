import mongoose, { Schema, Document, Model } from "mongoose";

// ==================== Staff Member ====================
export interface IStaffMember extends Document {
  name: string;
  email: string;
  password: string;
  jobTitle: string;
  department: "sales" | "operations" | "food" | "finance";
  accessLevel: "full" | "limited";
  isActive: boolean;
  lastSignedIn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const staffMemberSchema = new Schema<IStaffMember>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    jobTitle: { type: String, required: true },
    department: { type: String, enum: ["sales", "operations", "food", "finance"], required: true },
    accessLevel: { type: String, enum: ["full", "limited"], default: "limited" },
    isActive: { type: Boolean, default: true },
    lastSignedIn: { type: Date },
  },
  { timestamps: true }
);

export const StaffMember: Model<IStaffMember> = mongoose.models.StaffMember || mongoose.model<IStaffMember>("StaffMember", staffMemberSchema);

// ==================== Banquet Hall ====================
export interface IBanquetHall extends Document {
  name: string;
  capacity: number;
  facilities?: string;
  baseRate?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const banquetHallSchema = new Schema<IBanquetHall>(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    facilities: { type: String },
    baseRate: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BanquetHall: Model<IBanquetHall> = mongoose.models.BanquetHall || mongoose.model<IBanquetHall>("BanquetHall", banquetHallSchema);

// ==================== Food Menu ====================
export interface IFoodMenu extends Document {
  name: string;
  description?: string;
  pricePerPerson: string;
  menuItems?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const foodMenuSchema = new Schema<IFoodMenu>(
  {
    name: { type: String, required: true },
    description: { type: String },
    pricePerPerson: { type: String, required: true },
    menuItems: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FoodMenu: Model<IFoodMenu> = mongoose.models.FoodMenu || mongoose.model<IFoodMenu>("FoodMenu", foodMenuSchema);

// ==================== Additional Service ====================
export interface IAdditionalService extends Document {
  name: string;
  description?: string;
  price: string;
  category: "sound" | "effects" | "decoration" | "other";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const additionalServiceSchema = new Schema<IAdditionalService>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    category: { type: String, enum: ["sound", "effects", "decoration", "other"], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AdditionalService: Model<IAdditionalService> = mongoose.models.AdditionalService || mongoose.model<IAdditionalService>("AdditionalService", additionalServiceSchema);

// ==================== Booking ====================
export interface IBooking extends Document {
  bookingNumber: string;
  banquetHallId: mongoose.Types.ObjectId;
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
  status: "tentative_block" | "soft_reservation" | "confirmed" | "completed" | "cancelled";
  blockType?: "tentative" | "definite";
  blockExpiresAt?: Date;
  hallRate: string;
  subtotal: string;
  salesTax: string;
  advanceTax: string;
  totalAmount: string;
  paidAmount: string;
  notes?: string;
  vendorDetails?: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true },
    banquetHallId: { type: Schema.Types.ObjectId, ref: "BanquetHall", required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    clientPhone: { type: String, required: true },
    clientCnic: { type: String },
    clientNtn: { type: String },
    isTaxFiler: { type: Boolean, default: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: String },
    eventType: { type: String },
    numberOfGuests: { type: Number, required: true },
    expectedGuests: { type: Number },
    roomsRequired: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["tentative_block", "soft_reservation", "confirmed", "completed", "cancelled"],
      default: "soft_reservation",
    },
    blockType: { type: String, enum: ["tentative", "definite"] },
    blockExpiresAt: { type: Date },
    hallRate: { type: String, required: true },
    subtotal: { type: String, required: true },
    salesTax: { type: String, default: "0.00" },
    advanceTax: { type: String, default: "0.00" },
    totalAmount: { type: String, required: true },
    paidAmount: { type: String, default: "0.00" },
    notes: { type: String },
    vendorDetails: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "StaffMember" },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ banquetHallId: 1, eventDate: 1 });

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

// ==================== Payment ====================
export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  amount: string;
  paymentType: "token" | "partial" | "final" | "second_payment" | "final_payment";
  paymentStage?: number;
  paymentMethod?: string;
  paymentDate: Date;
  notes?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: String, required: true },
    paymentType: { type: String, enum: ["token", "partial", "final", "second_payment", "final_payment"], required: true },
    paymentStage: { type: Number },
    paymentMethod: { type: String },
    paymentDate: { type: Date, required: true },
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });

export const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);

// ==================== Booking Menu ====================
export interface IBookingMenu extends Document {
  bookingId: mongoose.Types.ObjectId;
  foodMenuId: mongoose.Types.ObjectId;
  numberOfPeople: number;
  totalPrice: string;
  isLocked: boolean;
  createdAt: Date;
}

const bookingMenuSchema = new Schema<IBookingMenu>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    foodMenuId: { type: Schema.Types.ObjectId, ref: "FoodMenu", required: true },
    numberOfPeople: { type: Number, required: true },
    totalPrice: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const BookingMenu: Model<IBookingMenu> = mongoose.models.BookingMenu || mongoose.model<IBookingMenu>("BookingMenu", bookingMenuSchema);

// ==================== Booking Service ====================
export interface IBookingService extends Document {
  bookingId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  quantity: number;
  totalPrice: string;
  createdAt: Date;
}

const bookingServiceSchema = new Schema<IBookingService>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "AdditionalService", required: true },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: String, required: true },
  },
  { timestamps: true }
);

export const BookingService: Model<IBookingService> = mongoose.models.BookingService || mongoose.model<IBookingService>("BookingService", bookingServiceSchema);

// ==================== Custom Food Item ====================
export interface ICustomFoodItem extends Document {
  bookingId: mongoose.Types.ObjectId;
  itemName: string;
  description?: string;
  quantity: number;
  pricePerUnit?: string;
  totalPrice?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const customFoodItemSchema = new Schema<ICustomFoodItem>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    itemName: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: String },
    totalPrice: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
  },
  { timestamps: true }
);

export const CustomFoodItem: Model<ICustomFoodItem> = mongoose.models.CustomFoodItem || mongoose.model<ICustomFoodItem>("CustomFoodItem", customFoodItemSchema);

// ==================== Custom Service ====================
export interface ICustomService extends Document {
  bookingId: mongoose.Types.ObjectId;
  serviceName: string;
  description?: string;
  price: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const customServiceSchema = new Schema<ICustomService>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    serviceName: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
  },
  { timestamps: true }
);

export const CustomService: Model<ICustomService> = mongoose.models.CustomService || mongoose.model<ICustomService>("CustomService", customServiceSchema);

// ==================== Booking Comment ====================
export interface IBookingComment extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  department: "sales" | "operations" | "food" | "finance";
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingCommentSchema = new Schema<IBookingComment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
    department: { type: String, enum: ["sales", "operations", "food", "finance"], required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export const BookingComment: Model<IBookingComment> = mongoose.models.BookingComment || mongoose.model<IBookingComment>("BookingComment", bookingCommentSchema);

// ==================== Booking Activity Log ====================
export interface IBookingActivityLog extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

const bookingActivityLogSchema = new Schema<IBookingActivityLog>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String },
  },
  { timestamps: true }
);

export const BookingActivityLog: Model<IBookingActivityLog> = mongoose.models.BookingActivityLog || mongoose.model<IBookingActivityLog>("BookingActivityLog", bookingActivityLogSchema);

// ==================== Date Note ====================
export interface IDateNote extends Document {
  date: Date;
  note: string;
  isPrivate: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const dateNoteSchema = new Schema<IDateNote>(
  {
    date: { type: Date, required: true },
    note: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
  },
  { timestamps: true }
);

dateNoteSchema.index({ date: 1 });
dateNoteSchema.index({ createdBy: 1 });

export const DateNote: Model<IDateNote> = mongoose.models.DateNote || mongoose.model<IDateNote>("DateNote", dateNoteSchema);

// ==================== Notification ====================
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "booking_created" | "booking_confirmed" | "payment_due" | "payment_received" | "comment_added" | "status_changed";
  title: string;
  message: string;
  bookingId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
    type: {
      type: String,
      enum: ["booking_created", "booking_confirmed", "payment_due", "payment_received", "comment_added", "status_changed"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ bookingId: 1 });
notificationSchema.index({ isRead: 1 });

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

// ==================== Booking Venue (for multi-venue bookings) ====================
export interface IBookingVenue extends Document {
  bookingId: mongoose.Types.ObjectId;
  banquetHallId: mongoose.Types.ObjectId;
  hallRate: string;
  eventTime?: string;
  notes?: string;
  createdAt: Date;
}

const bookingVenueSchema = new Schema<IBookingVenue>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    banquetHallId: { type: Schema.Types.ObjectId, ref: "BanquetHall", required: true },
    hallRate: { type: String, required: true },
    eventTime: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const BookingVenue: Model<IBookingVenue> = mongoose.models.BookingVenue || mongoose.model<IBookingVenue>("BookingVenue", bookingVenueSchema);

// ==================== Booking Custom Menu ====================
export interface IBookingCustomMenu extends Document {
  bookingId: mongoose.Types.ObjectId;
  menuName: string;
  menuItems?: string;
  pricePerPerson: string;
  numberOfPeople: number;
  totalPrice: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookingCustomMenuSchema = new Schema<IBookingCustomMenu>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    menuName: { type: String, required: true },
    menuItems: { type: String },
    pricePerPerson: { type: String, required: true },
    numberOfPeople: { type: Number, required: true },
    totalPrice: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
  },
  { timestamps: true }
);

export const BookingCustomMenu: Model<IBookingCustomMenu> = mongoose.models.BookingCustomMenu || mongoose.model<IBookingCustomMenu>("BookingCustomMenu", bookingCustomMenuSchema);

// ==================== Payment Reminder ====================
export interface IPaymentReminder extends Document {
  bookingId: mongoose.Types.ObjectId;
  reminderType: "thirty_day" | "seven_day" | "overdue";
  dueDate: Date;
  dueAmount: string;
  isSent: boolean;
  sentAt?: Date;
  createdAt: Date;
}

const paymentReminderSchema = new Schema<IPaymentReminder>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    reminderType: { type: String, enum: ["thirty_day", "seven_day", "overdue"], required: true },
    dueDate: { type: Date, required: true },
    dueAmount: { type: String, required: true },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const PaymentReminder: Model<IPaymentReminder> = mongoose.models.PaymentReminder || mongoose.model<IPaymentReminder>("PaymentReminder", paymentReminderSchema);
