// src/app.ts

import express, { Request, Response, NextFunction } from "express";
import pino from "pino";
import pretty from "pino-pretty";
import pinoHttp = require("pino-http");
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };
  next();
});

const stream = pretty({
  colorize: true,
  translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
  ignore: "pid,hostname",
  sync: true,
});

const pinoLogger = pino(stream);

const loggerMiddleware = (pinoHttp as any)({
  logger: pinoLogger,
  customProps: function (req: Request, res: Response) {
    return {
      responseBody: res.locals.responseBody,
    };
  },
});

if (process.env.NODE_ENV !== "test") {
  app.use(loggerMiddleware);
}

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

export default app;
