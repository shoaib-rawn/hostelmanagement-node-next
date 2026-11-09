import type { SignupInput } from "../schemas/auth.schema";
import { env } from "../config/env";
import { Prisma, type Role } from "../generated/prisma/client";
import { AppError } from "../lib/errors";
import { hashPassword, verifyPassword } from "../lib/password";
import { prisma } from "../lib/prisma";
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
  signAccessToken,
} from "../lib/tokens";

export async function signup(input: SignupInput) {
  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.$transaction(async (tx) => {
      const hostel = await tx.hostel.create({
        data: { name: input.hostelName },
      });

      const user = await tx.user.create({
        data: {
          hostelId: hostel.id,
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          role: "OWNER",
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          hostelId: true,
          createdAt: true,
        },
      });

      return { hostel: { id: hostel.id, name: hostel.name }, user };
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new AppError(409, "Already email exist", "EMAIL_TAKEN");
    }
    throw err;
  }
}
// Waqt barabar rakhne ke liye: email na mile to bhi ek hash verify hota hai
const DUMMY_HASH = hashPassword("dummy-password-for-timing-only");

type LoginInput = { email: string; password: string };

async function issueTokens(user: { id: string; hostelId: string; role: Role }) {
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    },
  });

  const accessToken = signAccessToken({
    userId: user.id,
    hostelId: user.hostelId,
    role: user.role,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  const hashToCheck = user ? user.passwordHash : await DUMMY_HASH;
  const passwordOk = await verifyPassword(hashToCheck, input.password);

  if (!user || !passwordOk) {
    throw new AppError(
      401,
      "Email ya password ghalat hai",
      "INVALID_CREDENTIALS",
    );
  }

  if (!user.isActive) {
    throw new AppError(403, "Yeh account band hai", "ACCOUNT_DISABLED");
  }

  const tokens = await issueTokens(user);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      hostelId: user.hostelId,
    },
  };
}
async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function rejectReusedToken(userId: string): Promise<never> {
  await revokeAllRefreshTokens(userId);
  throw new AppError(
    401,
    "Yeh refresh token pehle istemal ho chuka hai. Dobara login karo",
    "REFRESH_TOKEN_REUSED",
  );
}

export async function refresh(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(refreshToken) },
    include: { user: true },
  });

  if (!stored) {
    throw new AppError(
      401,
      "Refresh token ghalat hai",
      "INVALID_REFRESH_TOKEN",
    );
  }

  if (stored.revokedAt) {
    return rejectReusedToken(stored.userId);
  }

  if (stored.expiresAt <= new Date()) {
    throw new AppError(
      401,
      "Refresh token ki muddat khatam ho gayi",
      "REFRESH_TOKEN_EXPIRED",
    );
  }

  if (!stored.user.isActive) {
    throw new AppError(403, "Yeh account band hai", "ACCOUNT_DISABLED");
  }

  const newRefreshToken = generateRefreshToken();

  const rotated = await prisma.$transaction(async (tx) => {
    const claimed = await tx.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (claimed.count !== 1) return false;

    await tx.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: refreshTokenExpiry(),
      },
    });

    return true;
  });

  if (!rotated) {
    return rejectReusedToken(stored.userId);
  }

  const accessToken = signAccessToken({
    userId: stored.user.id,
    hostelId: stored.user.hostelId,
    role: stored.user.role,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: env.ACCESS_TOKEN_TTL_SECONDS,
  };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutAll(userId: string) {
  await revokeAllRefreshTokens(userId);
}
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      hostelId: true,
      createdAt: true,
      hostel: { select: { id: true, name: true } },
    },
  });

  if (!user) {
    throw new AppError(404, "User nahi mila", "NOT_FOUND");
  }

  return user;
}
