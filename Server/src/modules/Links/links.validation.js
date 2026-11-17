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

// Excel "id" column (the participant's system id) - coerced to string since
// spreadsheet libraries often read plain numeric IDs as numbers.
const idField = z.coerce.string().trim().min(1, 'id is required');

export const certificateLinkRowSchema = z.object({
  id: idField,
  certificate_link: z.string().trim().url('certificate_link must be a valid URL'),
});

// Keys here are the canonical names produced by normalizeInsuranceRow() in
// links.service.js, which also match the participants table columns.
export const insuranceLinkRowSchema = z
  .object({
    id: idField,
    insurance_link_msawasth: optionalUrl('insurance_link_msawasth'),
    insurance_link_niva: optionalUrl('insurance_link_niva'),
  })
  .refine((row) => Boolean(row.insurance_link_msawasth || row.insurance_link_niva), {
    message: 'At least one of insurance_link_msawasth or insurance_link_niva is required',
  });
