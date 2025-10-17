import "dotenv/config";

export const PORT = process.env.PORT || 3000;

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/meubanco";

export const JWT_SECRET =
  process.env.JWT_SECRET || "Fb3vTTWNv4D3Y@bYXk$z6QV6Wc0Mhf";

export const SALT_ROUNDS = process.env.SALT_ROUNDS
  ? parseInt(process.env.SALT_ROUNDS)
  : 10;
