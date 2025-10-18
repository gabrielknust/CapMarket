import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User from "../src/models/user.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../src/models/user.model";
import Product from "../src/models/product.model";

let mongoServer: MongoMemoryServer;

describe("Cart Routes API", () => {
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
  function productFactory(overrides = {}) {
    return {
      name: "Test Product",
      price: 100,
      description: "This is a test product",
      isActive: true,
      urlImage: "http://example.com/image.jpg",
      ...overrides,
    };
  }

  async function authClient(overrides: Record<string, any> = {}) {
    const client: IUser = await User.create(
      clientFactory({ email: "auth@example.com", ...overrides }),
    );
    const payload = { id: client._id.toString(), papel: client.role };
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token, userId: client._id.toString() };
  }

  let token: string;
  let userId: string;

  beforeEach(async () => {
    ({ token, userId } = await authClient());
  });
  describe("POST /api/cart", () => {
    it("should add item to cart", async () => {
      const product = await Product.create(productFactory({ seller: userId }));
      const response = await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].product).toEqual(product._id.toString());
      expect(response.body.items[0].quantity).toBe(2);
    });
    it("Should not add item to cart with invalid product", async () => {
      const response = await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: new mongoose.Types.ObjectId().toString(),
          quantity: 2,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Produto não encontrado.",
      );
    });
    it("should return 401 if no token provided", async () => {
      const response = await request(app).post("/api/cart/").send({
        productId: new mongoose.Types.ObjectId().toString(),
        quantity: 2,
      });

      expect(response.status).toBe(401);
    });
    it("should return 200 and updated cart when adding product that is already in cart", async () => {
      const product = await Product.create(productFactory({ seller: userId }));
      await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 2,
        });

      const response = await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].product).toEqual(product._id.toString());
      expect(response.body.items[0].quantity).toBe(5);
    });
    it("should return 400 for invalid quantity", async () => {
      const product = await Product.create(productFactory({ seller: userId }));
      const response = await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
    });
    it("should return 200 and decrease the quantity of product in cart", async () => {
      const product = await Product.create(productFactory({ seller: userId }));
      await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 5,
        });

      const response = await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: -2,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].product).toEqual(product._id.toString());
      expect(response.body.items[0].quantity).toBe(3);
    });
    it("should return 400 when decreasing quantity below zero", async () => {
      const product = await Product.create(productFactory({ seller: userId }));
      await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 2,
        });

      const response = await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: -3,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
    });
  });
  describe("GET /api/cart", () => {
    it("should get cart by user ID", async () => {
      const response = await request(app)
        .get("/api/cart/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app).get("/api/cart/");

      expect(response.status).toBe(401);
    });
  });
  describe("DELETE /api/cart/:productId", () => {
    it("should remove product from cart", async () => {
      const product = await Product.create(productFactory({ seller: userId }));
      await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 2,
        });

      const response = await request(app)
        .delete(`/api/cart/${product._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items.length).toBe(0);
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app).delete(
        `/api/cart/${new mongoose.Types.ObjectId()}`,
      );

      expect(response.status).toBe(401);
    });

    it("should return 400 if product not in cart", async () => {
      const response = await request(app)
        .delete(`/api/cart/${new mongoose.Types.ObjectId()}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Produto não encontrado no carrinho.",
      );
    });
  });

  describe("DELETE /api/cart", () => {
    it("should clear the cart", async () => {
      const product1 = await Product.create(productFactory({ seller: userId }));
      const product2 = await Product.create(productFactory({ seller: userId }));
      await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product1._id,
          quantity: 2,
        });
      await request(app)
        .post("/api/cart/")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: product2._id,
          quantity: 3,
        });

      const response = await request(app)
        .delete("/api/cart/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("items");
      expect(response.body.items.length).toBe(0);
    });
    it("should return 401 if no token provided", async () => {
      const response = await request(app).delete("/api/cart/");

      expect(response.status).toBe(401);
    });
  });
});
