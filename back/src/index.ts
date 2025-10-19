import app from "./app";
import connectDB from "./config/database";
import { PORT } from "./config";

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();
