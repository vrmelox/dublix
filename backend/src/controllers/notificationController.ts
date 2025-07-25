// src/controllers/notificationController.ts
import { Request, Response } from 'express';
import { PrismaClient, StatutNotification, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

// Étendre Request pour inclure user (comme dans votre authMiddleware)
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: RoleType;
  };
}

// ========================
// RÉCUPÉRATION DES NOTIFICATIONS
// ========================

/**
 * GET /api/notifications
 * Récupérer toutes les notifications de l'utilisateur connecté
 */
export const getAllNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📧 Récupération des notifications...');
    
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    // Paramètres de pagination et filtres
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const statut = req.query.statut as StatutNotification;
    const sortBy = (req.query.sortBy as string) || 'dateCreation';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const skip = (page - 1) * limit;

    // Construction des filtres
    const where: any = {
      utilisateurId: userId,
    };

    if (type) {
      where.typeNotification = type;
    }

    if (statut) {
      where.statut = statut;
    }

    // Récupération des notifications avec relations
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          equipement: {
            select: {
              nom: true,
              numeroSerie: true
            }
          },
          intervention: {
            select: {
              typeIntervention: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    // Transformation des données pour correspondre au format frontend
    const transformedNotifications = notifications.map(notif => ({
      id: notif.id,
      utilisateurId: notif.utilisateurId,
      titre: notif.titre,
      message: notif.message,
      typeNotification: notif.typeNotification || 'SYSTEM',
      priorite: determinePriorite(notif.typeNotification, notif.message),
      lue: notif.statut === 'LUE',
      dateCreation: notif.dateCreation.toISOString(),
      dateModification: notif.dateLecture?.toISOString(),
      equipementId: notif.equipementId,
      interventionId: notif.interventionId,
      equipement: notif.equipement,
      intervention: notif.intervention
    }));

    const totalPages = Math.ceil(total / limit);

    console.log(`✅ ${notifications.length} notifications récupérées`);

    res.json({
      success: true,
      notifications: transformedNotifications,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit
      }
    });

  } catch (error) {
    console.error('💥 Erreur récupération notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Récupérer le nombre de notifications non lues
 */
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    const count = await prisma.notification.count({
      where: {
        utilisateurId: userId,
        statut: 'NON_LUE'
      }
    });

    res.json({
      success: true,
      count
    });

  } catch (error) {
    console.error('💥 Erreur compteur notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du comptage des notifications',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * GET /api/notifications/stats
 * Statistiques des notifications de l'utilisateur
 */
export const getNotificationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    const [total, nonLues, lues, parType] = await Promise.all([
      // Total des notifications
      prisma.notification.count({
        where: { utilisateurId: userId }
      }),
      // Non lues
      prisma.notification.count({
        where: { 
          utilisateurId: userId,
          statut: 'NON_LUE'
        }
      }),
      // Lues
      prisma.notification.count({
        where: { 
          utilisateurId: userId,
          statut: 'LUE'
        }
      }),
      // Par type
      prisma.notification.groupBy({
        by: ['typeNotification'],
        where: { utilisateurId: userId },
        _count: {
          id: true
        }
      })
    ]);

    const typeStats = parType.reduce((acc, item) => {
      acc[item.typeNotification || 'SYSTEM'] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      stats: {
        total,
        nonLues,
        lues,
        pourcentageLues: total > 0 ? Math.round((lues / total) * 100) : 0,
        parType: typeStats
      }
    });

  } catch (error) {
    console.error('💥 Erreur stats notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// ========================
// ACTIONS SUR LES NOTIFICATIONS
// ========================

/**
 * PUT /api/notifications/:id/read
 * Marquer une notification comme lue
 */
export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        utilisateurId: userId
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
      return;
    }

    // Marquer comme lue
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        statut: 'LUE',
        dateLecture: new Date()
      }
    });

    console.log(`✅ Notification ${id} marquée comme lue`);

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
      notification: updatedNotification
    });

  } catch (error) {
    console.error('💥 Erreur marquer comme lu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * PUT /api/notifications/mark-all-read
 * Marquer toutes les notifications comme lues
 */
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    const result = await prisma.notification.updateMany({
      where: {
        utilisateurId: userId,
        statut: 'NON_LUE'
      },
      data: {
        statut: 'LUE',
        dateLecture: new Date()
      }
    });

    console.log(`✅ ${result.count} notifications marquées comme lues`);

    res.json({
      success: true,
      message: `${result.count} notifications marquées comme lues`,
      count: result.count
    });

  } catch (error) {
    console.error('💥 Erreur marquer toutes comme lues:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * DELETE /api/notifications/:id
 * Supprimer une notification
 */
export const deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        utilisateurId: userId
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
      return;
    }

    await prisma.notification.delete({
      where: { id }
    });

    console.log(`✅ Notification ${id} supprimée`);

    res.json({
      success: true,
      message: 'Notification supprimée'
    });

  } catch (error) {
    console.error('💥 Erreur suppression notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

/**
 * GET /api/notifications/:id
 * Récupérer une notification spécifique
 */
export const getNotificationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
      return;
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        utilisateurId: userId
      },
      include: {
        equipement: {
          select: {
            nom: true,
            numeroSerie: true
          }
        },
        intervention: {
          select: {
            typeIntervention: true
          }
        }
      }
    });

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
      return;
    }

    res.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('💥 Erreur récupération notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// ========================
// FONCTIONS UTILITAIRES
// ========================

/**
 * Détermine la priorité d'une notification basée sur son type et message
 */
function determinePriorite(type: string | null, message: string): 'BASSE' | 'MOYENNE' | 'HAUTE' {
  const typeNotif = type || 'SYSTEM';
  const messageLower = message.toLowerCase();

  // Priorité haute pour les pannes et urgences
  if (typeNotif === 'SIGNALEMENT' || messageLower.includes('panne') || messageLower.includes('urgent')) {
    return 'HAUTE';
  }

  // Priorité moyenne pour maintenance et validations
  if (typeNotif === 'MAINTENANCE' || typeNotif === 'VALIDATION' || typeNotif === 'INTERVENTION') {
    return 'MOYENNE';
  }

  // Priorité basse pour le reste
  return 'BASSE';
}
