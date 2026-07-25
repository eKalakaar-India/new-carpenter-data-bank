/**
 * googleSheet.validation.js
 */

import { z } from "zod";

export const SpreadsheetIdSchema = z
  .string()
  .min(20)
  .max(100);

export const WorksheetSchema = z
  .string()
  .min(1)
  .max(100);

export const CellRangeSchema = z
  .string()
  .regex(/^[A-Za-z0-9!:$]+$/);

export const AppendRowsSchema = z.array(
  z.array(
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null()
    ])
  )
);

export const UpdateRowsSchema = z.object({
  range: CellRangeSchema,
  values: AppendRowsSchema
});

export const ReadSchema = z.object({
  range: CellRangeSchema
});

export function validate(schema, payload) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw result.error;
  }

  return result.data;
}