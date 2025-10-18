import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User from "../src/models/user.model";

let mongoServer: MongoMemoryServer;

describe("Login route tests", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  function userFactory(overrides = {}) {
    return {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
      ...overrides,
    };
  }

  describe("POST /api/login", () => {
    it("should login a user with correct credentials", async () => {
      const user = new User(userFactory());
      await user.save();

      const response = await request(app).post("/api/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(typeof response.body.token).toBe("string");
    });
    it("should not login with incorrect password", async () => {
      const user = new User(userFactory());
      await user.save();

      const response = await request(app).post("/api/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Credenciais inválidas.");
    });
    it("should not login a deactivated user", async () => {
      const user = new User(userFactory({ isActive: false }));
      await user.save();

      const response = await request(app).post("/api/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Esta conta está desativada.");
    });
    it("should return 401 for non-existent user", async () => {
      const response = await request(app).post("/api/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Credenciais inválidas.");
    });
    it("should return a valid JWT token on successful login", async () => {
      const user = new User(userFactory());
      await user.save();

      const response = await request(app).post("/api/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
    it("should not login with wrong email", async () => {
      const user = new User(userFactory());
      await user.save();

      const response = await request(app).post("/api/login").send({
        email: "definitelynotreal@example.com",
        password: "password123",
      });
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Credenciais inválidas.");
    });
    it("should not login with missing password", async () => {
      const user = new User(userFactory());
      await user.save();

      const response = await request(app).post("/api/login").send({
        email: "test@example.com",
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Todos os campos são obrigatórios.");
    });
    it("should not login with missing email", async () => {
      const user = new User(userFactory());
      await user.save();

      const response = await request(app).post("/api/login").send({
        password: "password123",
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Todos os campos são obrigatórios.");
    });
  });
});
