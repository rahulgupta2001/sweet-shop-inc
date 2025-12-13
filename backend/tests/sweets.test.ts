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
  // Clean up before tests start
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

  describe('GET /api/sweets', () => {
    it('should list all sweets for authenticated users', async () => {
      // 1. Create a sweet first (as Admin)
      const adminToken = generateToken('admin');
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: "Test Candy",
          category: "Candy",
          price: 1.00,
          quantity: 100
        });

      // 2. Fetch list (as User)
      const userToken = generateToken('user');
      const res = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });

    it('should block unauthenticated requests', async () => {
      const res = await request(app).get('/api/sweets');
      expect(res.statusCode).toEqual(401);
    });
  });

  // NEW: Purchase Tests (This will fail initially -> RED)
  describe('POST /api/sweets/:id/purchase', () => {
    it('should allow user to purchase a sweet and decrease stock', async () => {
      // 1. Create a sweet with quantity 10
      const adminToken = generateToken('admin');
      const sweetRes = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "Ladoo", category: "Traditional", price: 2.00, quantity: 10 });
      
      const sweetId = sweetRes.body.id;

      // 2. Purchase 1 unit
      const userToken = generateToken('user');
      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("Purchase successful");
      expect(res.body.remainingQuantity).toEqual(9);
    });

    it('should fail if sweet is out of stock', async () => {
      // 1. Create sweet with quantity 0
      const adminToken = generateToken('admin');
      const sweetRes = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "Empty Box", category: "Test", price: 1.00, quantity: 0 });
      
      const sweetId = sweetRes.body.id;

      // 2. Try to purchase
      const userToken = generateToken('user');
      const res = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual("Out of stock");
    });
  });
});

describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      // Create specific sweet
      const adminToken = generateToken('admin');
      await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "UniqueSearchItem", category: "Test", price: 10, quantity: 5 });

      const userToken = generateToken('user');
      const res = await request(app)
        .get('/api/sweets/search?q=UniqueSearchItem')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].name).toEqual("UniqueSearchItem");
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should allow Admin to update a sweet', async () => {
      // Create sweet
      const adminToken = generateToken('admin');
      const createRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "Old Name", category: "Test", price: 10, quantity: 5 });
      const id = createRes.body.id;

      // Update sweet
      const res = await request(app)
        .put(`/api/sweets/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "New Name", price: 20 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual("New Name");
      expect(res.body.price).toEqual(20);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should allow Admin to delete a sweet', async () => {
      // Create sweet
      const adminToken = generateToken('admin');
      const createRes = await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`)
        .send({ name: "To Delete", category: "Test", price: 10, quantity: 5 });
      const id = createRes.body.id;

      // Delete sweet
      const res = await request(app)
        .delete(`/api/sweets/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/sweets/search?q=To Delete`) // Re-using search to check existence
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(getRes.body.length).toEqual(0);
    });
  });