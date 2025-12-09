import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";

// Rutas
import pickingRoutes from "./routes/picking.routes.js";
import despachoRoutes from "./routes/despacho.routes.js";
import recepcionRoutes from "./routes/recepcion.routes.js";
import recursosRoutes from "./routes/recursos.routes.js";
import integracionRoutes from "./routes/integracion.routes.js";
import automatizacionRoutes from "./routes/automatizacion.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js"; // 👈 NUEVO

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "✅ ERP Logística Backend - API REST",
    version: "1.0.0",
    endpoints: {
      picking: "/api/logistica/picking",
      despacho: "/api/logistica/despacho",
      recepcion: "/api/logistica/recepcion",
      recursos: "/api/logistica/recursos",
      integracion: "/api/logistica/integracion",
      automatizacion: "/api/logistica/automatizacion",
      auth: "/api/auth", // 👈 NUEVO
    },
  });
});

// Rutas de la API
app.use("/api/picking", pickingRoutes);
app.use("/api/despacho", despachoRoutes);
app.use("/api/recepcion", recepcionRoutes);
app.use("/api/recursos", recursosRoutes);
app.use("/api/integracion", integracionRoutes);
app.use("/api/automatizacion", automatizacionRoutes);
app.use("/api/auth", usuariosRoutes); // 👈 NUEVO

// Iniciar servidor
const startServer = async () => {
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error("❌ No se pudo conectar a la base de datos. Abortando...");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();

export default app;