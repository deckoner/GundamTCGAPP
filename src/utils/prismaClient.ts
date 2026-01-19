import { PrismaClient } from "@prisma/client";

// Declaración global para evitar múltiples instancias en desarrollo
declare global {
  var __prisma: PrismaClient | undefined;
}

// Inicializar cliente de Prisma
const prisma = global.__prisma || new PrismaClient();

// En desarrollo, reutilizar la conexión para evitar errores de límites (HMR)
if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
