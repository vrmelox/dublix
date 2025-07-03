"use client"
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Janvier',
    panne: 4000,
    réparation: 2400,
  },
  {
    name: 'Février',
    panne: 3000,
    réparation: 1398,
  },
  {
    name: 'Mars',
    panne: 2000,
    réparation: 9800,
  },
  {
    name: 'Avril',
    panne: 2780,
    réparation: 3908,
  },
  {
    name: 'Mai',
    panne: 1890,
    réparation: 4800,
  },
  {
    name: 'Juin',
    panne: 2390,
    réparation: 3800,
  },
  {
    name: 'Juillet',
    panne: 3490,
    réparation: 4300,
  },
  {
    name: 'Aout',
    panne: 2000,
    réparation: 9800,
  },
  {
    name: 'Septem',
    panne: 2780,
    réparation: 3908,
  },
  {
    name: 'Octob',
    panne: 1890,
    réparation: 4800,
  },
  {
    name: 'Novem',
    panne: 2390,
    réparation: 3800,
  },
  {
    name: 'Décem',
    panne: 3490,
    réparation: 4300,
  },
];

const FinanceChart = () => {
    return (
        <div className="bg-white rounded-xl p-6 h-full shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className='text-xl font-bold text-gray-800'>Maintenances</h1>
                <Image
                    src="/moreDark.png"
                    alt=''
                    width={20}
                    height={20}
                />
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke='#e5e7eb' />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tick={{fill:"#374151", fontSize: 12}}
                    tickLine={false}
                    tickMargin={10}
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
                />
                <Legend
                    align='center'
                    verticalAlign='top'
                    wrapperStyle={{paddingTop: "10px", paddingBottom:"30px"}}
                />
                <Line
                    type="monotone"
                    dataKey="panne"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
                <Line
                    type="monotone"
                    dataKey="réparation"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default FinanceChart;