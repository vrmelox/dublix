"use client"
import Image from 'next/image';

const Notifications = () => {
    return (
        <div className="bg-white rounded-lg p-4 h-full">
            <div className="flex items-center justify-between ">
                <h1 className="text-xl font-semibold">Notifications</h1>
                <span className='text-xs text-gray-400 cursor-pointer hover:text-gray-600'>Voir tout</span>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                {/* Notification info */}
                <div className="bg-[#A2C8E5] rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-gray-800">Christ Ban a modifié une machine</h2>
                        <span className='text-xs text-gray-500 bg-white rounded-md px-1 py-1'>2025-06-02</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                        Beckman Coulter DxH 800 est en panne.
                    </p>
                </div>
                {/* Notification erreur */}
                <div className="bg-[#F9D6D5] rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-gray-800">Christ Ban a modifié une machine</h2>
                        <span className='text-xs text-gray-500 bg-white rounded-md px-1 py-1'>2025-06-02</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                        Siemens Dimension EXL 200 est opérationnel.
                    </p>
                </div>
                {/* Notification succès */}
                <div className="bg-[#D0E8D0] rounded-md p-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium text-gray-800">Christ Ban a modifié une machine</h2>
                        <span className='text-xs text-gray-500 bg-white rounded-md px-1 py-1'>2025-06-02</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                        L'automate ALERT® VIRTUO est opérationnel.
                    </p>
                </div> 
            </div>
        </div>
    )
}


export default Notifications; 