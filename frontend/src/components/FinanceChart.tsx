"use client"
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyInterventionsData {
  month: string;
  panne: number;
  réparation: number;
}

interface FinanceChartProps {
  data?: MonthlyInterventionsData[];
}

// Données de fallback si aucune donnée n'est fournie
const defaultData = [
  {
    month: 'Janvier',
    panne: 4,
    réparation: 8,
  },
  {
    month: 'Février',
    panne: 3,
    réparation: 6,
  },
  {
    month: 'Mars',
    panne: 2,
    réparation: 12,
  },
  {
    month: 'Avril',
    panne: 5,
    réparation: 9,
  },
  {
    month: 'Mai',
    panne: 2,
    réparation: 7,
  },
  {
    month: 'Juin',
    panne: 4,
    réparation: 8,
  },
  {
    month: 'Juillet',
    panne: 6,
    réparation: 11,
  },
  {
    month: 'Août',
    panne: 3,
    réparation: 10,
  },
  {
    month: 'Septembre',
    panne: 4,
    réparation: 9,
  },
  {
    month: 'Octobre',
    panne: 2,
    réparation: 8,
  },
  {
    month: 'Novembre',
    panne: 3,
    réparation: 7,
  },
  {
    month: 'Décembre',
    panne: 5,
    réparation: 12,
  },
];

const FinanceChart: React.FC<FinanceChartProps> = ({ data }) => {
    // Utiliser les données fournies ou les données par défaut
    const chartData = data && data.length > 0 ? data : defaultData;
    
    // Calculer les totaux pour affichage
    const totalPannes = chartData.reduce((sum, item) => sum + item.panne, 0);
    const totalReparations = chartData.reduce((sum, item) => sum + item.réparation, 0);
    const totalInterventions = totalPannes + totalReparations;

    return (
        <div className="bg-white rounded-xl p-6 h-full shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className='text-xl font-bold text-gray-800'>Interventions mensuelles</h1>
                    {data && data.length > 0 && (
                        <p className="text-sm text-gray-600">
                            Total année: {totalInterventions} interventions ({totalReparations} réparations, {totalPannes} signalements)
                        </p>
                    )}
                </div>
                <Image
                    src="/moreDark.png"
                    alt='Options'
                    width={20}
                    height={20}
                />
            </div>

            {/* Message si pas de données */}
            {(!data || data.length === 0) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                        ⚠️ Données d'exemple affichées - Connectez à l'API pour voir les vraies données
                    </p>
                </div>
            )}

            <ResponsiveContainer width="100%" height="85%">
                <LineChart
                    width={500}
                    height={300}
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke='#e5e7eb' />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tick={{fill:"#374151", fontSize: 12}}
                        tickLine={false}
                        tickMargin={10}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        axisLine={false}
                        tick={{fill:"#374151", fontSize: 12}}
                        tickLine={false}
                        tickMargin={15}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius:"12px",
                            borderColor:"#e5e7eb",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        formatter={(value, name) => [
                            `${value} intervention${value > 1 ? 's' : ''}`,
                            name === 'panne' ? 'Signalements de panne' : 'Réparations'
                        ]}
                        labelFormatter={(label) => `Mois: ${label}`}
                    />
                    <Legend
                        align='center'
                        verticalAlign='top'
                        wrapperStyle={{paddingTop: "10px", paddingBottom:"30px"}}
                        formatter={(value) => 
                            value === 'panne' ? 'Signalements de panne' : 'Réparations'
                        }
                    />
                    <Line
                        type="monotone"
                        dataKey="panne"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                        name="panne"
                    />
                    <Line
                        type="monotone"
                        dataKey="réparation"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                        name="réparation"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default FinanceChart;
