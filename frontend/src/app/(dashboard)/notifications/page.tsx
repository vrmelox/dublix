'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications'; // 🔔 Import du hook
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  Settings,
  Clock,
  Filter,
  Search,
  Trash2,
  MoreVertical,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refetch 
  } = useNotifications(); // 🔔 Utilisation du hook connecté

  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Fonction pour obtenir l'icône selon le type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
      case 'success': return <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default: return <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
    }
  };

  // Fonction pour obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-orange-500 bg-orange-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Marquer comme lu/non lu
  const toggleReadStatus = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.isRead) {
      await markAsRead(id);
    }
  };

  // Supprimer une notification
  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };

  // Supprimer les notifications sélectionnées
  const deleteSelected = async () => {
    await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
    setSelectedNotifications([]);
    setShowActions(false);
  };

  // Marquer les sélectionnées comme lues
  const markSelectedAsRead = async () => {
    await Promise.all(selectedNotifications.map(id => markAsRead(id)));
    setSelectedNotifications([]);
    setShowActions(false);
  };

  // Gérer la sélection
  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  // Filtrer les notifications
  useEffect(() => {
    let filtered = notifications;

    // Filtre par statut de lecture
    if (filterType === 'unread') {
      filtered = filtered.filter(notif => !notif.isRead);
    } else if (filterType === 'read') {
      filtered = filtered.filter(notif => notif.isRead);
    }

    // Filtre par catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(notif => notif.category === filterCategory);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(notif =>
        notif.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filterType, filterCategory, searchTerm]);

  // Statistiques
  const highPriorityCount = notifications.filter(n => n.priority === 'high' && !n.isRead).length;

  // 🔄 Rafraîchir les données
  const handleRefresh = () => {
    refetch();
  };

  // 🔔 Gérer le chargement
  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  // 🔔 Gérer les erreurs
  if (error && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Notifications</h1>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                  {unreadCount} non lues sur {notifications.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* 🔄 Bouton rafraîchir */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Actions"
              >
                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => router.push('/settings/notifications')}
                className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block"
                title="Paramètres"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 p-2 sm:p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-blue-600 text-xs sm:text-sm font-medium truncate">Total</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{notifications.length}</p>
                </div>
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-500 flex-shrink-0" />
              </div>
            </div>
            <div className="bg-orange-50 p-2 sm:p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-orange-600 text-xs sm:text-sm font-medium truncate">Non lues</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-900">{unreadCount}</p>
                </div>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-500 flex-shrink-0" />
              </div>
            </div>
            <div className="bg-red-50 p-2 sm:p-3 lg:p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-red-600 text-xs sm:text-sm font-medium truncate">Priorité haute</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-900">{highPriorityCount}</p>
                </div>
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-500 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
              >
                <option value="all">Toutes catégories</option>
                <option value="equipment">Équipements</option>
                <option value="intervention">Interventions</option>
                <option value="user">Utilisateurs</option>
                <option value="system">Système</option>
                <option value="signalement">Signalements</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions groupées */}
        {(selectedNotifications.length > 0 || showActions) && (
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                {selectedNotifications.length > 0 && (
                  <span className="text-xs sm:text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
                    {selectedNotifications.length} sélectionnée(s)
                  </span>
                )}
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="flex items-center space-x-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs sm:text-sm disabled:opacity-50"
                >
                  <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Marquer tout comme lu</span>
                  <span className="sm:hidden">Tout lu</span>
                </button>
                {selectedNotifications.length > 0 && (
                  <>
                    <button
                      onClick={markSelectedAsRead}
                      disabled={loading}
                      className="flex items-center space-x-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs sm:text-sm disabled:opacity-50"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Marquer comme lu</span>
                      <span className="sm:hidden">Lu</span>
                    </button>
                    <button
                      onClick={deleteSelected}
                      disabled={loading}
                      className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs sm:text-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Supprimer</span>
                      <span className="sm:hidden">Suppr.</span>
                    </button>
                  </>
                )}
              </div>
              {selectedNotifications.length > 0 && (
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
                >
                  Désélectionner
                </button>
              )}
            </div>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="space-y-2 sm:space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <Bell className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Aucune notification ne correspond à vos critères.'
                  : 'Vous n\'avez aucune notification pour le moment.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 transition-all hover:shadow-md ${
                  getPriorityColor(notification.priority)
                } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-1 w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 sm:space-x-2 mb-1 flex-wrap">
                            <h3 className={`text-xs sm:text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'} truncate`}>
                              {notification.titre}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                            )}
                            <span className={`px-1.5 py-0.5 text-xs rounded-full flex-shrink-0 ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {notification.priority === 'high' ? 'H' :
                               notification.priority === 'medium' ? 'M' : 'L'}
                            </span>
                          </div>
                          <p className={`text-xs sm:text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'} mb-2 line-clamp-2`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                            {notification.actionUrl && (
                              <button
                                onClick={() => router.push(notification.actionUrl!)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium hidden sm:block"
                              >
                                Voir détails →
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Actions - optimisées pour mobile */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => toggleReadStatus(notification.id)}
                            disabled={loading}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title={notification.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                          >
                            {notification.isRead ? 
                              <Bell className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            }
                          </button>
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={loading}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loader en bas si chargement en cours */}
        {loading && notifications.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
