// src/middlewares/authMiddleware.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RoleType } from '@prisma/client';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  console.log('🔐 AuthMiddleware: Vérification du token...');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log('❌ AuthMiddleware: Token manquant');
    res.status(401).json({ message: 'Token manquant' });
    return;
  }
  
  console.log('✅ AuthMiddleware: Token trouvé, vérification...');

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
  if (err) {
    console.log('❌ AuthMiddleware: Token invalide');
    res.status(403).json({ 
      message: 'Token invalide. Redirection vers la page d\'accueil dans 30 secondes...',
      redirect: '/',  // URL de la page d'accueil
      delay: 30000    // 30 secondes en millisecondes
    });
    return;
  }

    // Type guard to ensure decoded is an object with the expected properties
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded && 'role' in decoded) {
      console.log('✅ AuthMiddleware: Token valide, utilisateur authentifié');
      req.user = {
        id: decoded.id as string,
        email: decoded.email as string,
        role: decoded.role as RoleType
      };
      next();
      return;
    }

    console.log('❌ AuthMiddleware: Token malformé');
    res.status(403).json({ message: 'Token malformé' });
    return;
  });
}