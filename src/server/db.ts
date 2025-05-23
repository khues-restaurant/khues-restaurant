import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      // "query", "error", "warn"
      env.NODE_ENV === "development" ? [] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
