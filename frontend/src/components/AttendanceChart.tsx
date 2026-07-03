"use client"
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AttendanceChartData {
    service: string;
    disponible: number;
    panne: number;
}

interface AttendanceChartProps {
    data?: AttendanceChartData[];
}

// Données de fallback si aucune donnée n'est fournie
const defaultData = [
    {
        service: 'Cardiologie',
        disponible: 75,
        panne: 31,
    },
    {
        service: 'Neurologie',
        disponible: 72,
        panne: 10,
    },
    {
        service: 'Oncologie',
        disponible: 72,
        panne: 25,
    },
    {
        service: 'Endocrinologie',
        disponible: 76,
        panne: 41,
    },
    {
        service: 'Pédiatrie',
        disponible: 75,
        panne: 15,
    },
];

const AttendanceChart: React.FC<AttendanceChartProps> = ({ data }) => {
    // Utiliser les données fournies ou les données par défaut
    const chartData = data && data.length > 0 ? data : defaultData;

    // Calculer les totaux pour affichage
    const totalDisponible = chartData.reduce((sum, item) => sum + item.disponible, 0);
    const totalPanne = chartData.reduce((sum, item) => sum + item.panne, 0);
    const total = totalDisponible + totalPanne;

    return (
        <div className="bg-white rounded-xl p-6 h-full shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className='text-xl font-bold text-gray-800'>Disponibilité par service</h1>
                    {data && data.length > 0 && (
                        <p className="text-sm text-gray-600">
                            Total: {total} équipements ({totalDisponible} disponibles, {totalPanne} en panne)
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


            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    width={500}
                    height={300}
                    data={chartData}
                    barSize={24}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="service"
                        axisLine={false}
                        tick={{ fill: "#374151", fontSize: 12 }}
                        tickLine={false}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        axisLine={false}
                        tick={{ fill: "#374151", fontSize: 12 }}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            borderColor: "#e5e7eb",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}
                        formatter={(value, name) => [
                            `${value} équipement${Number(value) > 1 ? 's' : ''}`,
                            name === 'disponible' ? 'Disponibles' : 'En panne'
                        ]}
                        labelFormatter={(label) => `Service: ${label}`}
                    />
                    <Legend
                        align='left'
                        verticalAlign='top'
                        wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
                        formatter={(value) =>
                            value === 'disponible' ? 'Disponibles' : 'En panne'
                        }
                    />
                    <Bar
                        dataKey="disponible"
                        fill="#10b981"
                        legendType='circle'
                        radius={[6, 6, 0, 0]}
                        name="disponible"
                    />
                    <Bar
                        dataKey="panne"
                        fill="#f59e0b"
                        legendType='circle'
                        radius={[6, 6, 0, 0]}
                        name="panne"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default AttendanceChart;
