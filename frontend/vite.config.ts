import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@services": path.resolve(__dirname, "src/services"),
      "@types": path.resolve(__dirname, "src/types")
    }
  },
  server: {
    host: true, // listen on 0.0.0.0
    allowedHosts: ["frontend", "nginx", "localhost", "127.0.0.1"],
    port: 5173,
    proxy: {
      // Proxy to bypass CORS for BKG GeoJSON endpoints in dev
      "/geo": {
        target: "https://sg.geodatenzentrum.de",
        changeOrigin: true,
        secure: true
      },
      // Proxy API to FastAPI backend in dev
      "/api": {
        // When running in Docker Compose, the backend is reachable by service name
        target: "http://backend:8000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});


