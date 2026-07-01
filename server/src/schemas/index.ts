import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  allDay: z.boolean().optional().default(false),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default("#3B82F6"),
  location: z.string().max(200).nullable().optional(),
  recurrenceRule: z.string().max(500).nullable().optional(),
});

export const eventUpdateSchema = eventSchema.partial();
