import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { RoleType, Prisma } from '@prisma/client';

// Types pour les requêtes
interface CreateUserRequest {
  nom: string;
  prenom: string;
  email?: string;
  motDePasse: string;
  role: RoleType;
  telephone?: string;
  adresse?: string;
}

interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  role?: RoleType;
  telephone?: string;
  adresse?: string;
  actif?: boolean;
}

interface GetUsersQuery {
  page?: string;
  limit?: string;
  role?: RoleType;
  search?: string;
  actif?: string;
}

// @desc    Récupérer tous les utilisateurs avec pagination et filtres
// @route   GET /api/users
// @access  Private (Admin/Supervisor)
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '10',
    role,
    search,
    actif
  }: GetUsersQuery = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 par page
  const skip = (pageNum - 1) * limitNum;

  // Construction des filtres
  const where: Prisma.UtilisateurWhereInput = {};

  if (role && Object.values(RoleType).includes(role)) {
    where.role = role;
  }

  if (actif !== undefined) {
    where.actif = actif === 'true';
  }

  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Récupération des utilisateurs avec pagination
  const [utilisateurs, total] = await Promise.all([
    prisma.utilisateur.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        telephone: true,
        photo: true,
        actif: true,
        dateCreation: true,
        dateModification: true
      },
      skip,
      take: limitNum,
      orderBy: { dateCreation: 'desc' }
    }),
    prisma.utilisateur.count({ where })
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    data: {
      utilisateurs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    }
  });
});

// @desc    Récupérer un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private (Admin/Supervisor)
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      adresse: true,
      photo: true,
      actif: true,
      dateCreation: true,
      dateModification: true,
      servicesResponsables: {
        select: { id: true, nom: true }
      },
      equipementsCreés: {
        select: { id: true, nom: true },
        take: 5,
        orderBy: { dateAjout: 'desc' }
      },
      _count: {
        select: {
          equipementsCreés: true,
          interventionsRealisées: true,
          interventionsSignalées: true,
          notifications: true,
          evenements: true,
          modificationsEnAttente: true,
          validationsModifications: true
        }
      }
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

// @desc    Créer un nouvel utilisateur
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const {
    nom,
    prenom,
    email,
    motDePasse,
    role,
    telephone,
    adresse
  }: CreateUserRequest = req.body;

  // Validation des champs requis
  if (!nom || !prenom || !motDePasse || !role) {
    throw createError('Les champs nom, prénom, mot de passe et rôle sont requis', 400);
  }

  // Validation du rôle
  if (!Object.values(RoleType).includes(role)) {
    throw createError('Rôle invalide', 400);
  }

  // Vérification de l'unicité de l'email si fourni
  if (email) {
    const utilisateurExistant = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (utilisateurExistant) {
      throw createError('Un utilisateur avec cet email existe déjà', 400);
    }
  }

  // Validation du mot de passe
  if (motDePasse.length < 6) {
    throw createError('Le mot de passe doit contenir au moins 6 caractères', 400);
  }

  // Hashage du mot de passe
  const motDePasseHash = await bcrypt.hash(
    motDePasse,
    parseInt(process.env.BCRYPT_ROUNDS || '12')
  );

  // Création de l'utilisateur
  const nouvelUtilisateur = await prisma.utilisateur.create({
    data: {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email ? email.toLowerCase().trim() : null,
      motDePasse: motDePasseHash,
      role,
      telephone: telephone?.trim() || null,
      adresse: adresse?.trim() || null,
      actif: true
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      adresse: true,
      actif: true,
      dateCreation: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès',
    data: { utilisateur: nouvelUtilisateur }
  });
});

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nom,
    prenom,
    email,
    role,
    telephone,
    adresse,
    actif
  }: UpdateUserRequest = req.body;

  // Vérifier que l'utilisateur existe
  const utilisateurExistant = await prisma.utilisateur.findUnique({
    where: { id }
  });

  if (!utilisateurExistant) {
    throw createError('Utilisateur non trouvé', 404);
  }

  // Vérifier l'unicité de l'email si modifié
  if (email && email.toLowerCase() !== utilisateurExistant.email?.toLowerCase()) {
    const emailExiste = await prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (emailExiste) {
      throw createError('Un utilisateur avec cet email existe déjà', 400);
    }
  }

  // Validation du rôle si fourni
  if (role && !Object.values(RoleType).includes(role)) {
    throw createError('Rôle invalide', 400);
  }

  // Préparation des données à mettre à jour
  const dataToUpdate: Prisma.UtilisateurUpdateInput = {
    dateModification: new Date()
  };

  if (nom !== undefined) dataToUpdate.nom = nom.trim();
  if (prenom !== undefined) dataToUpdate.prenom = prenom.trim();
  if (email !== undefined) dataToUpdate.email = email ? email.toLowerCase().trim() : null;
  if (role !== undefined) dataToUpdate.role = role;
  if (telephone !== undefined) dataToUpdate.telephone = telephone?.trim() || null;
  if (adresse !== undefined) dataToUpdate.adresse = adresse?.trim() || null;
  if (actif !== undefined) dataToUpdate.actif = actif;

  // Mise à jour de l'utilisateur
  const utilisateurMisAJour = await prisma.utilisateur.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      adresse: true,
      actif: true,
      dateModification: true
    }
  });

  res.status(200).json({
    success: true,
    message: 'Utilisateur mis à jour avec succès',
    data: { utilisateur: utilisateurMisAJour }
  });
});

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Vérifier que l'utilisateur existe
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          equipementsCreés: true,
          interventionsRealisées: true,
          interventionsSignalées: true,
          servicesResponsables: true,
          notifications: true,
          evenements: true,
          modificationsEnAttente: true
        }
      }
    }
  });

  if (!utilisateur) {
    throw createError('Utilisateur non trouvé', 404);
  }

  // Vérifier les dépendances avant suppression
  const { _count } = utilisateur;
  const hasDependencies = _count.equipementsCreés > 0 || 
                         _count.interventionsRealisées > 0 || 
                         _count.interventionsSignalées > 0 ||
                         _count.servicesResponsables > 0 ||
                         _count.notifications > 0 ||
                         _count.evenements > 0 ||
                         _count.modificationsEnAttente > 0;

  if (hasDependencies) {
    throw createError(
      'Impossible de supprimer cet utilisateur car il a des données associées. Désactivez-le plutôt.',
      400
    );
  }

  // Supprimer l'utilisateur
  await prisma.utilisateur.delete({
    where: { id }
  });

  res.status(200).json({
    success: true,
    message: 'Utilisateur supprimé avec succès'
  });
});

