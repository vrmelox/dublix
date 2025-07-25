"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import des routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const meRoutes_1 = __importDefault(require("./routes/meRoutes"));
const equipmentRoutes_1 = __importDefault(require("./routes/equipmentRoutes"));
const interventionRoutes_1 = __importDefault(require("./routes/interventionRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes")); // 🔔 NOUVELLE ROUTE NOTIFICATIONS
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Configuration CORS plus permissive pour le développement
app.use((0, cors_1.default)({
    origin: ['https://bioqrsuivi.com', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware pour parser le JSON et les données de formulaire
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Fichiers statiques (photos, QR codes, etc.)
app.use('/uploads', express_1.default.static(path_1.default.resolve('public/uploads')));
app.use(express_1.default.static('public'));
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
app.use('/api/users', userRoutes_1.default);
app.use('/api/equipments', equipmentRoutes_1.default);
app.use('/api/interventions', interventionRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default); // 🔔 NOUVELLE ROUTE NOTIFICATIONS
app.use('/api', meRoutes_1.default);
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
app.use((error, req, res, next) => {
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
