// src/hooks/useNotifications.ts
'use client';

import { useState, useEffect } from 'react';

// 🔧 Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

// Types pour les notifications
export interface Notification {
  id: string;
  utilisateurId: string;
  titre: string;
  message: string;
  typeNotification: 'INTERVENTION' | 'EQUIPEMENT' | 'SIGNALEMENT' | 'MAINTENANCE' | 'VALIDATION' | 'SYSTEM';
  priorite: 'BASSE' | 'MOYENNE' | 'HAUTE';
  lue: boolean;
  dateCreation: string;
  dateModification?: string;
  equipementId?: string;
  interventionId?: string;
  // Données enrichies pour l'affichage
  equipement?: {
    nom: string;
    numeroSerie: string;
  };
  intervention?: {
    typeIntervention: string;
  };
}

export interface NotificationDisplay {
  id: string;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'equipment' | 'intervention' | 'user' | 'signalement';
  actionUrl?: string;
}

// Hook pour gérer les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fonction pour convertir les notifications API vers le format d'affichage
  const transformNotification = (apiNotif: Notification): NotificationDisplay => {
    // Mapper le type
    let type: 'info' | 'warning' | 'success' | 'error' = 'info';
    switch (apiNotif.typeNotification) {
      case 'SIGNALEMENT':
      case 'MAINTENANCE':
        type = 'warning';
        break;
      case 'VALIDATION':
        type = 'success';
        break;
      case 'EQUIPEMENT':
        type = apiNotif.message.includes('panne') ? 'error' : 'info';
        break;
      case 'SYSTEM':
        type = 'info';
        break;
      default:
        type = 'info';
    }

    // Mapper la priorité
    let priority: 'low' | 'medium' | 'high' = 'medium';
    switch (apiNotif.priorite) {
      case 'BASSE':
        priority = 'low';
        break;
      case 'MOYENNE':
        priority = 'medium';
        break;
      case 'HAUTE':
        priority = 'high';
        break;
    }

    // Mapper la catégorie
    let category: 'system' | 'equipment' | 'intervention' | 'user' | 'signalement' = 'system';
    switch (apiNotif.typeNotification) {
      case 'EQUIPEMENT':
        category = 'equipment';
        break;
      case 'INTERVENTION':
      case 'MAINTENANCE':
        category = 'intervention';
        break;
      case 'SIGNALEMENT':
        category = 'signalement';
        break;
      case 'VALIDATION':
        category = 'intervention';
        break;
      default:
        category = 'system';
    }

    // Générer l'URL d'action
    let actionUrl: string | undefined;
    if (apiNotif.equipementId) {
      actionUrl = `/equipment/${apiNotif.equipementId}`;
    } else if (apiNotif.interventionId) {
      actionUrl = `/interventions/${apiNotif.interventionId}`;
    }

    return {
      id: apiNotif.id,
      titre: apiNotif.titre,
      message: apiNotif.message,
      type,
      isRead: apiNotif.lue,
      createdAt: apiNotif.dateCreation,
      priority,
      category,
      actionUrl
    };
  };

  // Fonction pour récupérer les notifications
  const fetchNotifications = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      console.log('📧 Récupération des notifications...');

      const url = `${API_BASE_URL}/api/notifications${limit ? `?limit=${limit}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Notifications reçues:', data);

      // Transformer les données
      const transformedNotifications = data.notifications?.map(transformNotification) || [];
      setNotifications(transformedNotifications);

      // Calculer le nombre de non lues
      const unread = transformedNotifications.filter((n: NotificationDisplay) => !n.isRead).length;
      setUnreadCount(unread);

    } catch (err) {
      console.error('💥 Erreur notifications:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour marquer comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur marquer comme lu:', error);
    }
  };

  // Fonction pour marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erreur marquer toutes comme lues:', error);
    }
  };

  // Fonction pour supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        // Recalculer le compteur
        const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: () => fetchNotifications()
  };
};

// Hook pour récupérer uniquement le compteur (pour la navbar)
export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Erreur compteur notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { unreadCount, loading, refetch: fetchCount };
};
