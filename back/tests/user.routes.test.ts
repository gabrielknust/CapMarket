import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User from "../src/models/user.model";

let mongoServer: MongoMemoryServer;

describe("User Routes API", () => {
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

  it("should return 201 and create a new user and return it", async () => {
    const userData = {
      name: "Teste User",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    };

    const response = await request(app).post("/api/users").send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.email).toBe(userData.email);
    expect(response.body).not.toHaveProperty("password"); // Teste de segurança!
  });

  it("should return 400 if email already exists", async () => {
    await User.create({
      name: "Existing User",
      email: "exists@example.com",
      password: "password123",
      role: "Vendedor",
    });

    const response = await request(app).post("/api/users").send({
      name: "Another User",
      email: "exists@example.com",
      password: "anotherPass",
      role: "Cliente",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Este email já está em uso.");
  });

  it("should return 400 if name is missing", async () => {
    const response = await request(app).post("/api/users").send({
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.name).toBe("O nome é obrigatório.");
  });

  it("should return 400 if email is missing", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Test User",
      password: "password123",
      role: "Cliente",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.email).toBe("O email é obrigatório.");
  });

  it("should return 400 if password is missing", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Test User",
      email: "test@example.com",
      role: "Cliente",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.password).toBe("A senha é obrigatória.");
  });

  it("should return a list of all users", async () => {
    await User.create([
      {
        name: "User One",
        email: "one@example.com",
        password: "p1",
        role: "Cliente",
      },
      {
        name: "User Two",
        email: "two@example.com",
        password: "p2",
        role: "Vendedor",
      },
    ]);

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
    expect(response.body[0].email).toBe("one@example.com");
    expect(response.body[1].email).toBe("two@example.com");
  });

  it("should return a single user if ID is valid", async () => {
    const user = await User.create({
      name: "Teste User",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    });

    const response = await request(app).get(`/api/users/${user._id}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("test@example.com");
  });

  it("should return 404 if ID is not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/users/${nonExistentId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado.");
  });

  it("should return 201 when updating a user's name successfully", async () => {
    const user = await User.create({
      name: "Old Name",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    });

    const updates = { name: "New Name" };
    const response = await request(app)
      .patch(`/api/users/${user._id}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("New Name");
  });

  it("should return 201 when updating a user's email successfully", async () => {
    const user = await User.create({
      name: "User Name",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    });

    const updates = { email: "new@example.com" };
    const response = await request(app)
      .patch(`/api/users/${user._id}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("new@example.com");
    expect(response.body.name).toBe("User Name");
  });

  it("should return 201 when updating a user's role successfully", async () => {
    const user = await User.create({
      name: "User Name",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    });

    const updates = { role: "Vendedor" };
    const response = await request(app)
      .patch(`/api/users/${user._id}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.role).toBe("Vendedor");
  });

  it("should return 201 when updating a user's password successfully", async () => {
    const user = await User.create({
      name: "User Name",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
    });

    const updates = { password: "newPass" };
    const response = await request(app)
      .patch(`/api/users/${user._id}`)
      .send(updates);

    expect(response.status).toBe(200);
    expect(response.body.password).not.toBe("newPass");
  });

  it("should return 404 when trying to update a non-existent user", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updates = { name: "New Name" };
    const response = await request(app)
      .patch(`/api/users/${nonExistentId}`)
      .send(updates);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado.");
  });

  it("should delete a user successfully", async () => {
    const user = await User.create({
      name: "User To Delete",
      email: "delete@example.com",
      password: "password123",
      role: "Cliente",
    });

    const response = await request(app).delete(`/api/users/${user._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Usuário deletado com sucesso.");

    const checkUser = await User.findById(user._id);
    expect(checkUser?.isActive).toBe(false);
  });

  it("should return 404 when trying to delete a non-existent user", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/api/users/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado.");
  });
});
