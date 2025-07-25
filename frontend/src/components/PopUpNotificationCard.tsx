'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications'; // 🔔 Import du hook
import {
  Bell,
  AlertTriangle,
  Info,
  Check,
  X,
  Clock,
  ArrowRight,
  Settings,
  Loader2
} from 'lucide-react';

interface PopUpNotificationCardProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onNotificationUpdate?: () => void; // Callback pour mise à jour
}

const PopUpNotificationCard: React.FC<PopUpNotificationCardProps> = ({
  isOpen,
  onClose,
  unreadCount,
  onNotificationUpdate
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { notifications, loading, markAsRead } = useNotifications(); // 🔔 Utilisation du hook
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtrer uniquement les notifications non lues (maximum 5 pour le popup)
  const unreadNotifications = notifications
    .filter(notif => !notif.isRead)
    .slice(0, 5)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Fonction pour formater la date de manière relative
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}j`;
  };

  // Fonction pour obtenir l'icône selon le type
  const getTypeIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-orange-500`} />;
      case 'success':
        return <Check className={`${iconClass} text-green-500`} />;
      case 'error':
        return <AlertTriangle className={`${iconClass} text-red-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  // Fonction pour obtenir la couleur de fond selon le type
  const getTypeBackground = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  // Marquer comme lu et naviguer
  const handleNotificationClick = async (notification: any) => {
    try {
      setActionLoading(notification.id);
      
      // Marquer comme lu via l'API
      if (!notification.isRead) {
        await markAsRead(notification.id);
        onNotificationUpdate?.(); // Callback pour mettre à jour le compteur
      }

      // Naviguer si URL disponible
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors du clic sur notification:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Naviguer vers la page de toutes les notifications
  const handleViewAll = () => {
    router.push('/notifications');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:absolute sm:inset-auto sm:top-12 sm:right-0 sm:z-50">
      {/* Overlay pour mobile */}
      <div className="fixed inset-0 bg-black bg-opacity-25 sm:hidden" onClick={onClose}></div>

      <div
        ref={cardRef}
        className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl border border-gray-200 w-full sm:w-80 max-h-[80vh] sm:max-h-96 overflow-hidden mt-auto sm:mt-0"
      >
        {/* En-tête */}
        <div className="px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center flex-shrink-0">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-h-60 sm:max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Chargement...</p>
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucune nouvelle notification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-l-3 ${getTypeBackground(notification.type)} ${
                    actionLoading === notification.id ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {actionLoading === notification.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                      ) : (
                        getTypeIcon(notification.type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
                          {notification.titre}
                        </h4>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        {notification.priority === 'high' && (
                          <span className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                            Priorité haute
                          </span>
                        )}
                        {notification.category && (
                          <span className="text-xs text-gray-400 capitalize">
                            {notification.category === 'signalement' ? 'Signalement' : 
                             notification.category === 'equipment' ? 'Équipement' :
                             notification.category === 'intervention' ? 'Intervention' :
                             notification.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="px-3 sm:px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={handleViewAll}
              className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <span>Voir toutes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-2">
              {unreadNotifications.length > 0 && (
                <span className="text-xs text-gray-500">
                  {unreadNotifications.length} non lue{unreadNotifications.length > 1 ? 's' : ''}
                </span>
              )}
              <button
                onClick={handleViewAll}
                className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block"
                title="Paramètres des notifications"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopUpNotificationCard;
