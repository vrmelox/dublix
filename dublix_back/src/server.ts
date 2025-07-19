import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import des routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes'
// import userRoutes from './routes/user.routes';
// import equipmentRoutes from './routes/equipment.routes';
// import notificationRoutes from './routes/notification.routes';

// Import des middlewares
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Configuration CORS pour Next.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares globaux
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Test de connexion à la base
app.get('/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
// app.use('/api/equipment', authMiddleware, equipmentRoutes);
// app.use('/api/notifications', authMiddleware, notificationRoutes);

// Middleware de gestion d'erreurs (toujours en dernier)
app.use(errorHandler);

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };