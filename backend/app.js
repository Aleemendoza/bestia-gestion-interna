const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const ventasRoutes = require('./routes/ventas');
const productosRoutes = require('./routes/productos');
const gastosRoutes = require('./routes/gastos');
const personalRoutes = require('./routes/personal');
const reportesRoutes = require('./routes/reportes');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES DE SEGURIDAD
// ========================================

// Helmet para headers de seguridad
app.use(helmet());

// CORS configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana por IP
  message: 'Demasiadas solicitudes desde esta IP'
});
app.use(limiter);

// ========================================
// MIDDLEWARES GENERALES
// ========================================

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// RUTAS DE LA API
// ========================================

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'La Bestia del Bajón API funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas principales
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/reportes', reportesRoutes);

// ========================================
// MANEJO DE ERRORES
// ========================================

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error en la aplicación:', error);

  const status = error.status || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(status).json({
    error: true,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ========================================
// INICIO DEL SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(`🥪 La Bestia del Bajón API corriendo en puerto ${PORT}`);
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}/health`);
});

module.exports = app;