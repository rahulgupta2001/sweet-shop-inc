describe('POST /api/auth/login', () => {
    it('should login an existing user and return a token', async () => {
      // 1. Create a user first (so we can log in)
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'password123'
      });

      // 2. Attempt login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      // 3. Expect success
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'login@example.com');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });