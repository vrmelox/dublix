"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// Types pour les données du graphique
interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface EquipmentStats {
  total: number;
  fonctionnel: number;
  enPanne: number;
  horsService: number;
}

const RADIAN = Math.PI / 180;
const CENTER_X = "50%";
const CENTER_Y = "60%";
const INNER_RADIUS = 40;
const OUTER_RADIUS = 80;

const Needle = ({
  value,
  data,
  cx,
  cy,
  iR,
  oR,
  color,
}: {
  value: number;
  data: ChartData[];
  cx: string | number;
  cy: string | number;
  iR: number;
  oR: number;
  color: string;
}) => {
  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  const angle = 180 * (1 - value / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * angle);
  const cos = Math.cos(-RADIAN * angle);
  const r = 5;

  const containerWidth = 300;
  const containerHeight = 200;
  const centerX =
    typeof cx === "string" && cx.endsWith("%")
      ? (parseFloat(cx) / 100) * containerWidth
      : (cx as number);
  const centerY =
    typeof cy === "string" && cy.endsWith("%")
      ? (parseFloat(cy) / 100) * containerHeight
      : (cy as number);

  const x0 = centerX + 5;
  const y0 = centerY + 5;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill={color} />
      <path d={`M${xba} ${yba} L${xbb} ${ybb} L${xp} ${yp} Z`} fill={color} />
    </g>
  );
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {(percent * 100).toFixed(0)}%
    </text>
  );
};

const EquipmentStatusChart = () => {
  const [stats, setStats] = useState<EquipmentStats>({
    total: 0,
    fonctionnel: 0,
    enPanne: 0,
    horsService: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

  // Fonction pour récupérer les statistiques des équipements
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      console.log('📊 Récupération des statistiques d\'équipements...');

      const response = await fetch(`${API_BASE_URL}/api/equipments?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);

      const equipements = data.equipements || [];
      
      // Calculer les statistiques par statut
      const total = equipements.length;
      const fonctionnel = equipements.filter((eq: any) => eq.statut === 'FONCTIONNEL').length;
      const enPanne = equipements.filter((eq: any) => eq.statut === 'EN_PANNE').length;
      const horsService = equipements.filter((eq: any) => eq.statut === 'HORS_SERVICE').length;

      setStats({
        total,
        fonctionnel,
        enPanne,
        horsService
      });

      console.log('📊 Statistiques calculées:', { total, fonctionnel, enPanne, horsService });

    } catch (err) {
      console.error('💥 Erreur récupération stats équipements:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    fetchStats();
  }, []);

  // Préparer les données pour le graphique
  const chartData: ChartData[] = [
    { name: "En panne", value: stats.enPanne, color: "#ff4d4f" },
    { name: "Hors service", value: stats.horsService, color: "#faad14" },
    { name: "Fonctionnel", value: stats.fonctionnel, color: "#52c41a" },
  ];

  const needleValue = chartData.find((d) => d.name === "En panne")?.value || 0;

  // Gestion du chargement
  if (loading) {
    return (
      <div className="w-full h-full mx-auto p-4 bg-white rounded shadow flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Chargement des statistiques...</p>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <div className="w-full h-full mx-auto p-4 bg-white rounded shadow flex flex-col items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  // Affichage si pas d'équipements
  if (stats.total === 0) {
    return (
      <div className="w-full h-full mx-auto p-4 bg-white rounded shadow flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun équipement</h3>
          <p className="text-gray-600">Aucun équipement n'a été trouvé dans le système.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mx-auto p-4 bg-white rounded shadow flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h2 className="text-xl font-semibold">Répartition des équipements</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx={CENTER_X}
              cy={CENTER_Y}
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              startAngle={180}
              endAngle={0}
              label={renderLabel}
              labelLine={false}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Needle
              value={needleValue}
              data={chartData}
              cx={CENTER_X}
              cy={CENTER_Y}
              iR={INNER_RADIUS}
              oR={OUTER_RADIUS}
              color="#d0d000"
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12, marginTop: 10 }}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Équipements']}
              labelFormatter={(label) => `Statut: ${label}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center mt-4 space-y-2">
        <p className="text-gray-700 font-medium">
          Total équipements : <span className="font-bold text-blue-600">{stats.total}</span>
        </p>
        
        {/* Détails des statistiques */}
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Fonctionnels: {stats.fonctionnel}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>En panne: {stats.enPanne}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Hors service: {stats.horsService}</span>
          </div>
        </div>

        {/* Taux de fonctionnement */}
        {stats.total > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Taux de fonctionnement: {Math.round((stats.fonctionnel / stats.total) * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentStatusChart;
