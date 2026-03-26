const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../models/User');
let app;
let mongod;

jest.setTimeout(30000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'testsecret';
  app = require('../index');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

test('register, login, refresh, logout flow', async () => {
  // register
  const registerRes = await request(app).post('/api/auth/register').send({ username: 'test', password: 'pass' });
  expect(registerRes.statusCode).toBe(200);

  // login
  const loginRes = await request(app).post('/api/auth/login').send({ username: 'test', password: 'pass' });
  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body.accessToken).toBeDefined();
  const cookies = loginRes.headers['set-cookie'];
  expect(cookies).toBeDefined();

  const accessToken = loginRes.body.accessToken;

  // protected route (settings)
  const protectedRes = await request(app).get('/api/settings').set('Authorization', `Bearer ${accessToken}`);
  expect(protectedRes.statusCode).toBe(200);

  // refresh using cookie
  const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', cookies);
  expect(refreshRes.statusCode).toBe(200);
  expect(refreshRes.body.accessToken).toBeDefined();

  // logout
  const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookies);
  expect([200, 204]).toContain(logoutRes.statusCode);
});
