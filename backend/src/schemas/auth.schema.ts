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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Password likhna zaroori hai").max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken zaroori hai").max(512),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
