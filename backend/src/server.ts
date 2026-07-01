import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import des routes
import userRoutes from './routes/userRoutes';
import meRoutes from './routes/meRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import interventionRoutes from './routes/interventionRoutes';
import notificationRoutes from './routes/notificationRoutes'; // 🔔 NOUVELLE ROUTE NOTIFICATIONS

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration CORS plus permissive pour le développement
app.use(cors({
  origin: ['https://bioqrsuivi.com', 'http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Fichiers statiques (photos, QR codes, etc.)
app.use('/uploads', express.static(path.resolve('public/uploads')));
app.use(express.static('public'));

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.url.includes('/api/equipments')) {
    console.log('📋 Headers:', req.headers);
    console.log('📦 Body keys:', req.body ? Object.keys(req.body) : 'Body est null/undefined (normal pour multipart)');
  }
  next();
});

// Routes principales
app.use('/api/users', userRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/notifications', notificationRoutes); // 🔔 NOUVELLE ROUTE NOTIFICATIONS
app.use('/api', meRoutes);

// Route de test
app.get('/', (_req, res) => {
  res.json({
    message: '✅ API BioQr-Suivi en marche',
    endpoints: {
      equipments: '/api/equipments',
      users: '/api/users',
      interventions: '/api/interventions',
      notifications: '/api/notifications', // 🔔 NOUVEAU ENDPOINT
      me: '/api/me'
    }
  });
});

// Route de test pour les équipements
app.get('/test', (_req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Gestionnaire d'erreurs global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Erreur globale:', error);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: error.message
  });
});

// Gestionnaire pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📡 Routes disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/api/equipments`);
  console.log(`   POST http://localhost:${PORT}/api/equipments`);
  console.log(`   GET  http://localhost:${PORT}/api/interventions`);
  console.log(`   POST http://localhost:${PORT}/api/interventions`);
  console.log(`   GET  http://localhost:${PORT}/api/notifications`); // 🔔 NOUVEAU
  console.log(`   GET  http://localhost:${PORT}/api/notifications/unread-count`); // 🔔 NOUVEAU
  console.log(`   PUT  http://localhost:${PORT}/api/notifications/:id/read`); // 🔔 NOUVEAU
  console.log(`   GET  http://localhost:${PORT}/api/users`);
});
