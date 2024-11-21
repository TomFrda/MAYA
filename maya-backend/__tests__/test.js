const { app, server } = require('../server');
const mongoose = require('mongoose');
const redisClient = require('../config/redisClient');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
    await mongoose.connection.close();

    if (redisClient.isOpen) {
        await redisClient.quit();
    }

    server.close(); // Arrête le serveur Express

    await new Promise(resolve => setTimeout(resolve, 500)); // Attendre la fermeture complète
});

describe('Auth Routes', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        first_name: 'New',
        email: 'New@test.com',
        phone_number: '0234354628',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
});
