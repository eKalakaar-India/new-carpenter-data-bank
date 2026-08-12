import Joi  from 'joi';

export const GENDER_OPTIONS = ['MALE', 'FEMALE', 'TRANSGENDER'];
// export const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
export const MARITAL_STATUS_OPTIONS = ['Yes', 'No'];
export const YES_NO = ['Yes', 'No'];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
];

/**
 * Validates one normalized row parsed from the Excel sheet.
 * Columns owned by the server (id, created_at, updated_at, updated_by,
 * batch_id) are accepted-but-stripped so stray values in the sheet never
 * override server-generated ones.
 */
export const participantRowSchema = Joi.object({
  id: Joi.any().strip(),
  created_at: Joi.any().strip(),
  updated_at: Joi.any().strip(),
  updated_by: Joi.any().strip(),
  batch_id: Joi.any().strip(),

  salutation: Joi.string().trim().max(20).allow(null, ''),
  first_name: Joi.string().trim().max(100).required(),
  middle_name: Joi.string().trim().max(100).allow(null, ''),
  last_name: Joi.string().trim().max(100).allow(null, ''),
  full_name: Joi.string().trim().max(255).allow(null, ''),
  gender: Joi.string().trim().valid(...GENDER_OPTIONS).allow(null, ''),
  date_of_birth: Joi.date().allow(null, ''),
  marital_status: Joi.string().trim().valid(...MARITAL_STATUS_OPTIONS).allow(null, ''),
  fathers_name: Joi.string().trim().max(150).allow(null, ''),
  mothers_name: Joi.string().trim().max(150).allow(null, ''),
  guardians_name: Joi.string().trim().max(150).allow(null, ''),
  religion: Joi.string().trim().max(50).allow(null, ''),
  social_category: Joi.string().trim().max(50).allow(null, ''),
  disability: Joi.string().trim().max(150).allow(null, ''),

  state: Joi.string().trim().max(100).allow(null, ''),
  district: Joi.string().trim().max(100).allow(null, ''),
  city_block_taluka: Joi.string().trim().max(100).allow(null, ''),
  gram_panchayat: Joi.string().trim().max(100).allow(null, ''),
  village: Joi.string().trim().max(100).allow(null, ''),
  pin_code: Joi.string().trim().pattern(/^[0-9]{6}$/).allow(null, '').messages({
    'string.pattern.base': 'pin_code must be a 6-digit number',
  }),
  address: Joi.string().trim().max(500).allow(null, ''),

  id_type: Joi.string().trim().max(50).allow(null, ''),
  id_no: Joi.string().trim().max(50).allow(null, ''),
  email_id: Joi.string().trim().email({ tlds: false }).allow(null, ''),
  country_code: Joi.string().trim().max(5).default('+91'),
  // mobile_no: Joi.string().trim().pattern(/^[0-9]{10}$/).allow(null, '').messages({
  //   'string.pattern.base': 'mobile_no must be a 10-digit number',
  // }),
  mobile_no: Joi.string().trim().allow(null, '').messages({
    'string.pattern.base': 'mobile_no must be a 10-digit number',
  }),

  education_level: Joi.string().trim().max(100).allow(null, ''),
  employed: Joi.string().trim().max(50).allow(null, ''),
  age: Joi.number().integer().min(0).max(120).allow(null, ''),

  nominee_first_name: Joi.string().trim().max(100).allow(null, ''),
  nominee_middle_name: Joi.string().trim().max(100).allow(null, ''),
  nominee_last_name: Joi.string().trim().max(100).allow(null, ''),
  nominee_full_name: Joi.string().trim().max(255).allow(null, ''),
  nominee_gender: Joi.string().trim().valid(...GENDER_OPTIONS).allow(null, ''),
  nominee_date_of_birth: Joi.date().allow(null, ''),
  nominee_relationship: Joi.string().trim().max(50).allow(null, ''),
  nominee_mobile_no: Joi.string().trim().allow(null, '').messages({
    'string.pattern.base': 'nominee_mobile_no must be a 10-digit number',
  }),
  // nominee_mobile_no: Joi.string().trim().pattern(/^[0-9]{10}$/).allow(null, '').messages({
  //   'string.pattern.base': 'nominee_mobile_no must be a 10-digit number',
  // }),

  mobiliser_id: Joi.string().trim().max(100).allow(null, ''),
  candidate_id: Joi.string().trim().max(100).allow(null, ''),
  remarks: Joi.string().trim().max(500).allow(null, ''),

  has_certificate: Joi.boolean().default(false),
  has_insurance: Joi.boolean().default(false),
  certificate_link: Joi.string().trim().uri().allow(null, ''),
}).unknown(false);

/**
 * @param {Object} row - a single normalized row from the sheet
 * @returns {{ error: Joi.ValidationError|undefined, value: Object }}
 */
export function validateParticipantRow(row) {
  return participantRowSchema.validate(row, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
}

export const fileSchema = Joi.object({
  originalname: Joi.string().pattern(/\.(xlsx|xls)$/i).required().messages({
    'string.pattern.base': 'Only .xlsx or .xls files are allowed.',
  }),
  mimetype: Joi.string().valid(...ALLOWED_MIME_TYPES).required().messages({
    'any.only': 'Only .xlsx or .xls files are allowed.',
  }),
  size: Joi.number().max(MAX_FILE_SIZE_BYTES).required().messages({
    'number.max': 'File size must not exceed 10MB.',
  }),
}).unknown(true);

/**
 * @param {Express.Multer.File} file
 */
export function validateExcelFile(file) {
  return fileSchema.validate(file);
}