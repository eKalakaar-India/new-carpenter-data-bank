import { z } from "zod";

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),

    password:z.string().min(8,"Password is required"),

    email: z.email().min(1, "Email is required"),

    role: z.string()

});