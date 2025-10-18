import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User from "../src/models/user.model";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../src/models/user.model";
import Product from "../src/models/product.model";
import Cart from "../src/models/cart.model";
import Order from "../src/models/order.model";

let mongoServer: MongoMemoryServer;
describe("Order Routes API", () => {
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

  describe("POST /order", () => {
    it("should create a new order from user's cart", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      await Cart.updateOne(
        { customer: userId },
        { items: [{ product, quantity: 2 }] },
      );
      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${token}`)
        .send({ shippingAddress: "123 Test St, Test City" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.customer).toBe(userId);
    });

    it("should return 400 if cart is empty", async () => {
      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${token}`)
        .send({ shippingAddress: "123 Test St, Test City" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Carrinho vazio ou não encontrado.");
    });

    it("should return 401 if user does not exist", async () => {
      const fakeUserId = new mongoose.Types.ObjectId().toString();
      const fakeToken = jwt.sign(
        { id: fakeUserId, papel: "Cliente" },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${fakeToken}`)
        .send({ shippingAddress: "123 Test St, Test City" });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Usuário não encontrado.");
    });

    it("should return 400 if shipping address is missing", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      await Cart.updateOne(
        { customer: userId },
        { items: [{ product, quantity: 2 }] },
      );
      const response = await request(app)
        .post("/api/order")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Erro de validação.");
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(app)
        .post("/api/order")
        .send({ shippingAddress: "123 Test St, Test City" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /order/id", () => {
    it("should return a order", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      await Cart.updateOne(
        { customer: userId },
        { items: [{ product, quantity: 2 }] },
      );
      const order = await Order.create({
        customer: userId,
        products: [
          {
            productId: product,
            quantity: 2,
          },
        ],
        totalOrder: 200,
        status: "Pendente",
        address: "123 Test St, Test City",
      });

      const response = await request(app)
        .get(`/api/order/${order._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", order._id.toString());
      expect(response.body).toHaveProperty("customer._id", userId);
      expect(response.body).toHaveProperty("products");
      expect(response.body.totalOrder).toBe(200);
    });
    it("should return 404 if order not found", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/api/order/${fakeOrderId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Pedido não encontrado.");
    });

    it("should return 401 if no token is provided", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/order/${fakeOrderId}`);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /order/user", () => {
    it("should return 200 and a order for authenticated user", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      const order1 = await Order.create({
        customer: userId,
        products: [
          {
            productId: product,
            quantity: 1,
          },
        ],
        totalOrder: 100,
        status: "Pendente",
        address: "123 Test St, Test City",
      });

      const response = await request(app)
        .get("/api/order/user/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty("_id", order1._id.toString());
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(app).get("/api/order/user/");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /order/user/:userId", () => {
    it("should return 200 and orders for the specified userId", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      const order1 = await Order.create({
        customer: userId,
        products: [
          {
            productId: product,
            quantity: 1,
          },
        ],
        totalOrder: 100,
        status: "Pendente",
        address: "123 Test St, Test City",
      });

      const response = await request(app)
        .get(`/api/order/user/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty("_id", order1._id.toString());
    });

    it("should return 401 if no token is provided", async () => {
      const response = await request(app).get(`/api/order/user/${userId}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /order/status/:id", () => {
    it("should update the order status", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      const order = await Order.create({
        customer: userId,
        products: [
          {
            productId: product,
            quantity: 1,
          },
        ],
        totalOrder: 100,
        status: "Pendente",
        address: "123 Test St, Test City",
      });

      const response = await request(app)
        .put(`/api/order/status/${order._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "Pago" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", order._id.toString());
      expect(response.body.status).toBe("Pago");
    });

    it("should return 404 if order not found", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/api/order/status/${fakeOrderId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "Pago" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Pedido não encontrado.");
    });

    it("should return 401 if no token is provided", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .put(`/api/order/status/${fakeOrderId}`)
        .send({ status: "Pago" });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /order/:id", () => {
    it("should delete the order", async () => {
      const product = (await Product.create(productFactory({ seller: userId })))
        ._id;
      const order = await Order.create({
        customer: userId,
        products: [
          {
            productId: product,
            quantity: 1,
          },
        ],
        totalOrder: 100,
        status: "Pendente",
        address: "123 Test St, Test City",
      });

      const response = await request(app)
        .delete(`/api/order/${order._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Pedido deletado com sucesso.");
      expect(response.body.order).toHaveProperty("_id", order._id.toString());
      expect(response.body.order.isDeleted).toBe(true);
    });

    it("should return 404 if order not found", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/order/${fakeOrderId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Pedido não encontrado.");
    });

    it("should return 401 if no token is provided", async () => {
      const fakeOrderId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).delete(`/api/order/${fakeOrderId}`);

      expect(response.status).toBe(401);
    });
  });
});
