import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erreur interne du serveur';

  // Erreurs Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 400;
        message = 'Cette valeur existe déjà (contrainte d\'unicité violée)';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Enregistrement non trouvé';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Violation de contrainte de clé étrangère';
        break;
      case 'P2014':
        statusCode = 400;
        message = 'Relation requise manquante';
        break;
      default:
        statusCode = 400;
        message = 'Erreur de base de données';
    }
  }

  // Erreurs de validation Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Données invalides fournies';
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré';
  }

  // Log de l'erreur en environnement de développement
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Erreur:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      error: error
    })
  });
};

// Créateur d'erreurs personnalisées
export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Wrapper pour les fonctions async (évite try/catch répétitifs)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};