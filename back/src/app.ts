import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import loginRoutes from "./routes/login.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import favoriteRoutes from "./routes/favorite.routes";
import morgan from "morgan";
import cors from "cors";

const app = express();

app.use(cors());

app.use((req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };
  next();
});

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/favorites", favoriteRoutes);

export default app;
