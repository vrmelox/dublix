"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateToken(req, res, next) {
    console.log('🔐 AuthMiddleware: Vérification du token...');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        console.log('❌ AuthMiddleware: Token manquant');
        res.status(401).json({ message: 'Token manquant' });
        return;
    }
    console.log('✅ AuthMiddleware: Token trouvé, vérification...');
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('❌ AuthMiddleware: Token invalide');
            res.status(403).json({
                message: 'Token invalide. Redirection vers la page d\'accueil dans 30 secondes...',
                redirect: '/', // URL de la page d'accueil
                delay: 30000 // 30 secondes en millisecondes
            });
            return;
        }
        // Type guard to ensure decoded is an object with the expected properties
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded && 'role' in decoded) {
            console.log('✅ AuthMiddleware: Token valide, utilisateur authentifié');
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
            next();
            return;
        }
        console.log('❌ AuthMiddleware: Token malformé');
        res.status(403).json({ message: 'Token malformé' });
        return;
    });
}
