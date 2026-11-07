import { z } from "zod";

export const signupSchema = z.object({
  hostelName: z.string().trim().min(2).max(100),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, "Password kam az kam 8 characters ka ho")
    .max(128)
    .regex(/[A-Za-z]/, "Password mein kam az kam ek harf ho")
    .regex(/[0-9]/, "Password mein kam az kam ek number ho"),
});

export type SignupInput = z.infer<typeof signupSchema>;
