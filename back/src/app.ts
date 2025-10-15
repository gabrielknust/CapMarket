import express from "express";
import pinoHttp from "pino-http";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";

const app = express();

const logger = (pinoHttp as any)({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

app.use(logger);

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

export default app;
