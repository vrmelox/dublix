"use client"
import Image from 'next/image';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

// 🔧 Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

interface EquipmentStats {
  total: number;
  fonctionnel: number;
  horsUsage: number;
  pourcentageFonctionnel: number;
  pourcentageHorsUsage: number;
}

interface CountChartProps {
  refreshTrigger?: number; // Pour déclencher un refresh depuis le parent
}

const CountChart: React.FC<CountChartProps> = ({ refreshTrigger = 0 }) => {
  const [stats, setStats] = useState<EquipmentStats>({
    total: 0,
    fonctionnel: 0,
    horsUsage: 0,
    pourcentageFonctionnel: 0,
    pourcentageHorsUsage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les statistiques d'équipements
  const fetchEquipmentStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      console.log('📊 Récupération stats équipements pour CountChart...');

      const response = await fetch(`${API_BASE_URL}/api/equipments?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Erreur ${response.status}`);
      
      const data = await response.json();
      console.log('📈 Données équipements reçues:', data);

      // Calculer les statistiques par statut
      let fonctionnel = 0;
      let horsUsage = 0;

      data.equipements?.forEach((equip: any) => {
        if (equip.statut === 'FONCTIONNEL') {
          fonctionnel++;
        } else {
          // EN_PANNE et HORS_SERVICE comptent comme "hors d'usage"
          horsUsage++;
        }
      });

      const total = fonctionnel + horsUsage;
      const pourcentageFonctionnel = total > 0 ? Math.round((fonctionnel / total) * 100) : 0;
      const pourcentageHorsUsage = total > 0 ? Math.round((horsUsage / total) * 100) : 0;

      setStats({
        total,
        fonctionnel,
        horsUsage,
        pourcentageFonctionnel,
        pourcentageHorsUsage
      });

      console.log('✅ Stats calculées:', {
        total,
        fonctionnel,
        horsUsage,
        pourcentageFonctionnel,
        pourcentageHorsUsage
      });

    } catch (error) {
      console.error('💥 Erreur stats équipements CountChart:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand refreshTrigger change
  useEffect(() => {
    fetchEquipmentStats();
  }, [refreshTrigger]);

  // Préparer les données pour le graphique RadialBar
  const chartData = [
    {
      name: 'Hors usage',
      count: stats.horsUsage,
      fill: '#ef4444', // Rouge pour hors d'usage
    },
    {
      name: 'Total',
      count: stats.total,
      fill: 'transparent',
    },
    {
      name: 'Fonctionnel',
      count: stats.fonctionnel,
      fill: '#10b981', // Vert pour fonctionnel
    },
  ];

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-lg border border-gray-100">
      {/* TITLE */}
      <div className="flex justify-between items-center mb-2">
        <h1 className='text-lg font-semibold text-gray-800'>Équipements</h1>
        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <Image src="/moreDark.png" alt="Options" width={20} height={20}/>
        </div>
      </div>

      {/* MESSAGE D'ERREUR */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ Erreur: {error}
          </p>
          <button
            onClick={fetchEquipmentStats}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* CHART */}
      <div className="relative w-full h-[65%]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="90%"
                barSize={28}
                data={chartData}
              >
                <RadialBar
                  background
                  dataKey="count"
                  cornerRadius={4}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            {/* Icône centrale avec total */}
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'>
              <Image 
                src="/health.png"
                alt='Équipements'
                width={32}
                height={32}
                className='mx-auto mb-1'
              />
            </div>
          </>
        )}
      </div>

      {/* BOTTOM - Statistiques */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-green-500 rounded-full"/>
          <h1 className='font-bold text-gray-800'>
            {loading ? '...' : stats.fonctionnel.toLocaleString()}
          </h1>
          <h2 className='text-xs text-gray-500 text-center'>
            Fonctionnel
            {!loading && ` (${stats.pourcentageFonctionnel}%)`}
          </h2>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded-full"/>
          <h1 className='font-bold text-gray-800'>
            {loading ? '...' : stats.horsUsage.toLocaleString()}
          </h1>
          <h2 className='text-xs text-gray-500 text-center'>
            Hors d'usage
            {!loading && ` (${stats.pourcentageHorsUsage}%)`}
          </h2>
        </div>
      </div>
    </div>
  )
}

export default CountChart;
