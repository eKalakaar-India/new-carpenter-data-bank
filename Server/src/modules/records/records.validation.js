import { z } from 'zod';

export const createRecordSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required').optional(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateRecordSchema = createRecordSchema.partial();

export const recordIdParamSchema = z.object({
  id: z.string().min(1, 'Record id is required'),
});

export const recordQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
});
