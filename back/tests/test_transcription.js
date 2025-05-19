/**
 * Unit test for ASR transcription route
 */
import request from 'supertest';
import app from '../index.js'; // adjust if needed
import path from 'path';

describe("Transcription API", () => {
  test("should return transcript for valid audio file", async () => {
    const res = await request(app)
      .post("/api/asr")
      .attach("audio", path.resolve(__dirname, "sample.webm")); // Add a small test file

    expect(res.statusCode).toBe(200);
    expect(res.body.transcript).toBeDefined();
  });
});
