import express from "express";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";
import path from "path";

const app = express();
const port = 5000;

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
  try {
    const server = await registerRoutes(app);

    // Setup Vite en desarrollo
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    }

    server.listen(port, '0.0.0.0', () => {
      console.log(`⚡ Servidor iniciado en http://0.0.0.0:${port}`);
      console.log('Ambiente:', process.env.NODE_ENV);
    });

    server.on('error', (error: any) => {
      console.error('Error del servidor:', error);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});