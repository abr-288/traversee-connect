import { z } from "zod";

// Booking validation schema
export const bookingSchema = z.object({
  customerName: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
  customerEmail: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  customerPhone: z.string()
    .trim()
    .regex(/^\+?[0-9]{8,15}$/, "Phone must be 8-15 digits, optionally starting with +"),
  notes: z.string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .nullable(),
});

// Flight booking validation schema
export const flightBookingSchema = bookingSchema.extend({
  passportNumber: z.string()
    .trim()
    .min(6, "Passport number must be at least 6 characters")
    .max(20, "Passport number must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/, "Passport number can only contain uppercase letters and numbers"),
  nationality: z.string()
    .trim()
    .min(2, "Nationality must be at least 2 characters")
    .max(50, "Nationality must be less than 50 characters"),
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  specialRequests: z.string()
    .max(500, "Special requests must be less than 500 characters")
    .optional()
    .nullable(),
});

// Car booking validation schema
export const carBookingSchema = bookingSchema.extend({
  driverLicense: z.string()
    .trim()
    .min(5, "License number must be at least 5 characters")
    .max(30, "License number must be less than 30 characters")
    .regex(/^[A-Z0-9\-]+$/, "License can only contain uppercase letters, numbers and hyphens"),
  pickupLocation: z.string()
    .trim()
    .min(3, "Pickup location must be at least 3 characters")
    .max(200, "Pickup location must be less than 200 characters"),
  dropoffLocation: z.string()
    .trim()
    .min(3, "Dropoff location must be at least 3 characters")
    .max(200, "Dropoff location must be less than 200 characters"),
});

// Hotel booking validation schema
export const hotelBookingSchema = bookingSchema.extend({
  specialRequests: z.string()
    .max(500, "Special requests must be less than 500 characters")
    .optional()
    .nullable(),
});

// Support message validation schema
export const supportMessageSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  bookingReference: z.string()
    .trim()
    .max(50, "Booking reference must be less than 50 characters")
    .optional(),
  subject: z.string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

// Payment validation schema
export const paymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  amount: z.number().positive("Amount must be positive").max(10000000, "Amount too large"),
  currency: z.string().trim().min(3).max(3),
  paymentMethod: z.enum(["card", "mobile_money", "bank_transfer"]),
  customerInfo: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().email().max(255),
    phone: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
    address: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
  }),
});
