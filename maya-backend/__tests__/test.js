const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const redisClient = require('../config/redisClient');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();
    await redisClient.quit();  // Fermer la connexion Redis
    await new Promise(resolve => setTimeout(resolve, 500)); // Attendre la fermeture des connexions
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

describe('Conversation Routes', () => {
    test('should get all conversations for a user', async () => {
      const res = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${token}`); // Assurez-vous de définir un token valide
  
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
    });
  });