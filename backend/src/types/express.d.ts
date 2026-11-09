import type { Role } from "../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        hostelId: string;
        role: Role;
      };
    }
  }
}

export {};
