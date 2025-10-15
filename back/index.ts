import app from "./src/app";
import connectDB from "./src/config/database";

const startServer = async () => {
  await connectDB();
  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
};

startServer();
