"use client"
import { useState, useEffect } from "react"
import { useUser } from "@/app/contexts/UserContext"
import Announcements from "@/components/Notifications"
import UserCard from "@/components/UserCard"
import CalendarBig from "@/components/CalendarBig"
import { useRoleGuard } from "@/hooks/useRoleGuard"
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

// Types pour les statistiques du technicien
interface TechnicianStats {
  totalEquipments: number;
  defectiveEquipments: number; // EN_PANNE + HORS_SERVICE
  myInterventions: number;
  pendingInterventions: number;
  completedInterventions: number;
}

const TechnicienPage = () => {
  const { isAuthorized, isLoading: roleLoading } = useRoleGuard('TECHNICIEN');
  const { user } = useUser();
  
  // États pour les données
  const [stats, setStats] = useState<TechnicianStats>({
    totalEquipments: 0,
    defectiveEquipments: 0,
    myInterventions: 0,
    pendingInterventions: 0,
    completedInterventions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

  // Fonction pour récupérer les statistiques
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      console.log('📊 Récupération des statistiques technicien...');

      // Récupérer les statistiques en parallèle
      const [equipmentsResponse, interventionsResponse] = await Promise.all([
        // Statistiques des équipements
        fetch(`${API_BASE_URL}/api/equipments?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        // Statistiques des interventions du technicien
        fetch(`${API_BASE_URL}/api/interventions?limit=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!equipmentsResponse.ok || !interventionsResponse.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const equipmentsData = await equipmentsResponse.json();
      const interventionsData = await interventionsResponse.json();

      console.log('✅ Données reçues:', { equipmentsData, interventionsData });

      // Calculer les statistiques des équipements
      const totalEquipments = equipmentsData.pagination?.total || 0;
      const defectiveEquipments = equipmentsData.equipements?.filter((eq: any) => 
        eq.statut === 'EN_PANNE' || eq.statut === 'HORS_SERVICE'
      ).length || 0;

      // Calculer les statistiques des interventions du technicien
      const allInterventions = interventionsData.interventions || [];
      const myInterventions = allInterventions.filter((intervention: any) => 
        intervention.intervenantId === user.id
      );
      
      const pendingInterventions = myInterventions.filter((intervention: any) => 
        !intervention.dateIntervention
      ).length;
      
      const completedInterventions = myInterventions.filter((intervention: any) => 
        intervention.dateIntervention && intervention.interventionValidee
      ).length;

      setStats({
        totalEquipments,
        defectiveEquipments,
        myInterventions: myInterventions.length,
        pendingInterventions,
        completedInterventions
      });

      console.log('📊 Statistiques calculées:', {
        totalEquipments,
        defectiveEquipments,
        myInterventions: myInterventions.length,
        pendingInterventions,
        completedInterventions
      });

    } catch (err) {
      console.error('💥 Erreur récupération stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (isAuthorized && user?.id) {
      fetchStats();
    }
  }, [isAuthorized, user?.id]);

  // Gérer le chargement des rôles
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <div className="text-lg">Vérification des permissions...</div>
        </div>
      </div>
    );
  }

  // Gérer l'autorisation
  if (!isAuthorized) {
    return null;
  }

  // Gérer les erreurs
  if (error && !loading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
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
    <div className="flex-1 wrap-normal p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full">
          {/* En-tête avec bouton actualiser */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Technicien
              </h1>
              <p className="text-gray-600">
                Bienvenue {user?.prenom} {user?.nom}
              </p>
            </div>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Cartes de statistiques */}
          <div className="flex gap-4 justify-between flex-wrap w-full">
            {loading ? (
              // Skeleton loading pour les cartes
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 min-w-[200px] bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <UserCard 
                  type="Équipements total" 
                  number={stats.totalEquipments}
                  className="bg-blue-50 border-blue-200"
                />
                <UserCard 
                  type="Défectueux" 
                  number={stats.defectiveEquipments}
                  className="bg-red-50 border-red-200"
                />
                <UserCard 
                  type="Mes interventions" 
                  number={stats.myInterventions}
                  className="bg-green-50 border-green-200"
                />
              </>
            )}
          </div>

          {/* Statistiques supplémentaires pour les techniciens */}
          {!loading && (
            <div className="flex gap-4 justify-between flex-wrap w-full mt-4">
              <div className="flex-1 min-w-[200px] bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">En attente</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.pendingInterventions}</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">⏳</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-[200px] bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Terminées</p>
                    <p className="text-2xl font-bold text-green-900">{stats.completedInterventions}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendrier */}
          <div className="h-full bg-white p-4 rounded-md mt-4">
            <h1 className="text-xl font-semibold mb-2">Emploi du temps</h1>
            <CalendarBig/>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  )
}

export default TechnicienPage
