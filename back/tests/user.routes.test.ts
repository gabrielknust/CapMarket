import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User, { IUser } from "../src/models/user.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../src/config";
import Product from "../src/models/product.model";

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

  function clientFactory(overrides = {}) {
    return {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "Cliente",
      ...overrides,
    };
  }

  async function authClient(overrides = { email: "auth@example.com" }) {
    const client: IUser = await User.create(clientFactory(overrides));
    const payload = { id: client._id.toString(), papel: client.role };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token, userId: client._id.toString() };
  }

  describe("No Auth required routes", () => {
    describe("POST /api/users", () => {
      it("should return 201 and create a new user and return it", async () => {
        const userData = clientFactory();

        const response = await request(app).post("/api/users").send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.email).toBe(userData.email);
        expect(response.body).not.toHaveProperty("password");
      });

      it("should return 400 if email already exists", async () => {
        await User.create(clientFactory());

        const response = await request(app)
          .post("/api/users")
          .send(clientFactory());

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Este email já está em uso.");
      });

      it("should return 400 if name is missing", async () => {
        const response = await request(app)
          .post("/api/users")
          .send(clientFactory({ name: "" }));

        expect(response.status).toBe(400);
        expect(response.body.errors.name).toBe("O nome é obrigatório.");
      });

      it("should return 400 if email is missing", async () => {
        const response = await request(app)
          .post("/api/users")
          .send(clientFactory({ email: "" }));

        expect(response.status).toBe(400);
        expect(response.body.errors.email).toBe("O email é obrigatório.");
      });

      it("should return 400 if password is missing", async () => {
        const response = await request(app)
          .post("/api/users")
          .send(clientFactory({ password: "" }));

        expect(response.status).toBe(400);
        expect(response.body.errors.password).toBe("A senha é obrigatória.");
      });
    });
  });
  describe("Auth required routes", () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      ({ token, userId } = await authClient());
    });
    describe("GET /api/users", () => {
      it("should return a list of all users", async () => {
        await User.create(clientFactory());
        await User.create(clientFactory({ email: "two@example.com" }));

        const response = await request(app)
          .get("/api/users")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(3);
        expect(response.body[1].email).toBe("test@example.com");
        expect(response.body[2].email).toBe("two@example.com");
      });
    });

    describe("GET /api/users/:id", () => {
      it("should return a single user if ID is valid", async () => {
        const user = await User.create(clientFactory());

        const response = await request(app)
          .get(`/api/users/${user._id}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe(user.email);
      });

      it("should return 404 if ID is not found", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/users/${nonExistentId}`)
          .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado.");
      });
    });

    describe("PATCH /api/users/:id", () => {
      it("should return 200 when updating a user's name successfully", async () => {
        const user = await User.create(clientFactory());

        const updates = { name: "New Name" };
        const response = await request(app)
          .patch(`/api/users/${user._id}`)
          .send(updates)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("New Name");
      });

      it("should return 200 when updating a user's email successfully", async () => {
        const user = await User.create(clientFactory());

        const updates = { email: "new@example.com" };
        const response = await request(app)
          .patch(`/api/users/${user._id}`)
          .send(updates)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.email).toBe("new@example.com");
        expect(response.body.name).toBe("Test User");
      });

      it("should return 200 when updating a user's password successfully", async () => {
        const user = await User.create(clientFactory());

        const updates = {
          currentPassword: "password123",
          newPassword: "newPass",
        };
        const response = await request(app)
          .patch(`/api/users/password/${user._id}`)
          .send(updates)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.password).not.toBe("newPass");
      });

      it("should return 404 when trying to update a non-existent user", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const updates = { name: "New Name" };
        const response = await request(app)
          .patch(`/api/users/${nonExistentId}`)
          .send(updates)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado.");
      });
    });

    describe("DELETE /api/users/:id", () => {
      it("should delete a user successfully", async () => {
        const user = await User.create(clientFactory());

        const response = await request(app)
          .delete(`/api/users/${user._id}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Usuário deletado com sucesso.");

        const checkUser = await User.findById(user._id);
        expect(checkUser?.isActive).toBe(false);
      });

      it("should return 404 when trying to delete a non-existent user", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .delete(`/api/users/${nonExistentId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Usuário não encontrado.");
      });

      it("should deactivate products when a 'Vendedor' user is deleted", async () => {
        const seller = await User.create(
          clientFactory({ role: "Vendedor", email: "seller@example.com" }),
        );
        const product = await Product.create({
          name: "Test Product",
          price: 100,
          description: "This is a test product",
          urlImage: "http://example.com/image.jpg",
          seller: seller._id,
          isActive: true,
        });

        const response = await request(app)
          .delete(`/api/users/${seller._id}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Usuário deletado com sucesso.");

        const updatedProduct = await Product.findById(product._id);
        expect(updatedProduct?.isActive).toBe(false);
      });
    });
  });
});
