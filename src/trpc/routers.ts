import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "./trpc";
import { generateToken, comparePassword } from "../auth/jwt";
import {
  StaffMember,
  BanquetHall,
  FoodMenu,
  AdditionalService,
  Booking,
  Payment,
  BookingMenu,
  BookingService,
  CustomFoodItem,
  CustomService,
  BookingComment,
  BookingActivityLog,
  DateNote,
  Notification,
  BookingVenue,
  BookingCustomMenu,
  PaymentReminder,
} from "../db/models";

export const appRouter = router({
  // ==================== Auth ====================
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return { success: true };
    }),
  }),

  // ==================== Staff ====================
  staff: router({
    login: publicProcedure
      .input(z.object({
        staffId: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const staff = await StaffMember.findById(input.staffId);
        
        if (!staff) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }
        
        if (!staff.isActive) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your account has been deactivated",
          });
        }
        
        // Check password - compare with hashed password
        const validPassword = await comparePassword(input.password, staff.password);
        
        if (!validPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password",
          });
        }
        
        // Update last signed in
        staff.lastSignedIn = new Date();
        await staff.save();
        
        // Generate JWT token
        const token = generateToken({
          staffId: staff._id.toString(),
          email: staff.email,
          name: staff.name,
          department: staff.department,
          accessLevel: staff.accessLevel,
          jobTitle: staff.jobTitle,
        });
        
        // Set cookie
        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        return {
          token,
          staff: {
            id: staff._id.toString(),
            name: staff.name,
            email: staff.email,
            jobTitle: staff.jobTitle,
            department: staff.department,
            accessLevel: staff.accessLevel,
          },
        };
      }),
    
    list: publicProcedure.query(async () => {
      const staff = await StaffMember.find({ isActive: true }).select("-password").sort({ name: 1 });
      return staff.map(s => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        jobTitle: s.jobTitle,
        department: s.department,
        accessLevel: s.accessLevel,
      }));
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const staff = await StaffMember.findById(input.id).select("-password");
        if (!staff) return null;
        return {
          id: staff._id.toString(),
          name: staff.name,
          email: staff.email,
          jobTitle: staff.jobTitle,
          department: staff.department,
          accessLevel: staff.accessLevel,
          isActive: staff.isActive,
          lastSignedIn: staff.lastSignedIn,
        };
      }),
  }),

  // ==================== Banquet Halls ====================
  banquetHalls: router({
    list: protectedProcedure.query(async () => {
      const halls = await BanquetHall.find({ isActive: true }).sort({ name: 1 });
      return halls.map(h => ({
        id: h._id.toString(),
        name: h.name,
        capacity: h.capacity,
        facilities: h.facilities,
        baseRate: h.baseRate,
        isActive: h.isActive,
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
          baseRate: hall.baseRate,
          isActive: hall.isActive,
        };
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        capacity: z.number(),
        facilities: z.string().optional(),
        baseRate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const hall = await BanquetHall.create(input);
        return { id: hall._id.toString() };
      }),
    
    update: adminProcedure
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
        await BanquetHall.findByIdAndUpdate(id, data);
        return { success: true };
      }),
  }),

  // ==================== Food Menus ====================
  foodMenus: router({
    list: protectedProcedure.query(async () => {
      const menus = await FoodMenu.find({ isActive: true }).sort({ name: 1 });
      return menus.map(m => ({
        id: m._id.toString(),
        name: m.name,
        description: m.description,
        pricePerPerson: m.pricePerPerson,
        menuItems: m.menuItems,
        isActive: m.isActive,
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
          pricePerPerson: menu.pricePerPerson,
          menuItems: menu.menuItems,
          isActive: menu.isActive,
        };
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        pricePerPerson: z.string(),
        menuItems: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const menu = await FoodMenu.create(input);
        return { id: menu._id.toString() };
      }),
    
    update: adminProcedure
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
        await FoodMenu.findByIdAndUpdate(id, data);
        return { success: true };
      }),
  }),

  // ==================== Additional Services ====================
  additionalServices: router({
    list: protectedProcedure.query(async () => {
      const services = await AdditionalService.find({ isActive: true }).sort({ name: 1 });
      return services.map(s => ({
        id: s._id.toString(),
        name: s.name,
        description: s.description,
        price: s.price,
        category: s.category,
        isActive: s.isActive,
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
          price: service.price,
          category: service.category,
          isActive: service.isActive,
        };
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        category: z.enum(["sound", "effects", "decoration", "other"]),
      }))
      .mutation(async ({ input }) => {
        const service = await AdditionalService.create(input);
        return { id: service._id.toString() };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        category: z.enum(["sound", "effects", "decoration", "other"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await AdditionalService.findByIdAndUpdate(id, data);
        return { success: true };
      }),
  }),

  // ==================== Bookings ====================
  bookings: router({
    list: protectedProcedure.query(async () => {
      const bookings = await Booking.find()
        .populate("banquetHallId")
        .sort({ eventDate: -1 });
      
      return bookings.map(b => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        banquetHallId: b.banquetHallId?._id?.toString() || "",
        hallName: (b.banquetHallId as any)?.name || "",
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
        hallRate: b.hallRate,
        subtotal: b.subtotal,
        salesTax: b.salesTax,
        advanceTax: b.advanceTax,
        totalAmount: b.totalAmount,
        paidAmount: b.paidAmount,
        notes: b.notes,
        createdAt: b.createdAt,
      }));
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const booking = await Booking.findById(input.id).populate("banquetHallId");
        
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }
        
        const payments = await Payment.find({ bookingId: booking._id }).sort({ paymentDate: -1 });
        const bookingMenus = await BookingMenu.find({ bookingId: booking._id }).populate("foodMenuId");
        const bookingServices = await BookingService.find({ bookingId: booking._id }).populate("serviceId");
        const customFoodItems = await CustomFoodItem.find({ bookingId: booking._id });
        const customServices = await CustomService.find({ bookingId: booking._id });
        const comments = await BookingComment.find({ bookingId: booking._id }).sort({ createdAt: -1 });
        const activityLog = await BookingActivityLog.find({ bookingId: booking._id }).sort({ createdAt: -1 });
        
        return {
          id: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
          banquetHallId: booking.banquetHallId?._id?.toString() || "",
          hall: booking.banquetHallId ? {
            id: (booking.banquetHallId as any)._id.toString(),
            name: (booking.banquetHallId as any).name,
            capacity: (booking.banquetHallId as any).capacity,
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
          hallRate: booking.hallRate,
          subtotal: booking.subtotal,
          salesTax: booking.salesTax,
          advanceTax: booking.advanceTax,
          totalAmount: booking.totalAmount,
          paidAmount: booking.paidAmount,
          notes: booking.notes,
          vendorDetails: booking.vendorDetails,
          confirmedAt: booking.confirmedAt,
          createdAt: booking.createdAt,
          payments: payments.map(p => ({
            id: p._id.toString(),
            amount: p.amount,
            paymentType: p.paymentType,
            paymentStage: p.paymentStage,
            paymentMethod: p.paymentMethod,
            paymentDate: p.paymentDate,
            notes: p.notes,
          })),
          menus: bookingMenus.map(bm => ({
            id: bm._id.toString(),
            menuDetails: bm.foodMenuId ? {
              id: (bm.foodMenuId as any)._id.toString(),
              name: (bm.foodMenuId as any).name,
              pricePerPerson: (bm.foodMenuId as any).pricePerPerson,
            } : null,
            numberOfPeople: bm.numberOfPeople,
            totalPrice: bm.totalPrice,
            isLocked: bm.isLocked,
          })),
          services: bookingServices.map(bs => ({
            id: bs._id.toString(),
            serviceDetails: bs.serviceId ? {
              id: (bs.serviceId as any)._id.toString(),
              name: (bs.serviceId as any).name,
              price: (bs.serviceId as any).price,
            } : null,
            quantity: bs.quantity,
            totalPrice: bs.totalPrice,
          })),
          customFoodItems: customFoodItems.map(cf => ({
            id: cf._id.toString(),
            itemName: cf.itemName,
            quantity: cf.quantity,
            pricePerUnit: cf.pricePerUnit,
            totalPrice: cf.totalPrice,
          })),
          customServices: customServices.map(cs => ({
            id: cs._id.toString(),
            serviceName: cs.serviceName,
            description: cs.description,
            price: cs.price,
          })),
          comments: comments.map(c => ({
            id: c._id.toString(),
            department: c.department,
            comment: c.comment,
            createdAt: c.createdAt,
          })),
          activityLog: activityLog.map(a => ({
            id: a._id.toString(),
            action: a.action,
            description: a.description,
            oldValue: a.oldValue,
            newValue: a.newValue,
            createdAt: a.createdAt,
          })),
        };
      }),
    
    getByStatus: protectedProcedure
      .input(z.object({ status: z.string() }))
      .query(async ({ input }) => {
        const bookings = await Booking.find({ status: input.status })
          .populate("banquetHallId")
          .sort({ eventDate: -1 });
        
        return bookings.map(b => ({
          id: b._id.toString(),
          bookingNumber: b.bookingNumber,
          hallName: (b.banquetHallId as any)?.name || "",
          clientName: b.clientName,
          eventDate: b.eventDate,
          numberOfGuests: b.numberOfGuests,
          status: b.status,
          totalAmount: b.totalAmount,
          paidAmount: b.paidAmount,
        }));
      }),
    
    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        const bookings = await Booking.find({
          eventDate: { $gte: input.startDate, $lte: input.endDate },
          status: { $ne: "cancelled" },
        })
          .populate("banquetHallId")
          .sort({ eventDate: 1 });
        
        return bookings.map(b => ({
          id: b._id.toString(),
          bookingNumber: b.bookingNumber,
          banquetHallId: b.banquetHallId?._id?.toString() || "",
          hallName: (b.banquetHallId as any)?.name || "",
          clientName: b.clientName,
          eventDate: b.eventDate,
          eventTime: b.eventTime,
          eventType: b.eventType,
          numberOfGuests: b.numberOfGuests,
          status: b.status,
          totalAmount: b.totalAmount,
        }));
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
          status: { $ne: "cancelled" },
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
        clientCnic: z.string().optional(),
        clientNtn: z.string().optional(),
        isTaxFiler: z.boolean().default(true),
        eventDate: z.date(),
        eventTime: z.string().optional(),
        eventType: z.string().optional(),
        numberOfGuests: z.number(),
        expectedGuests: z.number().optional(),
        roomsRequired: z.number().default(0),
        hallRate: z.string(),
        subtotal: z.string(),
        salesTax: z.string().default("0.00"),
        advanceTax: z.string().default("0.00"),
        totalAmount: z.string(),
        notes: z.string().optional(),
        vendorDetails: z.string().optional(),
        menuIds: z.array(z.string()).optional(),
        serviceIds: z.array(z.string()).optional(),
        customFoodItems: z.array(z.object({
          itemName: z.string(),
          quantity: z.number(),
          price: z.string(),
        })).optional(),
        customServices: z.array(z.object({
          serviceName: z.string(),
          description: z.string().optional(),
          price: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const bookingNumber = `BK-${nanoid(10)}`;
        
        const booking = await Booking.create({
          bookingNumber,
          banquetHallId: input.banquetHallId,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          clientCnic: input.clientCnic,
          clientNtn: input.clientNtn,
          isTaxFiler: input.isTaxFiler,
          eventDate: input.eventDate,
          eventTime: input.eventTime,
          eventType: input.eventType,
          numberOfGuests: input.numberOfGuests,
          expectedGuests: input.expectedGuests,
          roomsRequired: input.roomsRequired,
          status: "soft_reservation",
          hallRate: input.hallRate,
          subtotal: input.subtotal,
          salesTax: input.salesTax,
          advanceTax: input.advanceTax,
          totalAmount: input.totalAmount,
          paidAmount: "0.00",
          notes: input.notes,
          vendorDetails: input.vendorDetails,
          createdBy: ctx.user.staffId,
        });
        
        // Add menus
        if (input.menuIds && input.menuIds.length > 0) {
          for (const menuId of input.menuIds) {
            const menu = await FoodMenu.findById(menuId);
            if (menu) {
              const totalPrice = (parseFloat(menu.pricePerPerson) * input.numberOfGuests).toFixed(2);
              await BookingMenu.create({
                bookingId: booking._id,
                foodMenuId: menuId,
                numberOfPeople: input.numberOfGuests,
                totalPrice,
              });
            }
          }
        }
        
        // Add services
        if (input.serviceIds && input.serviceIds.length > 0) {
          for (const serviceId of input.serviceIds) {
            const service = await AdditionalService.findById(serviceId);
            if (service) {
              await BookingService.create({
                bookingId: booking._id,
                serviceId,
                quantity: 1,
                totalPrice: service.price,
              });
            }
          }
        }
        
        // Add custom food items
        if (input.customFoodItems && input.customFoodItems.length > 0) {
          for (const item of input.customFoodItems) {
            await CustomFoodItem.create({
              bookingId: booking._id,
              itemName: item.itemName,
              quantity: item.quantity,
              pricePerUnit: item.price,
              totalPrice: (parseFloat(item.price) * item.quantity).toFixed(2),
              createdBy: ctx.user.staffId,
            });
          }
        }
        
        // Add custom services
        if (input.customServices && input.customServices.length > 0) {
          for (const service of input.customServices) {
            await CustomService.create({
              bookingId: booking._id,
              serviceName: service.serviceName,
              description: service.description,
              price: service.price,
              createdBy: ctx.user.staffId,
            });
          }
        }
        
        // Log activity
        await BookingActivityLog.create({
          bookingId: booking._id,
          userId: ctx.user.staffId,
          action: "created",
          description: `Soft reservation created by ${ctx.user.name}`,
        });
        
        return {
          id: booking._id.toString(),
          bookingNumber: booking.bookingNumber,
        };
      }),
    
    confirm: protectedProcedure
      .input(z.object({
        id: z.string(),
        tokenAmount: z.string(),
        paymentMethod: z.string().optional(),
        clientCnic: z.string().optional(),
        clientNtn: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const booking = await Booking.findById(input.id);
        
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }
        
        if (booking.status !== "soft_reservation" && booking.status !== "tentative_block") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only soft reservations or tentative blocks can be confirmed",
          });
        }
        
        // Update booking
        booking.status = "confirmed";
        booking.confirmedAt = new Date();
        booking.paidAmount = input.tokenAmount;
        
        if (input.clientCnic) booking.clientCnic = input.clientCnic;
        if (input.clientNtn) booking.clientNtn = input.clientNtn;
        
        await booking.save();
        
        // Record payment
        await Payment.create({
          bookingId: booking._id,
          amount: input.tokenAmount,
          paymentType: "token",
          paymentStage: 1,
          paymentMethod: input.paymentMethod,
          paymentDate: new Date(),
          recordedBy: ctx.user.staffId,
        });
        
        // Log activity
        await BookingActivityLog.create({
          bookingId: booking._id,
          userId: ctx.user.staffId,
          action: "confirmed",
          description: `Booking confirmed with token payment of PKR ${input.tokenAmount} by ${ctx.user.name}`,
        });
        
        return { success: true };
      }),
    
    addPayment: protectedProcedure
      .input(z.object({
        bookingId: z.string(),
        amount: z.string(),
        paymentType: z.enum(["token", "partial", "final", "second_payment", "final_payment"]),
        paymentStage: z.number().optional(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const booking = await Booking.findById(input.bookingId);
        
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }
        
        // Create payment
        await Payment.create({
          bookingId: booking._id,
          amount: input.amount,
          paymentType: input.paymentType,
          paymentStage: input.paymentStage,
          paymentMethod: input.paymentMethod,
          paymentDate: new Date(),
          notes: input.notes,
          recordedBy: ctx.user.staffId,
        });
        
        // Update booking paid amount
        const newPaidAmount = (parseFloat(booking.paidAmount) + parseFloat(input.amount)).toFixed(2);
        booking.paidAmount = newPaidAmount;
        
        // Check if fully paid
        if (parseFloat(newPaidAmount) >= parseFloat(booking.totalAmount)) {
          booking.status = "completed";
        }
        
        await booking.save();
        
        // Log activity
        await BookingActivityLog.create({
          bookingId: booking._id,
          userId: ctx.user.staffId,
          action: "payment_added",
          description: `Payment of PKR ${input.amount} (${input.paymentType}) recorded by ${ctx.user.name}`,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        clientCnic: z.string().optional(),
        clientNtn: z.string().optional(),
        isTaxFiler: z.boolean().optional(),
        eventDate: z.date().optional(),
        eventTime: z.string().optional(),
        eventType: z.string().optional(),
        numberOfGuests: z.number().optional(),
        expectedGuests: z.number().optional(),
        roomsRequired: z.number().optional(),
        hallRate: z.string().optional(),
        subtotal: z.string().optional(),
        salesTax: z.string().optional(),
        advanceTax: z.string().optional(),
        totalAmount: z.string().optional(),
        notes: z.string().optional(),
        vendorDetails: z.string().optional(),
        status: z.enum(["tentative_block", "soft_reservation", "confirmed", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const { id, ...data } = input;
        const booking = await Booking.findByIdAndUpdate(id, data, { new: true });
        
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }
        
        // Log activity
        await BookingActivityLog.create({
          bookingId: booking._id,
          userId: ctx.user.staffId,
          action: "updated",
          description: `Booking updated by ${ctx.user.name}`,
        });
        
        return { success: true };
      }),
    
    cancel: protectedProcedure
      .input(z.object({
        id: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const booking = await Booking.findById(input.id);
        
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
        }
        
        booking.status = "cancelled";
        await booking.save();
        
        // Log activity
        await BookingActivityLog.create({
          bookingId: booking._id,
          userId: ctx.user.staffId,
          action: "cancelled",
          description: `Booking cancelled by ${ctx.user.name}${input.reason ? `: ${input.reason}` : ""}`,
        });
        
        return { success: true };
      }),
  }),

  // ==================== Comments ====================
  comments: router({
    add: protectedProcedure
      .input(z.object({
        bookingId: z.string(),
        comment: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const comment = await BookingComment.create({
          bookingId: input.bookingId,
          userId: ctx.user.staffId,
          department: ctx.user.department as any,
          comment: input.comment,
        });
        
        return { id: comment._id.toString() };
      }),
    
    getByBooking: protectedProcedure
      .input(z.object({ bookingId: z.string() }))
      .query(async ({ input }) => {
        const comments = await BookingComment.find({ bookingId: input.bookingId })
          .populate("userId")
          .sort({ createdAt: -1 });
        
        return comments.map(c => ({
          id: c._id.toString(),
          department: c.department,
          comment: c.comment,
          userName: (c.userId as any)?.name || "Unknown",
          createdAt: c.createdAt,
        }));
      }),
  }),

  // ==================== Date Notes ====================
  dateNotes: router({
    getByDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        const notes = await DateNote.find({
          date: { $gte: input.startDate, $lte: input.endDate },
          $or: [
            { isPrivate: false },
            { createdBy: ctx.user?.staffId },
          ],
        }).sort({ date: 1 });
        
        return notes.map(n => ({
          id: n._id.toString(),
          date: n.date,
          note: n.note,
          isPrivate: n.isPrivate,
          createdBy: n.createdBy.toString(),
        }));
      }),
    
    create: protectedProcedure
      .input(z.object({
        date: z.date(),
        note: z.string(),
        isPrivate: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const note = await DateNote.create({
          date: input.date,
          note: input.note,
          isPrivate: input.isPrivate,
          createdBy: ctx.user.staffId,
        });
        
        return { id: note._id.toString() };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        
        const note = await DateNote.findById(input.id);
        
        if (!note) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" });
        }
        
        // Only creator or admin can delete
        if (note.createdBy.toString() !== ctx.user.staffId && ctx.user.accessLevel !== "full") {
          throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own notes" });
        }
        
        await DateNote.findByIdAndDelete(input.id);
        
        return { success: true };
      }),
  }),

  // ==================== Notifications ====================
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      const notifications = await Notification.find({ userId: ctx.user.staffId })
        .sort({ createdAt: -1 })
        .limit(50);
      
      return notifications.map(n => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        bookingId: n.bookingId?.toString(),
        isRead: n.isRead,
        createdAt: n.createdAt,
      }));
    }),
    
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return 0;
      
      const count = await Notification.countDocuments({
        userId: ctx.user.staffId,
        isRead: false,
      });
      
      return count;
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await Notification.findByIdAndUpdate(input.id, { isRead: true });
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      
      await Notification.updateMany(
        { userId: ctx.user.staffId, isRead: false },
        { isRead: true }
      );
      
      return { success: true };
    }),
  }),

  // ==================== Dashboard Stats ====================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const totalBookings = await Booking.countDocuments();
      const softReservations = await Booking.countDocuments({ status: "soft_reservation" });
      const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
      const todayEvents = await Booking.countDocuments({
        eventDate: { $gte: today, $lt: tomorrow },
        status: { $in: ["confirmed", "completed"] },
      });
      
      // Calculate total revenue
      const allBookings = await Booking.find({ status: { $in: ["confirmed", "completed"] } });
      const totalRevenue = allBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
      const totalPaid = allBookings.reduce((sum, b) => sum + parseFloat(b.paidAmount), 0);
      
      return {
        totalBookings,
        softReservations,
        confirmedBookings,
        todayEvents,
        totalRevenue: totalRevenue.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        pendingPayments: (totalRevenue - totalPaid).toFixed(2),
      };
    }),
    
    recentBookings: protectedProcedure.query(async () => {
      const bookings = await Booking.find()
        .populate("banquetHallId")
        .sort({ createdAt: -1 })
        .limit(10);
      
      return bookings.map(b => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        clientName: b.clientName,
        hallName: (b.banquetHallId as any)?.name || "",
        eventDate: b.eventDate,
        status: b.status,
        totalAmount: b.totalAmount,
      }));
    }),
    
    upcomingEvents: protectedProcedure.query(async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const bookings = await Booking.find({
        eventDate: { $gte: today },
        status: { $in: ["confirmed", "soft_reservation"] },
      })
        .populate("banquetHallId")
        .sort({ eventDate: 1 })
        .limit(10);
      
      return bookings.map(b => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        clientName: b.clientName,
        hallName: (b.banquetHallId as any)?.name || "",
        eventDate: b.eventDate,
        eventType: b.eventType,
        numberOfGuests: b.numberOfGuests,
        status: b.status,
      }));
    }),
  }),
});

export type AppRouter = typeof appRouter;
