import express, { Request, Response, NextFunction } from "express";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import loginRoutes from "./routes/login.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import favoriteRoutes from "./routes/favorite.routes";
import dashboardRoutes from "./routes/dashboard.routes";
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

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/login", loginRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/dashboard", dashboardRoutes);

export default app;
