// src/lib/validation.ts
import { z } from "zod";
import { isAfter } from "date-fns";

// 1) Base shape (no refinements)
const baseRecordSchema = z.object({
  query: z
    .string()
    .min(1, 'Please enter a location (city, landmark, ZIP, or "lat,lon").'),
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  // Dates arrive as strings from <input type="date">
  startDate: z
    .string()
    .refine((d) => !Number.isNaN(Date.parse(d)), "Invalid start date"),
  endDate: z
    .string()
    .refine((d) => !Number.isNaN(Date.parse(d)), "Invalid end date"),
  notes: z.string().optional(),
});

// 2) Helper to add the date-range refinement to any compatible schema
const withValidDateRange = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: any) => {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      return !isAfter(s, e);
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

// 3) Final schemas
export const createRecordSchema = withValidDateRange(baseRecordSchema);

export const updateRecordSchema = withValidDateRange(
  baseRecordSchema.extend({
    id: z.string(),
  })
);
