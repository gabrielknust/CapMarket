import app from "./src/app";
import connectDB from "./src/config/database";
import { PORT } from "./config";

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();
