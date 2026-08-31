import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),

    password:z.string().min(8,"Password is required"),

    email: z.email().min(1, "Email is required"),

    phone_no: z.string().min(10, "Phone number is required").max(10, "Phone number must be 10 digits"),

    role: z.string()

});