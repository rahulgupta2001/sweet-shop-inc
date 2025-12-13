import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSweet = async (data: { name: string; category: string; price: number; quantity: number }) => {
  return await prisma.sweet.create({
    data
  });
};