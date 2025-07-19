import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { RoleType } from '@prisma/client';

interface AuthRequest {
  email: string;
  motDePasse: string;
}

interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: RoleType;
  telephone?: string;
  adresse?: string;
}

// Génération de tokens JWT
const generateTokens = (userId: string, email: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, motDePasse }: AuthRequest = req.body;

  // Validation des champs requis
  if (!email || !motDePasse) {
    throw createError('Email et mot de passe requis', 400);
  }

  // Recherche de l'utilisateur par email
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      motDePasse: true,
      actif: true,
      photo: true,
      telephone: true,
      dateCreation: true
    }
  });

  // Vérification de l'existence et du statut de l'utilisateur
  if (!utilisateur || !utilisateur.actif) {
    throw createError('Identifiants invalides', 401);
  }

  // Vérification du mot de passe
  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!motDePasseValide) {
    throw createError('Identifiants invalides', 401);
  }

  // Génération des tokens
  const { accessToken, refreshToken } = generateTokens(
    utilisateur.id, 
    utilisateur.email!, 
    utilisateur.role
  );

  // Retour de la réponse (sans le mot de passe)
  const { motDePasse: _, ...utilisateurSansMotDePasse } = utilisateur;

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: {
      utilisateur: utilisateurSansMotDePasse,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public (mais peut être restreint selon vos besoins)
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { 
    nom, 
    prenom, 
    email, 
    motDePasse, 
    role,
    telephone,
    adresse 
  }: RegisterRequest = req.body;

  // Validation des champs requis
  if (!nom || !prenom || !email || !motDePasse || !role) {
    throw createError('Nom, prénom, email, mot de passe et rôle requis', 400);
  }

  // Validation du rôle
  if (!Object.values(RoleType).includes(role)) {
    throw createError('Rôle invalide', 400);
  }

  // Vérification de l'unicité de l'email
  const utilisateurExistant = await prisma.utilisateur.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (utilisateurExistant) {
    throw createError('Un utilisateur avec cet email existe déjà', 400);
  }

  // Hashage du mot de passe
  const motDePasseHash = await bcrypt.hash(motDePasse, parseInt(process.env.BCRYPT_ROUNDS || '12'));

  // Création de l'utilisateur
  const nouvelUtilisateur = await prisma.utilisateur.create({
    data: {
      nom,
      prenom,
      email: email.toLowerCase(),
      motDePasse: motDePasseHash,
      role,
      telephone,
      adresse
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      adresse: true,
      photo: true,
      dateCreation: true,
      actif: true
    }
  });

  // Génération des tokens
  const { accessToken, refreshToken } = generateTokens(
    nouvelUtilisateur.id, 
    nouvelUtilisateur.email!, 
    nouvelUtilisateur.role
  );

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: {
      utilisateur: nouvelUtilisateur,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
});

// @desc    Rafraîchissement du token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw createError('Refresh token requis', 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

    // Vérification que l'utilisateur existe toujours
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, actif: true }
    });

    if (!utilisateur || !utilisateur.actif) {
      throw createError('Utilisateur invalide', 401);
    }

    // Génération de nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      utilisateur.id,
      utilisateur.email!,
      utilisateur.role
    );

    res.status(200).json({
      success: true,
      message: 'Tokens rafraîchis avec succès',
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    throw createError('Refresh token invalide', 401);
  }
});

// @desc    Informations du profil utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      adresse: true,
      photo: true,
      dateCreation: true,
      dateModification: true,
      actif: true
    }
  });

  if (!utilisateur) {
    throw createError('Utilisateur non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    data: { utilisateur }
  });
});

// @desc    Mise à jour du profil utilisateur
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { nom, prenom, telephone, adresse } = req.body;

  const utilisateurMisAJour = await prisma.utilisateur.update({
    where: { id: req.user!.id },
    data: {
      ...(nom && { nom }),
      ...(prenom && { prenom }),
      ...(telephone !== undefined && { telephone }),
      ...(adresse !== undefined && { adresse })
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      adresse: true,
      photo: true,
      dateModification: true
    }
  });

  res.status(200).json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: { utilisateur: utilisateurMisAJour }
  });
});

// @desc    Changement de mot de passe
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { ancienMotDePasse, nouveauMotDePasse } = req.body;

  if (!ancienMotDePasse || !nouveauMotDePasse) {
    throw createError('Ancien et nouveau mot de passe requis', 400);
  }

  // Récupération de l'utilisateur avec le mot de passe
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id: req.user!.id },
    select: { id: true, motDePasse: true }
  });

  if (!utilisateur) {
    throw createError('Utilisateur non trouvé', 404);
  }

  // Vérification de l'ancien mot de passe
  const ancienMotDePasseValide = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
  if (!ancienMotDePasseValide) {
    throw createError('Ancien mot de passe incorrect', 400);
  }

  // Hashage du nouveau mot de passe
  const nouveauMotDePasseHash = await bcrypt.hash(
    nouveauMotDePasse, 
    parseInt(process.env.BCRYPT_ROUNDS || '12')
  );

  // Mise à jour du mot de passe
  await prisma.utilisateur.update({
    where: { id: req.user!.id },
    data: { motDePasse: nouveauMotDePasseHash }
  });

  res.status(200).json({
    success: true,
    message: 'Mot de passe changé avec succès'
  });
});

// @desc    Déconnexion (côté client principalement)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Dans un système JWT stateless, la déconnexion se fait côté client
  // On peut ajouter ici une liste noire de tokens si nécessaire
  
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});