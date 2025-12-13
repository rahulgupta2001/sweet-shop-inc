import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Helper to generate tokens
const generateToken = (role: string) => {
  return jwt.sign({ id: 1, email: 'test@test.com', role }, SECRET);
};

describe('Sweets Endpoints', () => {
  beforeAll(async () => {
    await prisma.sweet.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/sweets', () => {
    it('should allow Admin to create a sweet', async () => {
      const adminToken = generateToken('admin');
      
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: "Chocolate Lava Cake",
          category: "Cake",
          price: 5.50,
          quantity: 10
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual("Chocolate Lava Cake");
    });

    it('should block non-admin users', async () => {
      const userToken = generateToken('user');
      
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: "Forbidden Cookie",
          category: "Cookie",
          price: 2.00,
          quantity: 5
        });

      expect(res.statusCode).toEqual(403);
    });

    it('should block unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .send({
          name: "Ghost Cookie",
          category: "Cookie",
          price: 2.00,
          quantity: 5
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});