"use client"
import Image from 'next/image';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const events = [
    {
        id: 1,
        title: "Réparation du Cobas 8000 (Roche)",
        time: "12h - 14h",
        description: "Remplacement de la pièce écroulante",
    },
    {
        id: 2,
        title: "Nettoyage du Beckman Coulter DxH",
        time: "12h - 14h",
        description: "Dépoussierage et changement de la lentille",
    },
    {
        id: 3,
        title: "Automate d'hématologie Sysmex XN",
        time: "12h - 14h",
        description: "Installation de l'appareil",
    },
]

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <style jsx global>{`
                .react-calendar {
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    box-shadow: none;
                }
                
                .react-calendar__tile {
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                
                .react-calendar__tile:hover {
                    background: #e2e8f0;
                }
                
                .react-calendar__tile--active {
                    background: #3b82f6;
                    border-radius: 8px;
                }
                
                .react-calendar__navigation button {
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                
                .react-calendar__navigation button:hover {
                    background: #e2e8f0;
                }
            `}</style>
            
            <Calendar onChange={onChange} value={value} />
            
            <div className="flex items-center justify-between">
                <h1 className='text-xl font-semibold my-4'>Evènements</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20}/>
            </div>
            
            <div className="flex flex-col gap-4">
                {events.map((even) => (
                    <div className="p-5 rounded-xl border-2 border-gray-100 border-t-4 odd:border-t-benSky even:border-t-bensPurple hover:shadow-md transition-shadow duration-200" key={even.id}>
                        <div className="flex items-center justify-between">
                            <h1 className="font-semibold text-gray-600">{even.title}</h1>
                            <span className="text-gray-300 text-xs">{even.time}</span>
                        </div>
                        <p className="mt-2 text-gray-400 text-sm">{even.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EventCalendar;