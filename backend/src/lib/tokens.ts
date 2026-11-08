import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "../generated/prisma/client";
import { AppError } from "./errors";

export type AccessTokenPayload = {
  userId: string;
  hostelId: string;
  role: Role;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(
    { hostelId: payload.hostelId, role: payload.role },
    env.JWT_ACCESS_SECRET,
    {
      subject: payload.userId,
      expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
      algorithm: "HS256",
    },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.hostelId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      throw new AppError(401, "Token ka muwad ghalat hai", "INVALID_TOKEN");
    }

    return {
      userId: decoded.sub,
      hostelId: decoded.hostelId,
      role: decoded.role as Role,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(
        401,
        "Token ki muddat khatam ho gayi",
        "TOKEN_EXPIRED",
      );
    }
    throw new AppError(401, "Token ghalat hai", "INVALID_TOKEN");
  }
}

export function generateRefreshToken(): string {
  return randomBytes(64).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiry(): Date {
  return new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
}
