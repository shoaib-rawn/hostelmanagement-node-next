import { prisma } from "./prisma";

// In models par tenant filter NAHI lagta:
// - Hostel: yeh khud tenant hai
// - RefreshToken: hostelId nahi, userId se chalta hai (auth service)
const GLOBAL_MODELS = new Set(["Hostel", "RefreshToken"]);

type PlainArgs = Record<string, unknown>;

function scoped(value: unknown, hostelId: string) {
  return { ...(value as object | undefined), hostelId };
}

export function forTenant(hostelId: string) {
  return prisma.$extends({
    name: "tenantScope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (GLOBAL_MODELS.has(model)) {
            return query(args);
          }

          const next: PlainArgs = { ...(args as PlainArgs) };

          switch (operation) {
            case "findMany":
            case "findFirst":
            case "findFirstOrThrow":
            case "findUnique":
            case "findUniqueOrThrow":
            case "count":
            case "aggregate":
            case "groupBy":
            case "update":
            case "updateMany":
            case "delete":
            case "deleteMany":
              next.where = scoped(next.where, hostelId);
              break;

            case "create":
              next.data = scoped(next.data, hostelId);
              break;

            case "createMany":
              next.data = Array.isArray(next.data)
                ? next.data.map((row) => scoped(row, hostelId))
                : scoped(next.data, hostelId);
              break;

            default:
              throw new Error(
                `Tenant client mein "${operation}" ki ijazat nahi (model: ${model})`,
              );
          }

          // Prisma ke generic types yahan khud match nahi kar pate,
          // is liye yeh ek jagah ka cast hai.
          return query(next as unknown as typeof args);
        },
      },
    },
  });
}

export type TenantClient = ReturnType<typeof forTenant>;
