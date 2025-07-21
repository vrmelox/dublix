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
  photo?: string; // Changé de avatar à photo pour correspondre à votre API
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

// URL de base de l'API - à configurer selon votre environnement
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Provider du contexte
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les infos utilisateur
  const fetchUser = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      
      // Si erreur d'authentification, nettoyer le storage et rediriger vers login
      if (errorMessage === 'Session expirée' || errorMessage === 'Aucun token trouvé') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
        router.push('/login');
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
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setError(null);
    router.push('/login');
  };

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