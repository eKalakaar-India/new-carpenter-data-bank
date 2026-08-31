import { z } from "zod";

// Define your gender enum to match public.gender_enum
export const GenderEnum = z.enum(["MALE", "FEMALE", "TRANSGENDER"]); // Adjust values based on your Postgres enum values
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];


export const userProfileSchema = z.object({
  // Names & Personal Info
  first_name: z.string().trim().min(1, "First name is required").max(100),
  middle_name: z.string().trim().max(100).nullable().optional(),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  id_type:z.string().trim(),
  id_img:z.instanceof(File)
    // 1. Ensure a file was actually selected
    .refine((file) => file.name !== "", "File is required.") 
    // 2. Validate file size
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    // 3. Validate file type
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
  gender: GenderEnum,

  // Date of Birth (handles both Date objects and ISO string formats)
  date_of_birth: z.coerce.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  }),

  marital_status: z.string().trim().min(1, "Marital status is required").max(50),
  fathers_name: z.string().trim().min(1, "Father's name is required").max(255),
  mothers_name: z.string().trim().min(1, "Mother's name is required").max(255),
  guardians_name: z.string().trim().max(255).nullable().optional(),

  religion: z.string().trim().min(1, "Religion is required").max(100),
  social_category: z.string().trim().min(1, "Social category is required").max(100),

  disability: z.string().default("false"),

  // Address Details
  state: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().min(1, "District is required").max(100),
  city_block_taluka: z.string().trim().min(1, "City/Block/Taluka is required").max(150),
  gram_panchayat: z.string().trim().max(150).nullable().optional(),
  village: z.string().trim().max(150).nullable().optional(),
  pin_code: z.string().trim().min(1, "PIN code is required").max(10),
  address:z.string(),
  age:z.number(),
  // Identity & Contact Details
  id_no: z.string().trim().min(1, "ID number is required").max(100),
  email_id: z.string().trim().email("Invalid email address").max(255).nullable().optional().or(z.literal("")),
  mobile_no: z.string().trim().min(10, "Valid Mobile number is required").max(10),

  // Education & Employment
  education_level: z.string().trim().max(100).nullable().optional(),
  employed: z.string().nullable().optional(),
  employment_status: z.string().nullable().optional(),

  // Nominee Details
  nominee_first_name: z.string().trim().min(1, "Nominee first name is required").max(100),
  nominee_middle_name: z.string().trim().max(100).nullable().optional(),
  nominee_last_name: z.string().trim().min(1, "Nominee last name is required").max(100),
  nominee_full_name: z.string().trim().max(255).nullable().optional(),

  nominee_gender: GenderEnum,

  nominee_date_of_birth: z.coerce.date({
    required_error: "Nominee date of birth is required",
    invalid_type_error: "Invalid date format",
  }),

  nominee_relationship: z.string().trim().min(1, "Nominee relationship is required").max(100),
  nominee_mobile_no: z.string().trim().min(1, "Nominee mobile number is required").max(20),
});