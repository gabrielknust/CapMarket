import express from "express";
import connectDB from "./config/database.ts";
import userRoutes from "./routes/user.routes.ts";
import productRoutes from "./routes/product.routes.ts";

const startServer = async () => {
  await connectDB();

  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);

  app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
  });
};

startServer();
