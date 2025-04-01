import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import path from "path";

const app = express();
const port = process.env.PORT || 5000;

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manejo de errores simple
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).send('Error interno del servidor');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const startServer = async () => {
  const server = await registerRoutes(app);

  // Setup Vite en desarrollo
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`⚡ Servidor iniciado en http://0.0.0.0:${port}`);
  });
};

startServer().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});