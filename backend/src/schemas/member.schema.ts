import { z } from "zod";
import { signupSchema } from "./auth.schema";

export const createMemberSchema = z.object({
  fullName: signupSchema.shape.fullName,
  email: signupSchema.shape.email,
  password: signupSchema.shape.password,
  role: z.enum(["MANAGER", "WARDEN", "STUDENT"]),
});

export const memberIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
