import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/client";
import { AppError } from "../lib/errors";
import { getAuth } from "./authenticate";

export const requireRole =
  (...allowed: Role[]): RequestHandler =>
  (req, _res, next) => {
    const { role } = getAuth(req);

    if (!allowed.includes(role)) {
      throw new AppError(403, "Aap ko is kaam ki ijazat nahi hai", "FORBIDDEN");
    }

    next();
  };
