import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('client/public'));

// Logging middleware simplificado
app.use((req, res, next) => {
  log(`${req.method} ${req.path}`);
  next();
});

// Manejo específico para favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Manejo de errores
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({ message: "Internal Server Error" });
    });

    // Setup de Vite o servir estáticos
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Configuración del puerto
    const port = 5000;
    server.listen(port, '0.0.0.0', () => {
      log(`🚀 Servidor ejecutándose en http://0.0.0.0:${port}`);
    });

  } catch (err) {
    console.error('Error fatal:', err);
    process.exit(1);
  }
})();