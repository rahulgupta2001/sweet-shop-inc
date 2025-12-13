import request from 'supertest';
import app from '../src/app';

describe('System Health Check', () => {
  it('should return 200 OK and welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Welcome to Sweet Shop API");
  });
});