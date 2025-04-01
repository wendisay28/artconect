
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

const mount = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("No se encontró el elemento root");
    return;
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
};

// Intentar montar inmediatamente
mount();

// Recargar si hay errores de conexión
window.addEventListener('load', () => {
  if (!document.getElementById("root")?.children.length) {
    console.log("Reintentando montar la aplicación...");
    mount();
  }
});
