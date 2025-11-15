let app;

describe('GET /api/stores/:id/insights/bookings (simulate)', () => {
  beforeAll(async () => {
    const express = (await import('express')).default;
    const mod = await import('../src/controllers/insights.controller.js');
    app = express();
    app.get('/api/stores/:id/insights/bookings', (req, res) => mod.getBookingInsightsForStore(req, res));
  });

  test('returns simulated booking insights with expected structure and types', async () => {
    const request = (await import('supertest')).default;
    const res = await request(app).get('/api/stores/any-id/insights/bookings?simulate=1');
    expect(res.status).toBe(200);
    const body = res.body;
    expect(body).toBeDefined();
    expect(body.ok).toBe(true);

    // summary
    expect(body.summary).toBeDefined();
    expect(typeof body.summary.totalAppointments).toBe('number');
    expect(typeof body.summary.confirmed).toBe('number');
    expect(typeof body.summary.cancelled).toBe('number');
    expect(typeof body.summary.completionRate).toBe('number');

    // arrays
    expect(Array.isArray(body.busySlots)).toBe(true);
    expect(Array.isArray(body.services)).toBe(true);
    expect(Array.isArray(body.suggestions)).toBe(true);

    // busySlots items
    for (const s of body.busySlots) {
      expect(typeof s.hour).toBe('string');
      expect(typeof s.count).toBe('number');
      expect(Object.values(s).every((v) => typeof v !== 'undefined')).toBe(true);
    }

    // services items
    for (const svc of body.services) {
      expect(typeof svc.name).toBe('string');
      expect(typeof svc.total).toBe('number');
      expect(Object.values(svc).every((v) => typeof v !== 'undefined')).toBe(true);
    }

    // suggestions
    for (const s of body.suggestions) {
      expect(typeof s).toBe('string');
    }
  });
});
