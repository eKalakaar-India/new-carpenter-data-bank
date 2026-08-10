import { z } from 'zod';

// Empty Excel cells come through as '' (see sheet_to_json's defval: '' in
// links.service.js) rather than undefined, and z.string().url() rejects an
// empty string - this preprocesses '' -> undefined so an optional link
// column that's genuinely blank doesn't fail validation.
const optionalUrl = (label) =>
  z.preprocess(
    (val) => (val === '' || val === undefined || val === null ? undefined : val),
    z.string().trim().url(`${label} must be a valid URL`).optional()
  );

// Excel "id" column - coerced to string since spreadsheet libraries often
// read plain numeric IDs as numbers.
const idField = z.coerce.string().trim().min(1, 'id is required');

export const certificateLinkRowSchema = z.object({
  id: idField,
  certificate_link: z.string().trim().url('certificate_link must be a valid URL'),
});

export const insuranceLinkRowSchema = z
  .object({
    id: idField,
    'M-Swasth': optionalUrl('M-Swasth'),
    Niva: optionalUrl('Niva'),
  })
  .refine((row) => Boolean(row['M-Swasth'] || row.Niva), {
    message: 'At least one of M-Swasth or Niva is required',
  });