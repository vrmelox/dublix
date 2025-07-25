// src/services/notificationService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateNotificationParams {
  utilisateurId: string;
  titre: string;
  message: string;
  typeNotification?: 'INTERVENTION' | 'EQUIPEMENT' | 'SIGNALEMENT' | 'MAINTENANCE' | 'VALIDATION' | 'SYSTEM';
  equipementId?: string;
  interventionId?: string;
}

/**
 * Service pour créer des notifications automatiquement
 */
export class NotificationService {
  
  /**
   * Créer une notification
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          utilisateurId: params.utilisateurId,
          titre: params.titre,
          message: params.message,
          typeNotification: params.typeNotification || 'SYSTEM',
          equipementId: params.equipementId,
          interventionId: params.interventionId,
          statut: 'NON_LUE'
        }
      });

      console.log(`🔔 Notification créée: ${params.titre} pour utilisateur ${params.utilisateurId}`);
      return notification;
    } catch (error) {
      console.error('💥 Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Notifier un signalement de panne
   */
  static async notifyBreakdownReport(
    equipementId: string, 
    equipmentName: string, 
    reportedBy: string,
    description: string
  ) {
    try {
      // Récupérer les administrateurs et techniciens
      const usersToNotify = await prisma.utilisateur.findMany({
        where: {
          role: {
            in: ['ADMINISTRATEUR', 'TECHNICIEN']
          },
          actif: true
        }
      });

      // Créer une notification pour chaque utilisateur
      const notifications = await Promise.all(
        usersToNotify.map(user => 
          this.createNotification({
            utilisateurId: user.id,
            titre: `🔴 Panne signalée - ${equipmentName}`,
            message: `Une panne a été signalée sur l'équipement ${equipmentName}. Description: ${description}`,
            typeNotification: 'SIGNALEMENT',
            equipementId
          })
        )
      );

      console.log(`🔔 ${notifications.length} notifications de panne envoyées`);
      return notifications;
    } catch (error) {
      console.error('💥 Erreur notification panne:', error);
      throw error;
    }
  }

  /**
   * Notifier une intervention programmée
   */
  static async notifyScheduledIntervention(
    interventionId: string,
    equipementId: string,
    equipmentName: string,
    technicianId: string,
    interventionDate: Date
  ) {
    try {
      const notification = await this.createNotification({
        utilisateurId: technicianId,
        titre: `📅 Intervention programmée - ${equipmentName}`,
        message: `Une intervention est programmée le ${interventionDate.toLocaleDateString('fr-FR')} sur l'équipement ${equipmentName}.`,
        typeNotification: 'MAINTENANCE',
        equipementId,
        interventionId
      });

      console.log(`🔔 Notification d'intervention envoyée au technicien ${technicianId}`);
      return notification;
    } catch (error) {
      console.error('💥 Erreur notification intervention:', error);
      throw error;
    }
  }

  /**
   * Notifier une intervention terminée (pour validation)
   */
  static async notifyInterventionCompleted(
    interventionId: string,
    equipementId: string,
    equipmentName: string,
    completedBy: string
  ) {
    try {
      // Récupérer les administrateurs pour validation
      const admins = await prisma.utilisateur.findMany({
        where: {
          role: 'ADMINISTRATEUR',
          actif: true
        }
      });

      const notifications = await Promise.all(
        admins.map(admin => 
          this.createNotification({
            utilisateurId: admin.id,
            titre: `✅ Intervention terminée - ${equipmentName}`,
            message: `L'intervention sur ${equipmentName} a été terminée et attend votre validation.`,
            typeNotification: 'VALIDATION',
            equipementId,
            interventionId
          })
        )
      );

      console.log(`🔔 ${notifications.length} notifications de validation envoyées`);
      return notifications;
    } catch (error) {
      console.error('💥 Erreur notification validation:', error);
      throw error;
    }
  }

  /**
   * Notifier un nouvel équipement ajouté
   */
  static async notifyNewEquipment(
    equipementId: string,
    equipmentName: string,
    serviceName: string
  ) {
    try {
      // Récupérer tous les utilisateurs du service concerné
      const serviceUsers = await prisma.utilisateur.findMany({
        where: {
          actif: true,
          // Vous pouvez ajouter une logique pour filtrer par service si nécessaire
        }
      });

      const notifications = await Promise.all(
        serviceUsers.map(user => 
          this.createNotification({
            utilisateurId: user.id,
            titre: `🆕 Nouvel équipement - ${equipmentName}`,
            message: `Un nouvel équipement "${equipmentName}" a été ajouté au service ${serviceName}.`,
            typeNotification: 'EQUIPEMENT',
            equipementId
          })
        )
      );

      console.log(`🔔 ${notifications.length} notifications d'ajout d'équipement envoyées`);
      return notifications;
    } catch (error) {
      console.error('💥 Erreur notification nouvel équipement:', error);
      throw error;
    }
  }

  /**
   * Notifier les rappels de maintenance
   */
  static async notifyMaintenanceReminder(
    equipementId: string,
    equipmentName: string,
    maintenanceDate: Date
  ) {
    try {
      // Récupérer les techniciens responsables
      const technicians = await prisma.utilisateur.findMany({
        where: {
          role: 'TECHNICIEN',
          actif: true
        }
      });

      const notifications = await Promise.all(
        technicians.map(tech => 
          this.createNotification({
            utilisateurId: tech.id,
            titre: `⚠️ Rappel maintenance - ${equipmentName}`,
            message: `La maintenance de l'équipement ${equipmentName} est prévue le ${maintenanceDate.toLocaleDateString('fr-FR')}.`,
            typeNotification: 'MAINTENANCE',
            equipementId
          })
        )
      );

      console.log(`🔔 ${notifications.length} rappels de maintenance envoyés`);
      return notifications;
    } catch (error) {
      console.error('💥 Erreur rappel maintenance:', error);
      throw error;
    }
  }
}

export default NotificationService;
