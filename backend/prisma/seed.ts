import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@incubyte.com' },
    update: {},
    create: {
      email: 'admin@incubyte.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // 2. Create Sweets (Using loop)
  const sweets = [
    { name: 'Chocolate Lava Cake', category: 'Cake', price: 5.50, quantity: 10 },
    { name: 'Rasgulla', category: 'Traditional', price: 1.00, quantity: 50 },
    { name: 'Gummy Bears', category: 'Candy', price: 2.50, quantity: 100 },
    { name: 'Macarons', category: 'Cookie', price: 8.00, quantity: 20 },
    { name: 'Gulab jamun', category: 'Traditional', price: 3.00, quantity: 15 } // Added this based on your previous logs
  ];

  for (const sweet of sweets) {
    await prisma.sweet.create({ data: sweet });
  }
  
  console.log("Database seeded successfully!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });