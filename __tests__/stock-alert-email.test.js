describe('stock alert email notifications', () => {
  test('the server exposes a safe email alert helper even without SMTP config', async () => {
    const server = require('../server');
    expect(server).toBeTruthy();
    expect(typeof server.sendEmailNotification).toBe('function');

    const result = await server.sendEmailNotification('test@example.com', 'Alerte de stock', 'Test');
    expect(typeof result).toBe('boolean');
  });
});
