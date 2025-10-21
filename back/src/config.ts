import "dotenv/config";

export const PORT = process.env.PORT || 3000;

export const MONGODB_URI =
  process.env.DB_URL || "mongodb://mongo:27017/caplink_db";

export const JWT_SECRET =
  process.env.JWT_SECRET || "Fb3vTTWNv4D3Y@bYXk$z6QV6Wc0Mhf";

export const SALT_ROUNDS = process.env.SALT_ROUNDS
  ? parseInt(process.env.SALT_ROUNDS)
  : 10;
