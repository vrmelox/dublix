//src/app/contexts/UserContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Types pour l'utilisateur
interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMINISTRATEUR' | 'TECHNICIEN' | 'UTILISATEUR';
  telephone?: string;
  photo?: string;
}

// Types pour le contexte
interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

// Création du contexte
const UserContext = createContext<UserContextType | undefined>(undefined);

// Props du provider
interface UserProviderProps {
  children: ReactNode;
}

// URL de base de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

// Fonction utilitaire pour vérifier la validité du token
const isTokenValid = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp && payload.exp > currentTime;
  } catch {
    return false;
  }
};

// Provider du contexte
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour nettoyer l'authentification
  const clearAuth = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // Fonction pour récupérer les infos utilisateur
  const fetchUser = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      // Vérifier si le token est expiré avant de faire l'appel API
      if (!isTokenValid(token)) {
        throw new Error('Token expiré');
      }

      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Gestion complète des erreurs HTTP
      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error('Session expirée');
          case 403:
            throw new Error('Accès non autorisé');
          case 404:
            throw new Error('Utilisateur introuvable');
          case 500:
          case 502:
          case 503:
          case 504:
            throw new Error('Erreur serveur - Session expirée');
          default:
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);

      // Nettoyer l'auth pour toutes les erreurs d'authentification ou de serveur
      const authErrors = [
        'Session expirée',
        'Token expiré',
        'Aucun token trouvé',
        'Accès non autorisé',
        'Utilisateur introuvable',
        'Erreur serveur - Session expirée'
      ];

      if (authErrors.some(error => errorMessage.includes(error))) {
        clearAuth();
        // Délai pour éviter les redirections en boucle
        setTimeout(() => {
          router.push('/login');
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async (): Promise<void> => {
    await fetchUser();
  };

  // Fonction de déconnexion
  const logout = (): void => {
    clearAuth();
    router.push('/login');
  };

  // Vérification périodique du token (toutes les 30 secondes)
  useEffect(() => {
    const checkTokenValidity = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && !isTokenValid(token)) {
        console.log('Token expiré détecté, déconnexion automatique');
        clearAuth();
        router.push('/login');
      }
    };

    const interval = setInterval(checkTokenValidity, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [router]);

  // Effet pour charger l'utilisateur au montage
  useEffect(() => {
    fetchUser();
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    refreshUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
};

// Export du contexte pour une utilisation directe si nécessaire
export { UserContext };
