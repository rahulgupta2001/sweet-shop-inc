import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createSweet = async (data: { name: string; category: string; price: number; quantity: number }) => {
  return await prisma.sweet.create({
    data
  });
};

export const getAllSweets = async () => {
  return await prisma.sweet.findMany({
    orderBy: { createdAt: 'desc' }
  });
};

export const purchaseSweet = async (id: number) => {
  const sweet = await prisma.sweet.findUnique({ where: { id } });

  if (!sweet) throw new Error("Sweet not found");
  if (sweet.quantity < 1) throw new Error("Out of stock");

  // Atomic decrement to prevent race conditions
  const updated = await prisma.sweet.update({
    where: { id },
    data: { quantity: { decrement: 1 } }
  });

  return updated;
};