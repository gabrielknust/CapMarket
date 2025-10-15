import express from "express";
import pino from "pino";
import pretty from "pino-pretty";
import pinoHttp = require("pino-http");
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";

const app = express();
const stream = pretty({
  colorize: true,
  translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
  ignore: "pid,hostname",
  sync: true,
});

const pinoLogger = pino(stream);

const loggerMiddleware = (pinoHttp as any)({
  logger: pinoLogger,
});

app.use(loggerMiddleware);

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

export default app;
