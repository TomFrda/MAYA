const request = require('supertest');
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
        email: 'new@test.com',
        phone_number: '0234354628',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('should login a user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'new@test.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('should update user profile', async () => {
    const token = await getToken();
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name: 'Updated'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('first_name', 'Updated');
  });

  test('should add profile photo', async () => {
    const token = await getToken();
    const res = await request(app)
      .post('/api/users/profile/photo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoUrl: 'http://example.com/photo.jpg'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.profilePhotos).toContain('http://example.com/photo.jpg');
  });

  test('should remove profile photo', async () => {
    const token = await getToken();
    const res = await request(app)
      .delete('/api/users/profile/photo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoUrl: 'http://example.com/photo.jpg'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.profilePhotos).not.toContain('http://example.com/photo.jpg');
  });

  test('should get user info', async () => {
    const token = await getToken();
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', 'new@test.com');
  });

  test('should get user matches', async () => {
    const token = await getToken();
    const res = await request(app)
      .get('/api/users/matches')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('matches');
  });

  test('should update location', async () => {
    const token = await getToken();
    const res = await request(app)
      .put('/api/users/location')
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: 48.8566,
        longitude: 2.3522
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Position mise à jour avec succès');
  });

  test('should get nearby users', async () => {
    const token = await getToken();
    const res = await request(app)
      .get('/api/users/nearby')
      .set('Authorization', `Bearer ${token}`)
      .query({ maxDistance: 10000 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
  });
});

// Helper function to get a valid token
async function getToken() {
  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: 'new@test.com',
      password: 'password123'
    });
  return res.body.token;
}