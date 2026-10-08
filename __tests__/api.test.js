const request = require('supertest');
const app = require('../server');

describe('API Tests', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'password123';

  test('GET /health - provides a deployment health check', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  describe('Mobile assistant link', () => {
    test('GET /api/mobile-link - opens the assistant directly on the local network', async () => {
      const res = await request(app).get('/api/mobile-link');

      expect(res.statusCode).toBe(200);
      expect(res.body.url).toMatch(/^http:\/\/.+#assistant$/);
    });

    test('GET /api/mobile-link - uses the public HTTPS host when deployed behind a proxy', async () => {
      const res = await request(app)
        .get('/api/mobile-link')
        .set('Host', 'agritech.example')
        .set('X-Forwarded-Proto', 'https');

      expect(res.statusCode).toBe(200);
      expect(res.body.url).toBe('https://agritech.example/#assistant');
    });

    test('GET /api/mobile-link - prefers X-Forwarded-Host when a proxy removes the original Host header', async () => {
      const res = await request(app)
        .get('/api/mobile-link')
        .set('X-Forwarded-Host', 'portal.agritech.example')
        .set('X-Forwarded-Proto', 'https');

      expect(res.statusCode).toBe(200);
      expect(res.body.url).toBe('https://portal.agritech.example/#assistant');
    });
  });

  describe('Auth Endpoints', () => {
    test('POST /api/register - should register a new user', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: 'Test User',
          farmName: 'Test Farm',
          role: 'admin'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testEmail);
      expect(res.body.user).toHaveProperty('role', 'member');
      const persistedUser = app.loadFallbackData().users.find((user) => user.email === testEmail);
      expect(persistedUser.password).toMatch(/^\$2[aby]\$/);
    });

    test('POST /api/login - should login existing user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: testEmail,
          password: testPassword
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    test('POST /api/login - should fail with wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Transaction Endpoints', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get token
      const res = await request(app)
        .post('/api/login')
        .send({
          email: testEmail,
          password: testPassword
        });
      authToken = res.body.token;
    });

    test('GET /api/history - should require authentication', async () => {
      const res = await request(app).get('/api/history');
      expect(res.statusCode).toBe(401);
    });

    test('X-Admin-Mode cannot grant admin access to a member account', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`)
        .set('X-Admin-Mode', 'true');

      expect(res.statusCode).toBe(403);
    });

    test('GET /api/history - should return transactions with auth', async () => {
      const res = await request(app)
        .get('/api/history')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/history - should create a transaction', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'achat',
          resource: 'Blé',
          quantity: 100,
          unitPrice: 2.5
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('type', 'achat');
      expect(res.body).toHaveProperty('resource', 'Blé');
    });

    test('POST /api/history - should validate required fields', async () => {
      const res = await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'achat'
          // Missing resource
        });
      
      expect(res.statusCode).toBe(400);
    });

    test('GET /api/dashboard/summary - should return dashboard metrics', async () => {
      await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'achat',
          resource: 'Blé',
          quantity: 40,
          unitPrice: 2
        });

      await request(app)
        .post('/api/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'vente',
          resource: 'Blé',
          quantity: 15,
          unitPrice: 3
        });

      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalRevenue');
      expect(res.body).toHaveProperty('totalPurchases');
      expect(res.body).toHaveProperty('totalProfit');
      expect(res.body).toHaveProperty('operationCount');
      expect(res.body.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    test('GET /api/alerts/stock - should return low stock items', async () => {
      const res = await request(app)
        .get('/api/alerts/stock')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/partners - should create a supplier or customer', async () => {
      const res = await request(app)
        .post('/api/partners')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Société Demo',
          type: 'supplier',
          phone: '0600000000',
          email: 'demo@example.com'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Société Demo');
      expect(res.body).toHaveProperty('type', 'supplier');
    });

    test('GET /api/products - should return product catalog', async () => {
      const adminRes = await request(app)
        .post('/api/login')
        .send({
          email: 'admin@local.test',
          password: 'dev-secret'
        });

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/products - should create a product with metadata', async () => {
      const adminRes = await request(app)
        .post('/api/login')
        .send({
          email: 'admin@local.test',
          password: 'dev-secret'
        });

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminRes.body.token}`)
        .send({
          name: 'Semences Maïs',
          category: 'Semence',
          unit: 'kg',
          priceBuy: 1.2,
          priceSell: 1.8,
          alertThreshold: 20
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name', 'Semences Maïs');
      expect(res.body).toHaveProperty('category', 'Semence');
      expect(res.body).toHaveProperty('unit', 'kg');
    });

    test('GET /api/admin/audit - should return audit trail', async () => {
      const adminRes = await request(app)
        .post('/api/login')
        .send({
          email: 'admin@local.test',
          password: 'dev-secret'
        });

      const res = await request(app)
        .get('/api/admin/audit')
        .set('Authorization', `Bearer ${adminRes.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
