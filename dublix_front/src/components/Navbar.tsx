'use client';

import Image from "next/image";
import { useUser } from "@/app/contexts/UserContext";

const Navbar = () => {
    const { user, loading, error } = useUser();
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

    return (
        <div className="flex items-center justify-between p-4">
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
                <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
                    <Image src="/notification.png" alt="" width={20} height={20}/>
                    <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">1</div>
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

export default Navbar