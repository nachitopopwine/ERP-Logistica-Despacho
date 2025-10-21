import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// Importar rutas
import pickingRoutes from './routes/picking.routes.js';
import despachoRoutes from './routes/despacho.routes.js';
import recepcionRoutes from './routes/recepcion.routes.js';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ========== MIDDLEWARES ==========
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== RUTAS ==========

// Ruta principal
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚚 API - Módulo de Logística/Despacho',
    version: '1.0.0',
    endpoints: {
      picking: '/api/picking',
      despacho: '/api/despacho',
      recepcion: '/api/recepcion'
    }
  });
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  const dbStatus = await testConnection();
  res.status(dbStatus ? 200 : 500).json({
    status: dbStatus ? 'OK' : 'ERROR',
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api/picking', pickingRoutes);
app.use('/api/despacho', despachoRoutes);
app.use('/api/recepcion', recepcionRoutes);

// Ruta 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// ========== INICIAR SERVIDOR ==========
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📦 Endpoints disponibles:`);
      console.log(`   - GET  /api/picking`);
      console.log(`   - POST /api/picking`);
      console.log(`   - GET  /api/despacho`);
      console.log(`   - POST /api/despacho`);
      console.log(`   - GET  /api/recepcion`);
      console.log(`   - POST /api/recepcion\n`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