// @desc    Désactiver/Activer un utilisateur
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Admin only)
export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    select: { id: true, actif: true, nom: true, prenom: true }
  });

  if (!utilisateur) {
    throw createError('Utilisateur non trouvé', 404);
  }

  const utilisateurMisAJour = await prisma.utilisateur.update({
    where: { id },
    data: {
      actif: !utilisateur.actif,
      dateModification: new Date()
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      actif: true,
      dateModification: true
    }
  });

  const action = utilisateurMisAJour.actif ? 'activé' : 'désactivé';

  res.status(200).json({
    success: true,
    message: `Utilisateur ${action} avec succès`,
    data: { utilisateur: utilisateurMisAJour }
  });
});

// @desc    Changer le mot de passe d'un utilisateur
// @route   PATCH /api/users/:id/change-password
// @access  Private (Admin only)
export const changeUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nouveauMotDePasse }: { nouveauMotDePasse: string } = req.body;

  if (!nouveauMotDePasse) {
    throw createError('Le nouveau mot de passe est requis', 400);
  }

  if (nouveauMotDePasse.length < 6) {
    throw createError('Le mot de passe doit contenir au moins 6 caractères', 400);
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id },
    select: { id: true, nom: true, prenom: true }
  });

  if (!utilisateur) {
    throw createError('Utilisateur non trouvé', 404);
  }

  // Hashage du nouveau mot de passe
  const motDePasseHash = await bcrypt.hash(
    nouveauMotDePasse,
    parseInt(process.env.BCRYPT_ROUNDS || '12')
  );

  await prisma.utilisateur.update({
    where: { id },
    data: {
      motDePasse: motDePasseHash,
      dateModification: new Date()
    }
  });

  res.status(200).json({
    success: true,
    message: 'Mot de passe modifié avec succès'
  });
});

// @desc    Obtenir les statistiques des utilisateurs
// @route   GET /api/users/stats
// @access  Private (Admin/Supervisor)
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Promise.all([
    // Nombre total d'utilisateurs
    prisma.utilisateur.count(),
    
    // Utilisateurs actifs
    prisma.utilisateur.count({
      where: { actif: true }
    }),
    
    // Répartition par rôle
    prisma.utilisateur.groupBy({
      by: ['role'],
      _count: { role: true }
    }),
    
    // Utilisateurs créés ce mois
    prisma.utilisateur.count({
      where: {
        dateCreation: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),

    // Utilisateurs avec email
    prisma.utilisateur.count({
      where: {
        email: { not: null }
      }
    })
  ]);

  const [totalUtilisateurs, utilisateursActifs, repartitionRoles, nouveauxUtilisateurs, utilisateursAvecEmail] = stats;

  const repartitionRolesFormatee = repartitionRoles.reduce((acc, item) => {
    acc[item.role] = item._count.role;
    return acc;
  }, {} as Record<string, number>);

  res.status(200).json({
    success: true,
    data: {
      totalUtilisateurs,
      utilisateursActifs,
      utilisateursInactifs: totalUtilisateurs - utilisateursActifs,
      utilisateursAvecEmail,
      utilisateursSansEmail: totalUtilisateurs - utilisateursAvecEmail,
      repartitionRoles: repartitionRolesFormatee,
      nouveauxUtilisateurs
    }
  });
});

// @desc    Obtenir les utilisateurs d'un rôle spécifique
// @route   GET /api/users/by-role/:role
// @access  Private (Admin/Supervisor)
export const getUsersByRole = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.params;

  if (!Object.values(RoleType).includes(role as RoleType)) {
    throw createError('Rôle invalide', 400);
  }

  const utilisateurs = await prisma.utilisateur.findMany({
    where: { 
      role: role as RoleType,
      actif: true
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  res.status(200).json({
    success: true,
    data: { 
      utilisateurs,
      total: utilisateurs.length
    }
  });
});

// @desc    Rechercher des utilisateurs (auto-complete)
// @route   GET /api/users/search
// @access  Private
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = '10' } = req.query;

  if (!q || typeof q !== 'string') {
    throw createError('Paramètre de recherche requis', 400);
  }

  const limitNum = Math.min(20, Math.max(1, parseInt(limit as string)));

  const utilisateurs = await prisma.utilisateur.findMany({
    where: {
      actif: true,
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { prenom: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true
    },
    take: limitNum,
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  res.status(200).json({
    success: true,
    data: { utilisateurs }
  });
});