import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const registerUser = async (email: string, password: string, role: string = 'user') => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role
    }
  });

  // Generate Token
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, {
    expiresIn: '1h'
  });

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate Token
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, {
    expiresIn: '1h'
  });

  return { user, token };
};