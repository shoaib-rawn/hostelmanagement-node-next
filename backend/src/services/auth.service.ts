import { Prisma } from "../generated/prisma/client";
import { AppError } from "../lib/errors";
import { hashPassword } from "../lib/password";
import { prisma } from "../lib/prisma";
import type { SignupInput } from "../schemas/auth.schema";

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
      throw new AppError(
        409,
        "Is email se account pehle se maujood hai",
        "EMAIL_TAKEN",
      );
    }
    throw err;
  }
}
