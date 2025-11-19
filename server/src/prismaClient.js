import { PrismaClient } from '@prisma/client';

// Creamos una instancia única del cliente de Prisma
const prisma = new PrismaClient();

export default prisma;