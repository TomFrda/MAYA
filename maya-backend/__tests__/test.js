const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Routes', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        first_name: 'Test',
        email: 'test@test.com',
        phone_number: '+1234567890',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});