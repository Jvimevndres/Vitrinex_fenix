let app;

describe('GET /api/stores/:id/insights/products (simulate)', () => {
  beforeAll(async () => {
    const express = (await import('express')).default;
    const mod = await import('../src/controllers/insights.controller.js');
    app = express();
    app.get('/api/stores/:id/insights/products', (req, res) => mod.getProductInsightsForStore(req, res));
  });

  test('returns simulated product insights with expected structure and types', async () => {
    const request = (await import('supertest')).default;
    const res = await request(app).get('/api/stores/any-id/insights/products?simulate=1');
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body).toBeDefined();
    expect(body.ok).toBe(true);

    // summary
    expect(body.summary).toBeDefined();
    expect(typeof body.summary.totalOrders).toBe('number');
    expect(typeof body.summary.totalItemsSold).toBe('number');
    expect(typeof body.summary.totalRevenue).toBe('number');
    expect(typeof body.summary.uniqueProducts).toBe('number');

    // arrays
    expect(Array.isArray(body.topProducts)).toBe(true);
    expect(Array.isArray(body.lowProducts)).toBe(true);
    expect(Array.isArray(body.inventoryAlerts)).toBe(true);
    expect(Array.isArray(body.suggestions)).toBe(true);

    // topProducts items
    for (const p of body.topProducts) {
      expect(typeof p.productId).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.totalSold).toBe('number');
      expect(typeof p.revenue).toBe('number');
      // no undefined
      expect(Object.values(p).every((v) => typeof v !== 'undefined')).toBe(true);
    }

    // lowProducts items
    for (const p of body.lowProducts) {
      expect(typeof p.productId).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.totalSold).toBe('number');
      expect(typeof p.revenue).toBe('number');
      expect(Object.values(p).every((v) => typeof v !== 'undefined')).toBe(true);
    }

    // inventoryAlerts
    for (const a of body.inventoryAlerts) {
      expect(typeof a.level).toBe('string');
      expect(typeof a.message).toBe('string');
    }

    // suggestions
    for (const s of body.suggestions) {
      expect(typeof s).toBe('string');
    }
  });
});
