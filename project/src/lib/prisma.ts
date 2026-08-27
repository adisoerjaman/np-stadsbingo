import { PrismaClient } from "@prisma/client";

// Eén gedeelde PrismaClient (singleton). Voorkomt dat in development bij elke
// hot-reload — en in serverless bij elke functie-instantie — een nieuwe
// connectie wordt geopend, wat de connection pool van Postgres uitput.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
