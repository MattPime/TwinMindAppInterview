/**
 * Unit test for summary generation
 */
import request from 'supertest';
import app from '../index.js';

describe("Summary API", () => {
  test("should return structured summary from transcript", async () => {
    const res = await request(app)
      .post("/api/summary")
      .send({ transcript: "This is a test transcript with multiple points." });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.sections)).toBe(true);
    expect(res.body.sections.length).toBeGreaterThan(0);
  });
});
