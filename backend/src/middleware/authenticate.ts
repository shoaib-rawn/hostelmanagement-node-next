import type { Request, RequestHandler } from "express";
import { AppError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../lib/tokens";

export const authenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Login zaroori hai", "UNAUTHENTICATED");
  }

  const token = header.slice("Bearer ".length).trim();
  const payload = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, hostelId: true, role: true, isActive: true },
  });

  if (!user) {
    throw new AppError(401, "Yeh account maujood nahi", "UNAUTHENTICATED");
  }

  if (!user.isActive) {
    throw new AppError(403, "Yeh account band hai", "ACCOUNT_DISABLED");
  }

  req.auth = { userId: user.id, hostelId: user.hostelId, role: user.role };
  next();
};
export function getAuth(req: Request) {
  if (!req.auth) {
    throw new AppError(401, "Login zaroori hai", "UNAUTHENTICATED");
  }
  return req.auth;
}
