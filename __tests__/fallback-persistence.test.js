const fs = require('fs');
const path = require('path');
const request = require('supertest');
const JSZip = require('jszip');
const { app } = require('../server');

function parseBinaryResponse(res, callback) {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  res.on('end', () => callback(null, Buffer.concat(chunks)));
}

describe('fallback persistence and auth', () => {
  test('should keep persisted users when restarting in development mode', () => {
    const dataPath = path.join(__dirname, '..', 'data', 'storage.json');
    const original = fs.existsSync(dataPath) ? fs.readFileSync(dataPath, 'utf8') : null;

    const savedData = {
      users: [{
        _id: 'persisted-user-id',
        email: 'persisted@example.com',
        password: 'secret123',
        name: 'Persisted User',
        farmName: 'Ferme Persistée',
        createdAt: new Date().toISOString()
      }],
      transactions: []
    };

    fs.writeFileSync(dataPath, JSON.stringify(savedData, null, 2));

    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.resetModules();

    try {
      const freshServer = require('../server');
      const loaded = freshServer.loadFallbackData();
      expect(loaded.users.some((user) => user.email === 'persisted@example.com')).toBe(true);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      jest.resetModules();
      if (original === null) {
        if (fs.existsSync(dataPath)) fs.unlinkSync(dataPath);
      } else {
        fs.writeFileSync(dataPath, original);
      }
    }
  });

  test('GET /api/history should require an auth token', async () => {
    const res = await request(app).get('/api/history');
    expect(res.statusCode).toBe(401);
  });

  test('register/login should persist account and data for the same user', async () => {
    const uniqueEmail = `persist-${Date.now()}@example.com`;

    const registerRes = await request(app)
      .post('/api/register')
      .send({
        email: uniqueEmail,
        password: 'password123',
        name: 'Persist User',
        farmName: 'Fermes Persist'
      });

    expect(registerRes.statusCode).toBe(200);
    expect(registerRes.body).toHaveProperty('token');

    const authToken = registerRes.body.token;

    const historyBefore = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${authToken}`);

    expect(historyBefore.statusCode).toBe(200);
    expect(Array.isArray(historyBefore.body)).toBe(true);

    const createRes = await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'achat',
        resource: 'Maïs',
        quantity: 12,
        unitPrice: 3.5
      });

    expect(createRes.statusCode).toBe(200);
    expect(createRes.body).toHaveProperty('resource', 'Maïs');

    const historyAfter = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${authToken}`);

    expect(historyAfter.statusCode).toBe(200);
    expect(historyAfter.body.some(item => item.resource === 'Maïs')).toBe(true);

    const loginRes = await request(app)
      .post('/api/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');

    const historyByLogin = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(historyByLogin.statusCode).toBe(200);
    expect(historyByLogin.body.some(item => item.resource === 'Maïs')).toBe(true);
  });

  test('GET /api/export should return a valid workbook containing only the authenticated user data', async () => {
    const uniqueId = Date.now();
    const owner = await request(app)
      .post('/api/register')
      .send({
        email: `export-owner-${uniqueId}@example.com`,
        password: 'password123',
        name: 'Export Owner',
        farmName: 'Export Farm'
      });
    const otherUser = await request(app)
      .post('/api/register')
      .send({
        email: `export-other-${uniqueId}@example.com`,
        password: 'password123',
        name: 'Other User',
        farmName: 'Other Farm'
      });

    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${owner.body.token}`)
      .send({ type: 'achat', resource: `Owner-${uniqueId}`, quantity: 2, unitPrice: 3 });
    await request(app)
      .post('/api/history')
      .set('Authorization', `Bearer ${otherUser.body.token}`)
      .send({ type: 'achat', resource: `Other-${uniqueId}`, quantity: 5, unitPrice: 7 });

    const exportResponse = await request(app)
      .get('/api/export')
      .set('Authorization', `Bearer ${owner.body.token}`)
      .buffer(true)
      .parse(parseBinaryResponse);

    expect(exportResponse.statusCode).toBe(200);
    expect(exportResponse.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    expect(Buffer.isBuffer(exportResponse.body)).toBe(true);
    const archive = await JSZip.loadAsync(exportResponse.body);
    const xmlFiles = Object.values(archive.files).filter((file) => file.name.endsWith('.xml'));
    const exportedText = (await Promise.all(xmlFiles.map((file) => file.async('string')))).join('\n');
    expect(exportedText).toContain(`Owner-${uniqueId}`);
    expect(exportedText).not.toContain(`Other-${uniqueId}`);
  });
});
