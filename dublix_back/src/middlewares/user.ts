import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { createError } from './errorHandler';
import { RoleType } from '@prisma/client';

// Interface pour le token JWT
interface JwtPayload {
  id: string;
  role: RoleType;
  iat: number;
  exp: number;
}

// @desc    Middleware d'authentification - Vérifier le token JWT
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Récupérer le token depuis le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Vérifier si le token existe
    if (!token) {
      throw createError('Token d\'authentification manquant', 401);
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Récupérer l'utilisateur depuis la base de données
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true
      }
    });

    if (!utilisateur) {
      throw createError('Utilisateur non trouvé', 401);
    }

    // Vérifier si l'utilisateur est actif
    if (!utilisateur.actif) {
      throw createError('Compte utilisateur désactivé', 401);
    }

    // Ajouter l'utilisateur à la requête
    req.user = utilisateur;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Token invalide', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expiré', 401));
    } else {
      next(error);
    }
  }
};

// @desc    Middleware d'autorisation - Vérifier les rôles autorisés
export const authorize = (...roles: RoleType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Utilisateur non authentifié', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Accès non autorisé pour ce rôle', 403));
    }

    next();
  };
};

// @desc    Middleware spécifique - Autoriser seulement les administrateurs
export const adminOnly = authorize(RoleType.ADMINISTRATEUR);

// @desc    Middleware spécifique - Autoriser administrateurs et superviseurs (techniciens avec certains droits)
export const adminOrSupervisor = authorize(RoleType.ADMINISTRATEUR, RoleType.TECHNICIEN);

// @desc    Middleware pour autoriser l'utilisateur à accéder à ses propres données
export const authorizeOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(createError('Utilisateur non authentifié', 401));
  }

  const { id } = req.params;

  // L'administrateur peut accéder à tout
  if (req.user.role === RoleType.ADMINISTRATEUR) {
    return next();
  }

  // L'utilisateur peut accéder à ses propres données
  if (req.user.id === id) {
    return next();
  }

  return next(createError('Accès non autorisé à ces données', 403));
};

// @desc    Middleware pour vérifier les permissions sur un équipement
export const checkEquipmentPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(createError('Utilisateur non authentifié', 401));
    }

    const equipementId = req.params.equipementId || req.body.equipementId;

    if (!equipementId) {
      return next(createError('ID de l\'équipement manquant', 400));
    }

    // L'administrateur a tous les droits
    if (req.user.role === RoleType.ADMINISTRATEUR) {
      return next();
    }

    // Récupérer l'équipement avec son service
    const equipement = await prisma.equipement.findUnique({
      where: { id: equipementId },
      include: {
        service: {
          include: {
            responsable: true
          }
        }
      }
    });

    if (!equipement) {
      return next(createError('Équipement non trouvé', 404));
    }

    // Le technicien peut accéder aux équipements (lecture/modification selon le contexte)
    if (req.user.role === RoleType.TECHNICIEN) {
      return next();
    }

    // L'utilisateur peut seulement signaler des pannes sur les équipements de son service
    if (req.user.role === RoleType.UTILISATEUR) {
      if (equipement.service?.responsableId === req.user.id) {
        return next();
      }
      
      // Pour les signalements de panne, on peut être plus permissif
      if (req.method === 'POST' && req.path.includes('signalement')) {
        return next();
      }
    }

    return next(createError('Accès non autorisé à cet équipement', 403));
  } catch (error) {
    next(error);
  }
};

// @desc    Middleware pour logger les actions utilisateur (optionnel)
export const logUserAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      try {
        // Créer un événement de log (optionnel)
        await prisma.evenement.create({
          data: {
            utilisateurId: req.user.id,
            typeEvenement: 'MODIFICATION_EQUIPEMENT', // À adapter selon l'action
            titre: `Action: ${action}`,
            description: `${req.user.nom} ${req.user.prenom} a effectué: ${action}`,
            dateEvenement: new Date()
          }
        });
      } catch (error) {
        // Ne pas bloquer la requête si le log échoue
        console.error('Erreur lors du logging:', error);
      }
    }
    next();
  };
};

// @desc    Middleware pour vérifier le quota de requêtes (rate limiting basique)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.ip || 'anonymous';
    const now = Date.now();

    // Nettoyer les entrées expirées
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key];
      }
    });

    // Initialiser ou récupérer le compteur
    if (!rateLimitStore[userId] || rateLimitStore[userId].resetTime < now) {
      rateLimitStore[userId] = {
        count: 1,
        resetTime: now + windowMs
      };
    } else {
      rateLimitStore[userId].count++;
    }

    // Vérifier la limite
    if (rateLimitStore[userId].count > maxRequests) {
      const resetTime = Math.ceil((rateLimitStore[userId].resetTime - now) / 1000);
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime.toString()
      });
      return next(createError('Trop de requêtes, veuillez réessayer plus tard', 429));
    }

    // Ajouter les headers de rate limit
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - rateLimitStore[userId].count).toString(),
      'X-RateLimit-Reset': Math.ceil((rateLimitStore[userId].resetTime - now) / 1000).toString()
    });

    next();
  };
};

// @desc    Middleware de validation des permissions pour les modifications en attente
export const checkPendingModificationPermission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(createError('Utilisateur non authentifié', 401));
    }

    const modificationId = req.params.id;

    if (!modificationId) {
      return next(createError('ID de la modification manquant', 400));
    }

    const modification = await prisma.modificationEnAttente.findUnique({
      where: { id: modificationId },
      include: {
        technicien: true,
        equipement: true
      }
    });

    if (!modification) {
      return next(createError('Modification non trouvée', 404));
    }

    // L'administrateur peut tout faire
    if (req.user.role === RoleType.ADMINISTRATEUR) {
      return next();
    }

    // Le technicien peut seulement accéder à ses propres modifications
    if (req.user.role === RoleType.TECHNICIEN && modification.technicienId === req.user.id) {
      return next();
    }

    return next(createError('Accès non autorisé à cette modification', 403));
  } catch (error) {
    next(error);
  }
};