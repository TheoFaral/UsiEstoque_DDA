const request = require("supertest");
const app = require("../../src/app");

describe("GET /api/health", () => {
  it("deve informar que a API está disponível", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "UsiEstoque DDA API",
      version: "0.1.0",
      timestamp: expect.any(String),
    });
  });
});
