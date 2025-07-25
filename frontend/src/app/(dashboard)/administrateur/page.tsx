"use client"

import { useState, useEffect } from "react"
import UserCard from "@/components/UserCard"
import CountChart from "@/components/CountChart"
import AttendanceChart from "@/components/AttendanceChart"
import FinanceChart from "@/components/FinanceChart"
import EventCalendar from "@/components/EventCalendar"
import Notifications from "@/components/Notifications"
import { useRoleGuard } from "@/hooks/useRoleGuard"

// 🔧 Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

// Types pour les données du dashboard
interface DashboardStats {
  totalUsers: number;
  totalTechnicians: number;
  totalEquipments: number;
  loading: boolean;
  error: string | null;
}

interface EquipmentByService {
  service: string;
  disponible: number;
  panne: number;
}

interface MonthlyInterventions {
  month: string;
  panne: number;
  réparation: number;
}

const AdminPage = () => {
  const { isAuthorized, isLoading } = useRoleGuard('ADMINISTRATEUR');
  
  // États pour les statistiques
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTechnicians: 0,
    totalEquipments: 0,
    loading: true,
    error: null
  });

  const [equipmentByService, setEquipmentByService] = useState<EquipmentByService[]>([]);
  const [monthlyInterventions, setMonthlyInterventions] = useState<MonthlyInterventions[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour récupérer les statistiques utilisateurs
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      const response = await fetch(`${API_BASE_URL}/api/users/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      const data = await response.json();
      console.log('📊 Stats utilisateurs:', data);

      return {
        totalUsers: data.parRole?.UTILISATEUR || 0,
        totalTechnicians: data.parRole?.TECHNICIEN || 0,
        totalActifs: data.actifs || 0
      };
    } catch (error) {
      console.error('Erreur stats utilisateurs:', error);
      return { totalUsers: 0, totalTechnicians: 0, totalActifs: 0 };
    }
  };

  // Fonction pour récupérer les statistiques équipements
  const fetchEquipmentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      // Récupérer tous les équipements pour calculer les stats
      const response = await fetch(`${API_BASE_URL}/api/equipments?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      const data = await response.json();
      console.log('🔧 Stats équipements:', data);

      // Calculer les stats par service
      const serviceStats: { [key: string]: { disponible: number; panne: number } } = {};
      
      data.equipements?.forEach((equip: any) => {
        const serviceName = equip.service?.nom || 'Service non défini';
        
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { disponible: 0, panne: 0 };
        }
        
        if (equip.statut === 'FONCTIONNEL') {
          serviceStats[serviceName].disponible++;
        } else {
          serviceStats[serviceName].panne++;
        }
      });

      // Convertir en format pour le graphique
      const serviceData: EquipmentByService[] = Object.entries(serviceStats)
        .slice(0, 5) // Limiter à 5 services
        .map(([service, stats]) => ({
          service: service.length > 12 ? service.substring(0, 12) + '...' : service,
          disponible: stats.disponible,
          panne: stats.panne
        }));

      return {
        totalEquipments: data.pagination?.total || 0,
        serviceData
      };
    } catch (error) {
      console.error('Erreur stats équipements:', error);
      return { totalEquipments: 0, serviceData: [] };
    }
  };

  // Fonction pour récupérer les statistiques d'interventions
  const fetchInterventionStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      const response = await fetch(`${API_BASE_URL}/api/interventions?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      const data = await response.json();
      console.log('📈 Stats interventions:', data);

      // Calculer les stats par mois
      const monthlyStats: { [key: string]: { panne: number; réparation: number } } = {};
      const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];

      // Initialiser tous les mois
      months.forEach(month => {
        monthlyStats[month] = { panne: 0, réparation: 0 };
      });

      // Compter les interventions par mois et type
      data.interventions?.forEach((intervention: any) => {
        const date = new Date(intervention.dateIntervention || intervention.dateSignalement);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        
        if (intervention.typeIntervention === 'REPARATION') {
          monthlyStats[monthName].réparation++;
        } else {
          monthlyStats[monthName].panne++;
        }
      });

      // Convertir en format pour le graphique
      const monthlyData: MonthlyInterventions[] = months.map(month => ({
        month: month.substring(0, 6), // Raccourcir les noms
        panne: monthlyStats[month].panne,
        réparation: monthlyStats[month].réparation
      }));

      return monthlyData;
    } catch (error) {
      console.error('Erreur stats interventions:', error);
      return [];
    }
  };

  // Fonction principale pour charger toutes les données
  const loadDashboardData = async () => {
    setDashboardStats(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔄 Chargement des données du dashboard...');
      
      // Charger toutes les données en parallèle
      const [userStats, equipmentStats, interventionStats] = await Promise.all([
        fetchUserStats(),
        fetchEquipmentStats(),
        fetchInterventionStats()
      ]);

      // Mettre à jour les états
      setDashboardStats({
        totalUsers: userStats.totalUsers,
        totalTechnicians: userStats.totalTechnicians,
        totalEquipments: equipmentStats.totalEquipments,
        loading: false,
        error: null
      });

      setEquipmentByService(equipmentStats.serviceData);
      setMonthlyInterventions(interventionStats);

      console.log('✅ Données du dashboard chargées avec succès');
      
    } catch (error) {
      console.error('💥 Erreur chargement dashboard:', error);
      setDashboardStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData();
    }
  }, [isAuthorized, refreshKey]);

  // Fonction pour actualiser les données
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Vérification des permissions...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (dashboardStats.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-lg">Chargement du dashboard...</div>
        </div>
      </div>
    );
  }

  if (dashboardStats.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg mb-4">Erreur lors du chargement du dashboard</p>
          <p className="text-sm mb-4">{dashboardStats.error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap w-full">
          {/* Header avec bouton refresh */}
          <div className="w-full flex justify-between items-center mb-4">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 Actualiser
            </button>
          </div>
          
          <UserCard 
            type="utilisateurs" 
            number={dashboardStats.totalUsers}
          />
          <UserCard 
            type="techniciens" 
            number={dashboardStats.totalTechnicians}
          />
          <UserCard 
            type="Equipements" 
            number={dashboardStats.totalEquipments}
          />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChart refreshTrigger={refreshKey} />
          </div>
          {/* ATTENDANCE CHART - Disponibilité par service */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChart data={equipmentByService} />
          </div>
        </div>

        {/* BOTTOM CHARTS */}
        <div className="w-full h-[500px]">
          <FinanceChart data={monthlyInterventions} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Notifications />
      </div>
    </div>
  )
}

export default AdminPage;
