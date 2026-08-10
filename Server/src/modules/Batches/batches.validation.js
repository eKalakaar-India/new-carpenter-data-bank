import { z } from 'zod';

export const createBatchSchema = z.object({
    workshop_date: z.coerce.date({
      required_error: "Date of Workshop is required",
      invalid_type_error: "Invalid date format",
    }),

    trainer_name: z.string().trim().min(1, "Trainer name is required").max(50),

    status: z.enum(['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'], {
      required_error: "Status is required",
    }),
    mobiliser_id:z.string().trim().min(1, "Mobiliser ID is required."),
    trainer_phoneno:z.string().min(10, "Valid Mobile no is required.").max(10, "Valid Mobile no. is required."),
    state: z.string().trim().min(1, "State is required").max(30),
    district: z.string().trim().min(1, "District is required").max(30),
    city_town: z.string().trim().min(1, "Block is required").max(60),
    full_address: z.string().trim().min(1, "Full address is required").max(100),

});