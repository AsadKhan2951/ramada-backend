import mongoose from 'mongoose';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from './trpc';
import { StaffMember, BanquetHall, FoodMenu, AdditionalService, Booking, Payment, BookingMenu, BookingService, BookingComment, BookingActivityLog, DateNote, Notification, BookingVenue, CustomService, CustomFoodItem, BookingCustomMenu } from '../db/models';
import { generateToken, comparePassword, hashPassword } from '../auth/jwt';

function generateBookingNumber(): string {
  const prefix = 'BK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export const appRouter = router({
  // Auth routes
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie('token');
      return { success: true };
    }),
  }),

  // Staff authentication
  staff: router({
    list: publicProcedure.query(async () => {
      const staff = await StaffMember.find({ isActive: true }).select('name email jobTitle department');
      return staff.map(s => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        jobTitle: s.jobTitle,
        department: s.department,
      }));
    }),

    login: publicProcedure
      .input(z.object({
        staffId: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!mongoose.Types.ObjectId.isValid(input.staffId)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid staff ID' });
        }

        const staff = await StaffMember.findOne({ _id: input.staffId, isActive: true });
        if (!staff) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Staff member not found' });
        }

        const isValid = await comparePassword(input.password, staff.password);
        if (!isValid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid password' });
        }

        // Update last signed in
        staff.lastSignedIn = new Date();
        await staff.save();

        const token = generateToken({
          id: staff._id.toString(),
          email: staff.email,
          name: staff.name,
          department: staff.department,
          accessLevel: staff.accessLevel,
          jobTitle: staff.jobTitle,
        });

        ctx.res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return {
          success: true,
          token,
          staff: {
            id: staff._id.toString(),
            name: staff.name,
            email: staff.email,
            department: staff.department,
            accessLevel: staff.accessLevel,
            jobTitle: staff.jobTitle,
          },
        };
      }),
  }),

  // Banquet Halls
  banquetHalls: router({
    list: protectedProcedure.query(async () => {
      const halls = await BanquetHall.find({ isActive: true });
      return halls.map(h => ({
        id: h._id.toString(),
        name: h.name,
        capacity: h.capacity,
        facilities: h.facilities,
        baseRate: h.baseRate?.toString(),
        isActive: h.isActive,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const hall = await BanquetHall.findById(input.id);
        if (!hall) return null;
        return {
          id: hall._id.toString(),
          name: hall.name,
          capacity: hall.capacity,
          facilities: hall.facilities,
          baseRate: hall.baseRate?.toString(),
          isActive: hall.isActive,
          createdAt: hall.createdAt,
          updatedAt: hall.updatedAt,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        capacity: z.number(),
        facilities: z.string().optional(),
        baseRate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const hall = await BanquetHall.create({
          ...input,
          baseRate: input.baseRate ? parseFloat(input.baseRate) : undefined,
        });
        return { id: hall._id.toString() };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        capacity: z.number().optional(),
        facilities: z.string().optional(),
        baseRate: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await BanquetHall.findByIdAndUpdate(id, {
          ...data,
          baseRate: data.baseRate ? parseFloat(data.baseRate) : undefined,
        });
        return { success: true };
      }),
  }),

  // Food Menus
  foodMenus: router({
    list: protectedProcedure.query(async () => {
      const menus = await FoodMenu.find({ isActive: true });
      return menus.map(m => ({
        id: m._id.toString(),
        name: m.name,
        description: m.description,
        pricePerPerson: m.pricePerPerson.toString(),
        menuItems: m.menuItems,
        isActive: m.isActive,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const menu = await FoodMenu.findById(input.id);
        if (!menu) return null;
        return {
          id: menu._id.toString(),
          name: menu.name,
          description: menu.description,
          pricePerPerson: menu.pricePerPerson.toString(),
          menuItems: menu.menuItems,
          isActive: menu.isActive,
          createdAt: menu.createdAt,
          updatedAt: menu.updatedAt,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        pricePerPerson: z.string(),
        menuItems: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const menu = await FoodMenu.create({
          ...input,
          pricePerPerson: parseFloat(input.pricePerPerson),
        });
        return { id: menu._id.toString() };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        pricePerPerson: z.string().optional(),
        menuItems: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await FoodMenu.findByIdAndUpdate(id, {
          ...data,
          pricePerPerson: data.pricePerPerson ? parseFloat(data.pricePerPerson) : undefined,
        });
        return { success: true };
      }),
  }),

  // Additional Services
  additionalServices: router({
    list: protectedProcedure.query(async () => {
      const services = await AdditionalService.find({ isActive: true });
      return services.map(s => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        price: s.price.toString(),
        category: s.category,
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const service = await AdditionalService.findById(input.id);
        if (!service) return null;
        return {
          id: service._id.toString(),
          name: service.name,
          description: service.description,
          price: service.price.toString(),
          category: service.category,
          isActive: service.isActive,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        category: z.enum(['sound', 'effects', 'decoration', 'other']),
      }))
      .mutation(async ({ input }) => {
        const service = await AdditionalService.create({
          ...input,
          price: parseFloat(input.price),
        });
        return { id: service._id.toString() };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.enum(['sound', 'effects', 'decoration', 'other']).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await AdditionalService.findByIdAndUpdate(id, {
          ...data,
          price: data.price ? parseFloat(data.price) : undefined,
        });
        return { success: true };
      }),
  }),

  // Bookings
  bookings: router({
    list: protectedProcedure.query(async () => {
      const bookings = await Booking.find().sort({ eventDate: -1 });
      const halls = await BanquetHall.find();
      const hallMap = new Map(halls.map(h => [h._id.toString(), h]));

      return bookings.map(b => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        banquetHallId: b.banquetHallId,
        hall: hallMap.get(b.banquetHallId) ? {
          id: hallMap.get(b.banquetHallId)!._id.toString(),
          name: hallMap.get(b.banquetHallId)!.name,
        } : null,
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        clientPhone: b.clientPhone,
        clientCnic: b.clientCnic,
        clientNtn: b.clientNtn,
        isTaxFiler: b.isTaxFiler,
        eventDate: b.eventDate,
        eventTime: b.eventTime,
        eventType: b.eventType,
        numberOfGuests: b.numberOfGuests,
        expectedGuests: b.expectedGuests,
        roomsRequired: b.roomsRequired,
        status: b.status,
        blockType: b.blockType,
        blockExpiresAt: b.blockExpiresAt,
        hallRate: b.hallRate.toString(),
        subtotal: b.subtotal.toString(),
        salesTax: b.salesTax.toString(),
        advanceTax: b.advanceTax.toString(),
        totalAmount: b.totalAmount.toString(),
        paidAmount: b.paidAmount.toString(),
        notes: b.notes,
        vendorDetails: b.vendorDetails,
        createdBy: b.createdBy,
        assignedTo: b.assignedTo,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        confirmedAt: b.confirmedAt,
      }));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const booking = await Booking.findById(input.id);
        if (!booking) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
        }

        const hall = await BanquetHall.findById(booking.banquetHallId);
        const payments = await Payment.find({ bookingId: booking._id.toString() });
        const bookingMenus = await BookingMenu.find({ bookingId: booking._id.toString() });
        const bookingServices = await BookingService.find({ bookingId: booking._id.toString() });

        // Get menu details
        const menusWithDetails = await Promise.all(
          bookingMenus.map(async (bm) => {
            const menu = await FoodMenu.findById(bm.foodMenuId);
            return {
              id: bm._id.toString(),
              bookingId: bm.bookingId,
              foodMenuId: bm.foodMenuId,
              numberOfPeople: bm.numberOfPeople,
              totalPrice: bm.totalPrice.toString(),
              isLocked: bm.isLocked,
              menuDetails: menu ? {
                id: menu._id.toString(),
                name: menu.name,
                pricePerPerson: menu.pricePerPerson.toString(),
              } : null,
            };
          })
        );

        // Get service details
        const servicesWithDetails = await Promise.all(
          bookingServices.map(async (bs) => {
            const service = await AdditionalService.findById(bs.serviceId);
            return {
              id: bs._id.toString(),
              bookingId: bs.bookingId,
              serviceId: bs.serviceId,
              quantity: bs.quantity,
              totalPrice: bs.totalPrice.toString(),
              serviceDetails: service ? {
                id: service._id.toString(),
                name: service.name,
                price: service.price.toString(),
              } : null,
            };
          })
        );

        return {
          id: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
          banquetHallId: booking.banquetHallId,
          hall: hall ? {
            id: hall._id.toString(),
            name: hall.name,
            capacity: hall.capacity,
          } : null,
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          clientPhone: booking.clientPhone,
          clientCnic: booking.clientCnic,
          clientNtn: booking.clientNtn,
          isTaxFiler: booking.isTaxFiler,
          eventDate: booking.eventDate,
          eventTime: booking.eventTime,
          eventType: booking.eventType,
          numberOfGuests: booking.numberOfGuests,
          expectedGuests: booking.expectedGuests,
          roomsRequired: booking.roomsRequired,
          status: booking.status,
          blockType: booking.blockType,
          blockExpiresAt: booking.blockExpiresAt,
          hallRate: booking.hallRate.toString(),
          subtotal: booking.subtotal.toString(),
          salesTax: booking.salesTax.toString(),
          advanceTax: booking.advanceTax.toString(),
          totalAmount: booking.totalAmount.toString(),
          paidAmount: booking.paidAmount.toString(),
          notes: booking.notes,
          vendorDetails: booking.vendorDetails,
          createdBy: booking.createdBy,
          assignedTo: booking.assignedTo,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          confirmedAt: booking.confirmedAt,
          payments: payments.map(p => ({
            id: p._id.toString(),
            bookingId: p.bookingId,
            amount: p.amount.toString(),
            paymentType: p.paymentType,
            paymentStage: p.paymentStage,
            paymentMethod: p.paymentMethod,
            paymentDate: p.paymentDate,
            notes: p.notes,
            recordedBy: p.recordedBy,
            createdAt: p.createdAt,
          })),
          menus: menusWithDetails,
          services: servicesWithDetails,
          reminders: [],
        };
      }),

    checkAvailability: protectedProcedure
      .input(z.object({
        hallId: z.string(),
        eventDate: z.date(),
      }))
      .query(async ({ input }) => {
        const startOfDay = new Date(input.eventDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(input.eventDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await Booking.find({
          banquetHallId: input.hallId,
          eventDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $nin: ['cancelled'] },
        });

        return {
          available: existingBookings.length === 0,
          existingBookings: existingBookings.map(b => ({
            id: b._id.toString(),
            bookingNumber: b.bookingNumber,
            clientName: b.clientName,
            status: b.status,
          })),
        };
      }),

    createSoftReservation: protectedProcedure
      .input(z.object({
        banquetHallId: z.string(),
        clientName: z.string(),
        clientEmail: z.string().optional(),
        clientPhone: z.string(),
        eventDate: z.date(),
        eventType: z.string().optional(),
        numberOfGuests: z.number(),
        hallRate: z.string(),
        totalAmount: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const bookingNumber = generateBookingNumber();
        const booking = await Booking.create({
          bookingNumber,
          banquetHallId: input.banquetHallId,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          eventDate: input.eventDate,
          eventType: input.eventType,
          numberOfGuests: input.numberOfGuests,
          status: 'soft_reservation',
          hallRate: parseFloat(input.hallRate),
          subtotal: parseFloat(input.totalAmount),
          totalAmount: parseFloat(input.totalAmount),
          paidAmount: 0,
          notes: input.notes,
          createdBy: ctx.user.id,
        });

        return { id: booking._id.toString(), bookingNumber };
      }),

    confirmBooking: protectedProcedure
      .input(z.object({
        id: z.string(),
        clientCnic: z.string(),
        clientNtn: z.string().optional(),
        isTaxFiler: z.boolean(),
        tokenAmount: z.string(),
        paymentMethod: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const booking = await Booking.findById(input.id);
        if (!booking) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
        }

        // Calculate taxes
        const subtotal = booking.subtotal;
        const salesTax = subtotal * 0.10; // 10% sales tax
        const advanceTax = subtotal * (input.isTaxFiler ? 0.10 : 0.20); // 10% filer, 20% non-filer
        const totalAmount = subtotal + salesTax + advanceTax;

        // Update booking
        booking.status = 'confirmed';
        booking.clientCnic = input.clientCnic;
        booking.clientNtn = input.clientNtn;
        booking.isTaxFiler = input.isTaxFiler;
        booking.salesTax = salesTax;
        booking.advanceTax = advanceTax;
        booking.totalAmount = totalAmount;
        booking.paidAmount = parseFloat(input.tokenAmount);
        booking.confirmedAt = new Date();
        await booking.save();

        // Create payment record
        await Payment.create({
          bookingId: booking._id.toString(),
          amount: parseFloat(input.tokenAmount),
          paymentType: 'token',
          paymentStage: 1,
          paymentMethod: input.paymentMethod,
          paymentDate: new Date(),
          recordedBy: ctx.user.id,
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        eventDate: z.date().optional(),
        eventType: z.string().optional(),
        numberOfGuests: z.number().optional(),
        notes: z.string().optional(),
        status: z.enum(['tentative_block', 'soft_reservation', 'confirmed', 'completed', 'cancelled']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await Booking.findByIdAndUpdate(id, data);
        return { success: true };
      }),

    cancel: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await Booking.findByIdAndUpdate(input.id, { status: 'cancelled' });
        return { success: true };
      }),
  }),

  // Payments
  payments: router({
    add: protectedProcedure
      .input(z.object({
        bookingId: z.string(),
        amount: z.string(),
        paymentType: z.enum(['token', 'partial', 'final', 'second_payment', 'final_payment']),
        paymentStage: z.number().optional(),
        paymentMethod: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const payment = await Payment.create({
          bookingId: input.bookingId,
          amount: parseFloat(input.amount),
          paymentType: input.paymentType,
          paymentStage: input.paymentStage,
          paymentMethod: input.paymentMethod,
          paymentDate: new Date(),
          notes: input.notes,
          recordedBy: ctx.user.id,
        });

        // Update booking paid amount
        const booking = await Booking.findById(input.bookingId);
        if (booking) {
          booking.paidAmount = booking.paidAmount + parseFloat(input.amount);
          await booking.save();
        }

        return { id: payment._id.toString() };
      }),

    getByBookingId: protectedProcedure
      .input(z.object({ bookingId: z.string() }))
      .query(async ({ input }) => {
        const payments = await Payment.find({ bookingId: input.bookingId });
        return payments.map(p => ({
          id: p._id.toString(),
          bookingId: p.bookingId,
          amount: p.amount.toString(),
          paymentType: p.paymentType,
          paymentStage: p.paymentStage,
          paymentMethod: p.paymentMethod,
          paymentDate: p.paymentDate,
          notes: p.notes,
          recordedBy: p.recordedBy,
          createdAt: p.createdAt,
        }));
      }),
  }),

  // Date Notes
  dateNotes: router({
    list: protectedProcedure.query(async () => {
      const notes = await DateNote.find();
      return notes.map(n => ({
        id: n._id.toString(),
        date: n.date,
        note: n.note,
        isPrivate: n.isPrivate,
        createdBy: n.createdBy,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      }));
    }),

    create: protectedProcedure
      .input(z.object({
        date: z.date(),
        note: z.string(),
        isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const note = await DateNote.create({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id: note._id.toString() };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await DateNote.findByIdAndDelete(input.id);
        return { success: true };
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const notifications = await Notification.find({ userId: ctx.user.id }).sort({ createdAt: -1 });
      return notifications.map(n => ({
        id: n._id.toString(),
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        bookingId: n.bookingId,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));
    }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const count = await Notification.countDocuments({
        userId: ctx.user.id,
        isRead: false,
      });

      return { count };
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await Notification.findByIdAndUpdate(input.id, { isRead: true });
        return { success: true };
      }),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      await Notification.updateMany({ userId: ctx.user.id }, { isRead: true });
      return { success: true };
    }),
  }),

  // Comments
  comments: router({
    getByBookingId: protectedProcedure
      .input(z.object({ bookingId: z.string() }))
      .query(async ({ input }) => {
        const comments = await BookingComment.find({ bookingId: input.bookingId }).sort({ createdAt: -1 });
        return comments.map(c => ({
          id: c._id.toString(),
          bookingId: c.bookingId,
          userId: c.userId,
          department: c.department,
          comment: c.comment,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
      }),

    add: protectedProcedure
      .input(z.object({
        bookingId: z.string(),
        comment: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const comment = await BookingComment.create({
          bookingId: input.bookingId,
          userId: ctx.user.id,
          department: ctx.user.department as any,
          comment: input.comment,
        });
        return { id: comment._id.toString() };
      }),
  }),
});

export type AppRouter = typeof appRouter;
