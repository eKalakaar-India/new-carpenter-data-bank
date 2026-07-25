import { z } from 'zod';

const commonFields = {
  aadhar_name: z.string().min(1, "Name is required"),
  
  father_name: z.string().min(1, "Father name is required"),

  mobile_no: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

  identity_card_no: z
      .string()
      .regex(/^\d{12}$/, "Invalid Aadhaar number"),

  date_of_birth: z.string(),

  age: z.coerce.number().min(18),

  gender: z.enum([
      "MALE",
      "FEMALE",
      "OTHER"
  ]),

  district: z.string(),

  state: z.string(),

  pin: z.string()
      .regex(/^\d{6}$/),

  address: z.string(),
  marital_status: z.string(),
  religion: z.string(),
  nominee_name:z.string(),
  nominee_gender:z.string(),
  nominee_mobile_no:z.string()
      .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  nominee_dob:z.string(),
  relationship_with_participant: z.string()
  
};

export const createCarpenterSchema = z.object({
  ...commonFields,
});

export const updateCarpenterSchema = z.object({
  ...Object.fromEntries(Object.entries(commonFields).map(([key, value]) => [key, value.optional()])),
});

export const carpenterIdParamSchema = z.object({
  id: z.string().min(1, 'Carpenter id is required'),
});

export const carpenterQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
  search: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  trade: z.string().optional(),
  training_status: z.string().optional(),
  insurance_status: z.string().optional(),
  sort: z.string().optional(),
});
