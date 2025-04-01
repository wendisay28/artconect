import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = parseInt(process.env.PORT || "5000");
    const host = '0.0.0.0';

    try {
      await new Promise((resolve, reject) => {
        server.listen(port, host)
          .once('listening', () => {
            log(`🚀 Server running at http://${host}:${port}`);
            resolve(true);
          })
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              log(`Puerto ${port} ocupado, intentando en puerto ${port + 1}`);
              server.listen(port + 1, host)
                .once('listening', () => {
                  log(`🚀 Servidor ejecutándose en puerto ${port + 1}`);
                  resolve(true);
                })
                .once('error', reject);
            } else {
              reject(err);
            }
          });
      });
    } catch (err) {
      console.error('Error fatal al iniciar el servidor:', err);
      process.exit(1);
    }

  } catch (err) {
    console.error('Fatal server error:', err);
    process.exit(1);
  }
})();