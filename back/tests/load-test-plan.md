# Load Testing Plan

This document outlines a basic load testing strategy for the TwinMind backend.

## Tools

- [Artillery](https://artillery.io/)
- [k6](https://k6.io/)
- Postman/Newman (manual)

## Test Targets

1. `POST /api/asr` — Audio file transcription
2. `POST /api/summary` — GPT summary generation
3. `POST /api/chat` — Chat with transcript

## Metrics

- ⏱️ < 2s response time for 95% of requests
- 🔁 No memory leaks or server crashes
- ✅ Graceful handling of 10+ concurrent users

## Sample Artillery Script (asr-load.yml)

```yaml
config:
  target: "https://your-backend.onrender.com"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
      - post:
          url: "/api/asr"
          formData:
            audio: "./tests/sample.webm"
