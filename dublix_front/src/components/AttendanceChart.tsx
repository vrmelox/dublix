"use client"
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Cardiologie',
    disponible: 75,
    panne: 31,
  },
  {
    name: 'Neurologie',
    disponible: 72,
    panne: 10,
  },
  {
    name: 'Oncologie',
    disponible: 72,
    panne: 25,
  },
  {
    name: 'Endocrinologie',
    disponible: 76,
    panne: 41,
  },
  {
    name: 'Pédiatrie',
    disponible: 75,
    panne: 15,
  },
];

const AttendanceChart = () => {
    return (
        <div className="bg-white rounded-xl p-6 h-full shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className='text-xl font-bold text-gray-800'>Disponibilité par service</h1>
                <Image
                    src="/moreDark.png"
                    alt=''
                    width={20}
                    height={20}
                />
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                width={500}
                height={300}
                data={data}
                barSize={24}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                <XAxis dataKey="name" axisLine={false} tick={{fill:"#374151", fontSize: 12}} tickLine={false}/>
                <YAxis axisLine={false} tick={{fill:"#374151", fontSize: 12}} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:"12px", borderColor:"#e5e7eb", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"}}/>
                <Legend
                    align='left'
                    verticalAlign='top'
                    wrapperStyle={{paddingTop: "20px", paddingBottom:"40px"}}
                />
                <Bar
                    dataKey="disponible"
                    fill="#3b82f6"
                    legendType='circle'
                    radius={[6,6,0,0]}
                />
                <Bar
                    dataKey="panne"
                    fill="#f59e0b"
                    legendType='circle'
                    radius={[6,6,0,0]}
                />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default AttendanceChart;