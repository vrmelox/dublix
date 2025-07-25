'use client';

import Image from "next/image";
import { useState } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { useNotificationCount } from "@/hooks/useNotifications"; // 🔔 Import du hook
import PopUpNotificationCard from "./PopUpNotificationCard";

const Navbar = () => {
    const { user, loading, error } = useUser();
    const { unreadCount, loading: notifLoading } = useNotificationCount(); // 🔔 Utilisation du hook
    const [showNotifications, setShowNotifications] = useState(false);

    console.log(error);

    // Fonction pour capitaliser la première lettre du rôle
    const formatRole = (role: string) => {
        switch (role) {
            case 'ADMINISTRATEUR':
                return 'Administrateur';
            case 'TECHNICIEN':
                return 'Technicien';
            case 'UTILISATEUR':
                return 'Utilisateur';
            default:
                return role;
        }
    };

    // Gérer le clic sur la cloche
    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };

    // Fermer le popup
    const handleCloseNotifications = () => {
        setShowNotifications(false);
    };

    // Callback pour mettre à jour le compteur après une action
    const handleNotificationUpdate = () => {
        // Le hook se recharge automatiquement, mais on peut forcer un refresh si nécessaire
        // useNotificationCount().refetch(); // Si vous exposez cette fonction
    };

    return (
        <div className="flex items-center justify-between p-4 relative">
            {/* SEARCH */}
            <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
                <Image src="/search.png" alt="" width={14} height={14}/>
                <input type="text" placeholder="Entrez une requête..." className="w-[200px] p-2 bg-transparent outline-none"/>
            </div>

            {/* ICONS AND USER */}
            <div className="flex items-center gap-6 justify-end w-full">
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
                    <Image src="/message.png" alt="" width={20} height={20}/>
                </div>

                {/* NOTIFICATION BELL WITH POPUP */}
                <div className="relative">
                    <div
                        className={`bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                            showNotifications
                                ? 'ring-2 ring-purple-500 shadow-lg'
                                : 'hover:shadow-md'
                        } ${notifLoading ? 'opacity-75' : ''}`} // 🔔 Indicateur de chargement
                        onClick={handleNotificationClick}
                    >
                        <Image src="/notification.png" alt="Notifications" width={20} height={20}/>
                        {/* 🔔 Badge de notification avec vraies données */}
                        {unreadCount > 0 && (
                            <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-medium shadow-sm animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                        )}
                        {/* 🔔 Petit loader si les notifications se chargent */}
                        {notifLoading && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 border border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>

                    {/* POPUP NOTIFICATION CARD */}
                    <PopUpNotificationCard
                        isOpen={showNotifications}
                        onClose={handleCloseNotifications}
                        unreadCount={unreadCount} // 🔔 Passer les vraies données
                        onNotificationUpdate={handleNotificationUpdate} // 🔔 Callback pour mise à jour
                    />
                </div>

                {/* USER INFO */}
                <div className="flex flex-col">
                    {loading ? (
                        <>
                            <span className="text-xs leading-3 font-medium text-gray-400">Chargement...</span>
                            <span className="text-[10px] text-right text-gray-400">---</span>
                        </>
                    ) : error ? (
                        <>
                            <span className="text-xs leading-3 font-medium text-red-500">Erreur</span>
                            <span className="text-[10px] text-right text-red-400">{error}</span>
                        </>
                    ) : user ? (
                        <>
                            <span className="text-xs leading-3 font-medium">
                                {user.prenom} {user.nom}
                            </span>
                            <span className="text-[10px] text-right text-gray-500">
                                {formatRole(user.role)}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-xs leading-3 font-medium text-gray-400">Non connecté</span>
                            <span className="text-[10px] text-right text-gray-400">---</span>
                        </>
                    )}
                </div>

                <Image src="/user.png" alt="" width={36} height={36} className="rounded-full"/>
            </div>
        </div>
    )
}

export default Navbar;
