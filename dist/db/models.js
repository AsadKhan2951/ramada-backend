import mongoose, { Schema } from "mongoose";
const staffMemberSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    jobTitle: { type: String, required: true },
    department: { type: String, enum: ["sales", "operations", "food", "finance"], required: true },
    accessLevel: { type: String, enum: ["full", "limited"], default: "limited" },
    isActive: { type: Boolean, default: true },
    lastSignedIn: { type: Date },
}, { timestamps: true });
export const StaffMember = mongoose.models.StaffMember || mongoose.model("StaffMember", staffMemberSchema);
const banquetHallSchema = new Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    facilities: { type: String },
    baseRate: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const BanquetHall = mongoose.models.BanquetHall || mongoose.model("BanquetHall", banquetHallSchema);
const foodMenuSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    pricePerPerson: { type: String, required: true },
    menuItems: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const FoodMenu = mongoose.models.FoodMenu || mongoose.model("FoodMenu", foodMenuSchema);
const additionalServiceSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    category: { type: String, enum: ["sound", "effects", "decoration", "other"], required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export const AdditionalService = mongoose.models.AdditionalService || mongoose.model("AdditionalService", additionalServiceSchema);
const bookingSchema = new Schema({
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
}, { timestamps: true });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ banquetHallId: 1, eventDate: 1 });
export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
const paymentSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    amount: { type: String, required: true },
    paymentType: { type: String, enum: ["token", "partial", "final", "second_payment", "final_payment"], required: true },
    paymentStage: { type: Number },
    paymentMethod: { type: String },
    paymentDate: { type: Date, required: true },
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
}, { timestamps: true });
paymentSchema.index({ bookingId: 1 });
export const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
const bookingMenuSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    foodMenuId: { type: Schema.Types.ObjectId, ref: "FoodMenu", required: true },
    numberOfPeople: { type: Number, required: true },
    totalPrice: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
}, { timestamps: true });
export const BookingMenu = mongoose.models.BookingMenu || mongoose.model("BookingMenu", bookingMenuSchema);
const bookingServiceSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "AdditionalService", required: true },
    quantity: { type: Number, default: 1 },
    totalPrice: { type: String, required: true },
}, { timestamps: true });
export const BookingService = mongoose.models.BookingService || mongoose.model("BookingService", bookingServiceSchema);
const customFoodItemSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    itemName: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: String },
    totalPrice: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
}, { timestamps: true });
export const CustomFoodItem = mongoose.models.CustomFoodItem || mongoose.model("CustomFoodItem", customFoodItemSchema);
const customServiceSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    serviceName: { type: String, required: true },
    description: { type: String },
    price: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
}, { timestamps: true });
export const CustomService = mongoose.models.CustomService || mongoose.model("CustomService", customServiceSchema);
const bookingCommentSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
    department: { type: String, enum: ["sales", "operations", "food", "finance"], required: true },
    comment: { type: String, required: true },
}, { timestamps: true });
export const BookingComment = mongoose.models.BookingComment || mongoose.model("BookingComment", bookingCommentSchema);
const bookingActivityLogSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    oldValue: { type: String },
    newValue: { type: String },
}, { timestamps: true });
export const BookingActivityLog = mongoose.models.BookingActivityLog || mongoose.model("BookingActivityLog", bookingActivityLogSchema);
const dateNoteSchema = new Schema({
    date: { type: Date, required: true },
    note: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
}, { timestamps: true });
dateNoteSchema.index({ date: 1 });
dateNoteSchema.index({ createdBy: 1 });
export const DateNote = mongoose.models.DateNote || mongoose.model("DateNote", dateNoteSchema);
const notificationSchema = new Schema({
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
}, { timestamps: true });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ bookingId: 1 });
notificationSchema.index({ isRead: 1 });
export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
const bookingVenueSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    banquetHallId: { type: Schema.Types.ObjectId, ref: "BanquetHall", required: true },
    hallRate: { type: String, required: true },
    eventTime: { type: String },
    notes: { type: String },
}, { timestamps: true });
export const BookingVenue = mongoose.models.BookingVenue || mongoose.model("BookingVenue", bookingVenueSchema);
const bookingCustomMenuSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    menuName: { type: String, required: true },
    menuItems: { type: String },
    pricePerPerson: { type: String, required: true },
    numberOfPeople: { type: Number, required: true },
    totalPrice: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "StaffMember", required: true },
}, { timestamps: true });
export const BookingCustomMenu = mongoose.models.BookingCustomMenu || mongoose.model("BookingCustomMenu", bookingCustomMenuSchema);
const paymentReminderSchema = new Schema({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    reminderType: { type: String, enum: ["thirty_day", "seven_day", "overdue"], required: true },
    dueDate: { type: Date, required: true },
    dueAmount: { type: String, required: true },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date },
}, { timestamps: true });
export const PaymentReminder = mongoose.models.PaymentReminder || mongoose.model("PaymentReminder", paymentReminderSchema);
