import { PrismaClient } from '@prisma/client';

// Reuse a single PrismaClient instance (important with --watch / hot reload
// so we don't open a new DB connection pool on every restart).
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
