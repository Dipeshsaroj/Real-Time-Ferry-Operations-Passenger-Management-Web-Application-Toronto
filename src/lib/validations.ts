import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['citizen', 'staff', 'admin']).default('citizen'),
  language: z.enum(['en', 'fr']).default('en'),
});

export const bookingSchema = z.object({
  scheduleId: z.string().uuid('Invalid schedule ID'),
  passengerCount: z.number().int().min(1, 'Must book at least 1 seat').max(10, 'Cannot book more than 10 seats at once'),
  guestEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export const permitSchema = z.object({
  facility: z.string().min(2, 'Facility is required'),
  dateRangeStart: z.string().or(z.date()),
  dateRangeEnd: z.string().or(z.date()),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters'),
});

export const alertSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(5, 'Body is required'),
  severity: z.enum(['info', 'warning', 'critical']),
  routeId: z.string().uuid('Invalid route ID').optional().nullable().or(z.literal('')),
  validFrom: z.string().or(z.date()),
  validUntil: z.string().or(z.date()),
});

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(5, 'Body is required'),
  language: z.enum(['en', 'fr']).default('en'),
});
