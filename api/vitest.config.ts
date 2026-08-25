import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/dwell_test?schema=public",
      JWT_SECRET: "test-secret-that-is-at-least-thirty-two-characters",
      JWT_EXPIRES_IN: "1h",
      CORS_ORIGIN: "http://localhost:3000"
    }
  }
});
