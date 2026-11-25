import request from 'supertest';
import app from '../app';

describe('API Integration Test Suite', () => {
  describe('GET /api/health', () => {
    test('returns 200 OK with correct status, version, and environment', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('app', 'BreatheWise API');
      expect(res.body).toHaveProperty('version', '1.0.0');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/air-quality/stations', () => {
    test('returns 400 when lat or lon query parameters are missing', async () => {
      const res = await request(app).get('/api/air-quality/stations');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('returns 200 with an array when lat/lon are valid numbers', async () => {
      const res = await request(app)
        .get('/api/air-quality/stations')
        .query({ lat: 28.6139, lon: 77.2090, city: 'New Delhi' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stations');
      expect(Array.isArray(res.body.stations)).toBe(true);
    });

    test('handles rural coordinates gracefully without crashing', async () => {
      const res = await request(app)
        .get('/api/air-quality/stations')
        .query({ lat: 16.0396, lon: 80.8396, city: 'Peteru' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stations');
      expect(Array.isArray(res.body.stations)).toBe(true);
    });
  });

  describe('POST /api/auth/register (Password Security Constraints)', () => {
    test('rejects weak password without numbers or special characters with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test',
          email: 'test_sec@breathewise.in',
          password: 'weakpassword',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be at least 8 characters long');
    });

    test('rejects short passwords (< 8 characters) with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test',
          email: 'test_sec2@breathewise.in',
          password: 'Pass1!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Password must be at least 8 characters long');
    });
  });

  describe('Authentication Protected Endpoints (Security Guardrails)', () => {
    test('GET /api/auth/me returns 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('GET /api/planner/today returns 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/planner/today');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('GET /api/planner/streak returns 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/planner/streak');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/assistant/chat returns 401 Unauthorized without token', async () => {
      const res = await request(app)
        .post('/api/assistant/chat')
        .send({ message: 'Is it safe to jog outside?' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('POST /api/community/reports returns 401 Unauthorized without token', async () => {
      const res = await request(app)
        .post('/api/community/reports')
        .send({ title: 'Open garbage burning', description: 'Acrid smoke near market' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/insights/simulator (Public Commuter Model)', () => {
    test('calculates avoided emissions and fuel cost accurately', async () => {
      const res = await request(app)
        .post('/api/insights/simulator')
        .send({
          currentMode: 'petrol-car',
          targetMode: 'metro',
          dailyRoundTripKm: 20,
          commuteDaysPerWeek: 5,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('result');
      expect(res.body.result).toHaveProperty('co2SavedKgMonthly');
      expect(res.body.result).toHaveProperty('particulateAvoidedGramsMonthly');
      expect(res.body.result).toHaveProperty('costComparisonInr');
      expect(res.body.result.co2SavedKgMonthly).toBeGreaterThan(0);
      expect(res.body.result.costComparisonInr.moneySavedMonthly).toBeGreaterThan(0);
    });

    test('returns 400 when missing required parameters', async () => {
      const res = await request(app)
        .post('/api/insights/simulator')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('404 Fallback Handler', () => {
    test('returns 404 JSON for non-existent endpoint', async () => {
      const res = await request(app).get('/api/non-existent-route-404');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Endpoint not found');
    });
  });
});
