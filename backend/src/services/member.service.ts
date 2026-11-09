import { Prisma } from "../generated/prisma/client";
import { AppError } from "../lib/errors";
import { hashPassword } from "../lib/password";
import type { TenantClient } from "../lib/tenant";
import type { CreateMemberInput } from "../schemas/member.schema";

const memberSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export function listMembers(db: TenantClient) {
  return db.user.findMany({
    select: memberSelect,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getMember(db: TenantClient, id: string) {
  const member = await db.user.findUnique({
    where: { id },
    select: memberSelect,
  });

  if (!member) {
    throw new AppError(404, "Member nahi mila", "NOT_FOUND");
  }

  return member;
}

export async function createMember(
  db: TenantClient,
  hostelId: string,
  input: CreateMemberInput,
) {
  const passwordHash = await hashPassword(input.password);

  try {
    return await db.user.create({
      data: {
        hostelId,
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
      },
      select: memberSelect,
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
