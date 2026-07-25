import { z } from "zod";

export const manualEntrySchema = z.object({
    name: z.string().min(1, "Name is required"),

    fathername: z.string().min(1, "Father name is required"),

    mobile_number: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

    aadhaar_number: z
        .string()
        .regex(/^\d{12}$/, "Invalid Aadhaar number"),

    dob: z.string(),

    age: z.coerce.number().min(18),

    gender: z.enum([
        "MALE",
        "FEMALE",
        "OTHER"
    ]),

    district: z.string(),

    state: z.string(),

    pincode: z
        .string()
        .regex(/^\d{6}$/),

    address: z.string(),
    marital_status: z.string(),
    religion: z.string(),
    nom_name:z.string(),
    nom_gender:z.string(),
    nom_mobile:z.string()
        .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
    nom_dob:z.string(),
    nom_relationship: z.string()

});