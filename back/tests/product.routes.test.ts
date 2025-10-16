import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User from "../src/models/user.model";
import Product from "../src/models/product.model";

let mongoServer: MongoMemoryServer;

describe("Product Routes API", () => {
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
    await Product.deleteMany({});
  });

  function sellerFactory(overrides = {}) {
    return {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "Vendedor",
      ...overrides,
    };
  }

  function productFactory(overrides = {}) {
    return {
      name: "Test Product",
      price: 100,
      description: "This is a test product",
      urlImage: "http://example.com/image.jpg",
      ...overrides,
    };
  }

  describe("POST /api/products", () => {
    it("should return 201 and create a new product and return it", async () => {
      const user = await User.create(sellerFactory());
      const productData = productFactory({ seller: user._id });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.name).toBe(productData.name);
      expect(response.body).toHaveProperty("seller");
      expect(response.body.seller).toEqual(user._id.toString());
    });

    it("should return 400 when creating a product without a name", async () => {
      const user = await User.create(sellerFactory());
      const productData = productFactory({ name: "", seller: user._id });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
      expect(response.body.errors).toHaveProperty(
        "name",
        "O nome do produto é obrigatório.",
      );
    });

    it("should return 400 when creating a product with a negative price", async () => {
      const user = await User.create(sellerFactory());
      const productData = productFactory({ price: -50, seller: user._id });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
      expect(response.body.errors).toHaveProperty(
        "price",
        "O preço não pode ser negativo.",
      );
    });

    it("should return 400 when creating a product without a description", async () => {
      const user = await User.create(sellerFactory());
      const productData = productFactory({ description: "", seller: user._id });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
      expect(response.body.errors).toHaveProperty(
        "description",
        "A descrição do produto é obrigatória.",
      );
    });

    it("should return 400 when creating a product without a URL image", async () => {
      const user = await User.create(sellerFactory());
      const productData = productFactory({ urlImage: "", seller: user._id });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
      expect(response.body.errors).toHaveProperty(
        "urlImage",
        "A URL da imagem é obrigatória.",
      );
    });

    it("should return 400 when creating a product without a seller", async () => {
      const productData = productFactory();

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Vendedor inválido ou não encontrado.",
      );
    });

    it("should return 400 when creating a product with an invalid seller", async () => {
      const user = await User.create(sellerFactory());
      const productData = productFactory({
        seller: new mongoose.Types.ObjectId(),
      });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Vendedor inválido ou não encontrado.",
      );
    });

    it("should return 400 when creating a product with a non-vendor seller", async () => {
      const user = await User.create(sellerFactory({ role: "Cliente" }));
      const productData = productFactory({ seller: user._id });

      const response = await request(app)
        .post("/api/products")
        .send(productData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Vendedor inválido ou não encontrado.",
      );
    });
  });

  describe("GET /api/products", () => {
    it("should return 200 and an array of products", async () => {
      const user = await User.create(sellerFactory());
      await Product.create(productFactory({ seller: user._id }));
      await Product.create(
        productFactory({ name: "Test Product 2", seller: user._id }),
      );

      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty("name", "Test Product");
      expect(response.body[1]).toHaveProperty("name", "Test Product 2");
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return 200 and a single product by ID", async () => {
      const user = await User.create(sellerFactory({ role: "Cliente" }));
      const product = await Product.create(
        productFactory({ seller: user._id }),
      );

      const response = await request(app).get(`/api/products/${product._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", product._id.toString());
    });

    it("should return 404 when fetching a non-existent product by ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Produto não encontrado ou inativo.",
      );
    });

    it("should return 404 when fetching an inactive product by ID", async () => {
      const user = await User.create(sellerFactory({ role: "Cliente" }));
      const product = await Product.create(
        productFactory({ seller: user._id, isActive: false }),
      );

      const response = await request(app).get(`/api/products/${product._id}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Produto não encontrado ou inativo.",
      );
    });
  });

  describe("GET /api/products/seller/:sellerId", () => {
    it("should return an array of products with populated seller info", async () => {
      const user = await User.create(sellerFactory());
      await Product.create([
        productFactory({ seller: user._id }),
        productFactory({ name: "Test Product 2", seller: user._id }),
      ]);

      const response = await request(app).get(
        `/api/products/seller/${user._id}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      response.body.forEach((product: any) => {
        expect(product).toHaveProperty("seller");
        expect(product.seller).toHaveProperty("name", user.name);
        expect(product.seller).toHaveProperty("email", user.email);
      });
    });

    it("should return 404 when fetching products for a non-existent seller", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(
        `/api/products/seller/${nonExistentId}`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Vendedor inválido ou não encontrado.",
      );
    });

    it("should return 200 and an empty array when seller has no products", async () => {
      const user = await User.create(sellerFactory());

      const response = await request(app).get(
        `/api/products/seller/${user._id}`,
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("should return 200 and update a product by ID", async () => {
      const user = await User.create(sellerFactory());
      const product = await Product.create(
        productFactory({ seller: user._id }),
      );
      const updatedData = {
        name: "Updated Product",
        price: 150,
        description: "This product has been updated",
        urlImage: "http://example.com/updated-image.jpg",
      };

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", product._id.toString());
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.price).toBe(updatedData.price);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.urlImage).toBe(updatedData.urlImage);
    });

    it("should return 404 when updating a non-existent product by ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const updatedData = {
        name: "Updated Product",
        price: 150,
        description: "This product has been updated",
        urlImage: "http://example.com/updated-image.jpg",
      };

      const response = await request(app)
        .patch(`/api/products/${nonExistentId}`)
        .send(updatedData);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Produto não encontrado.",
      );
    });

    it("should return 400 when updating a product with invalid data", async () => {
      const user = await User.create(sellerFactory());
      const product = await Product.create(
        productFactory({ seller: user._id }),
      );
      const updatedData = {
        price: -150,
      };

      const response = await request(app)
        .patch(`/api/products/${product._id}`)
        .send(updatedData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Erro de validação.");
      expect(response.body.errors).toHaveProperty(
        "price",
        "O preço não pode ser negativo.",
      );
    });

    it("should return 200 with same product while updating a product with no data", async () => {
      const user = await User.create(sellerFactory());
      const product = await Product.create(
        productFactory({ seller: user._id }),
      );

      const response = await request(app).patch(`/api/products/${product._id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("_id", product._id.toString());
      expect(response.body.name).toBe(product.name);
      expect(response.body.price).toBe(product.price);
      expect(response.body.description).toBe(product.description);
      expect(response.body.urlImage).toBe(product.urlImage);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should return 200 and delete a product by ID", async () => {
      const user = await User.create(sellerFactory());
      const product = await Product.create(
        productFactory({ seller: user._id }),
      );

      const response = await request(app).delete(
        `/api/products/${product._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Produto desativado com sucesso.",
      );
      expect(response.body.product).toHaveProperty("isActive", false);
    });

    it("should return 404 when deleting a non-existent product by ID", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(
        `/api/products/${nonExistentId}`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "message",
        "Produto não encontrado.",
      );
    });
  });
});
