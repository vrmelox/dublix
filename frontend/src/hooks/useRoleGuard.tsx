//src/hooks/useRoleGuard.tsx

"use client"

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type UserRole = 'ADMINISTRATEUR' | 'TECHNICIEN' | 'UTILISATEUR';

// 🔧 CORRECTION : S'assurer qu'il n'y a pas de double /api
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bioqrsuivi.com';
  // Enlever /api à la fin s'il existe pour éviter le double /api
  return baseUrl.replace(/\/api$/, '');
};

const API_BASE_URL = getApiBaseUrl();

interface UseRoleGuardReturn {
  isAuthorized: boolean;
  isLoading: boolean;
  userRole?: UserRole;
}

export const useRoleGuard = (requiredRole: UserRole): UseRoleGuardReturn => {
  const router = useRouter();
  const pathname = usePathname(); // 🔧 AJOUT : Pour éviter les boucles
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Éviter les vérifications multiples
    if (hasChecked.current) return;

    const checkAuthorization = async () => {
      try {
        console.log(`🔒 Vérification d'accès pour le rôle: ${requiredRole}`);
        console.log(`📍 Page actuelle: ${pathname}`);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('❌ Aucun token trouvé - redirection vers login');
          hasChecked.current = true;
          setIsLoading(false);
          
          // 🔧 CORRECTION : Éviter la redirection si déjà sur /login
          if (pathname !== '/login') {
            router.replace('/login');
          }
          return;
        }

        // 🔧 CORRECTION : URL garantie sans double /api
        const apiUrl = `${API_BASE_URL}/api/me`;
        console.log(`🌐 URL API: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log(`❌ Token invalide (${response.status}) - suppression et redirection vers login`);
          localStorage.removeItem('token');
          hasChecked.current = true;
          setIsLoading(false);
          
          // 🔧 CORRECTION : Éviter la redirection si déjà sur /login
          if (pathname !== '/login') {
            router.replace('/login');
          }
          return;
        }

        const userData = await response.json();
        const actualRole = userData.role as UserRole;
        setUserRole(actualRole);
        
        console.log(`👤 Rôle utilisateur: ${actualRole}`);
        console.log(`🎯 Rôle requis: ${requiredRole}`);
        
        // RESTRICTION STRICTE : seul le rôle exact peut accéder à cette page
        if (actualRole !== requiredRole) {
          console.log(`🚫 Accès refusé - redirection vers la page du rôle ${actualRole}`);
          
          const redirectPath = actualRole === 'ADMINISTRATEUR' ? '/administrateur' :
                              actualRole === 'TECHNICIEN' ? '/technicien' :
                              actualRole === 'UTILISATEUR' ? '/utilisateur' : '/login';
          
          console.log(`🔄 Redirection vers: ${redirectPath}`);
          
          hasChecked.current = true;
          setIsLoading(false);
          
          // 🔧 CORRECTION : Éviter la redirection si déjà sur la bonne page
          if (pathname !== redirectPath) {
            router.replace(redirectPath);
          }
          return;
        }

        console.log('✅ Accès autorisé - affichage du contenu');
        setIsAuthorized(true);
        hasChecked.current = true;
        
      } catch (error) {
        console.error('💥 Erreur lors de la vérification des autorisations:', error);
        localStorage.removeItem('token');
        hasChecked.current = true;
        setIsLoading(false);
        
        // 🔧 CORRECTION : Éviter la redirection si déjà sur /login
        if (pathname !== '/login') {
          router.replace('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [requiredRole, pathname]); // 🔧 AJOUT : pathname dans les dépendances

  return {
    isAuthorized,
    isLoading,
    userRole
  };
};
