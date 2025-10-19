import mongoose from "mongoose";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { MONGODB_URI } from "../src/config";
import User from "../src/models/user.model";
import Product from "../src/models/product.model";
import Cart from "../src/models/cart.model";
import Favorite from "../src/models/favorite.model";

const API_URL = "http://localhost:3126";

const seedDatabase = async () => {
  try {
    const mongoUri = MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI não encontrada no .env");
    }
    await mongoose.connect(mongoUri);
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Favorite.deleteMany({});
    const cliente = await User.create({
      name: "Cliente Teste",
      email: "cliente@teste.com",
      password: "senha123",
      role: "Cliente",
    });

    const vendedor1 = await User.create({
      name: "Vendedor Loja de Eletrônicos",
      email: "vendedor1@teste.com",
      password: "senha123",
      role: "Vendedor",
    });

    const vendedor2 = await User.create({
      name: "Vendedor Loja de Cozinha",
      email: "vendedor2@teste.com",
      password: "senha123",
      role: "Vendedor",
    });

    const loginAndUpload = async (
      email: string,
      password: string,
      csvFileName: string,
    ) => {
      const loginResponse = await axios.post(`${API_URL}/api/login/`, {
        email,
        password,
      });
      const token = loginResponse.data.token;
      const form = new FormData();
      const csvPath = path.join(__dirname, "data", csvFileName);
      form.append("products-csv", fs.createReadStream(csvPath));

      const uploadResponse = await axios.post(
        `${API_URL}/api/products/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        },
      );
    };

    await loginAndUpload(
      "vendedor1@teste.com",
      "senha123",
      "produtos_vendedor_1.csv",
    );
    await loginAndUpload(
      "vendedor2@teste.com",
      "senha123",
      "produtos_vendedor_2.csv",
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data || error.message);
    } else {
      console.error("Ocorreu um erro inesperado:", error);
    }
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
