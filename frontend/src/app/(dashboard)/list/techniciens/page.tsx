"use client"

import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import PopUpAjouterPersonne from "@/components/PopUpAjouterPersonne"
import { useUser } from "@/app/contexts/UserContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUserCog } from "@fortawesome/free-solid-svg-icons";

// 🔧 Configuration API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

// 🆕 Type technicien basé sur l'API
type ApiTechnician = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    telephone?: string;
    adresse?: string;
    actif: boolean;
    dateCreation: string;
    _count: {
        equipementsCreés: number;
        interventionsRealisées: number;
        servicesResponsables: number;
    };
}

// Type pour l'affichage (adapté de votre structure existante)
type DisplayTechnician = {
    id: string;
    technicianId: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    address: string;
    interventionsCount: number;
}

const columns = [
    {
        header: "Info",
        accessor: "info"
    },
    {
        header: "ID Technicien",
        accessor: "technicianId",
        className: "hidden md:table-cell",
    },
    {
        header: "Statut",
        accessor: "status",
        className: "hidden md:table-cell",
    },
    {
        header: "Contact",
        accessor: "phone",
        className: "hidden lg:table-cell",
    },
    {
        header: "Adresse",
        accessor: "address",
        className: "hidden lg:table-cell",
    },
    {
        header: "Interventions",
        accessor: "interventions",
        className: "hidden lg:table-cell",
    },
    {
        header: "Actions",
        accessor: "actions",
    },
];

const TechnicianListPage = () => {
    const user = useUser();
    const role = user.user?.role;

    // 🆕 États pour les données API
    const [technicians, setTechnicians] = useState<ApiTechnician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // États existants
    const [showPopup, setShowPopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 🆕 Fonction pour récupérer les techniciens
    const fetchTechnicians = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token manquant');
            }

            // 🎯 Récupérer uniquement les utilisateurs avec le rôle TECHNICIEN
            const response = await fetch(`${API_BASE_URL}/api/users/role/TECHNICIEN?actif=true`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🔧 Techniciens récupérés:', data);

            setTechnicians(data.utilisateurs || []);

        } catch (err) {
            console.error('💥 Erreur lors de la récupération des techniciens:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    // 🆕 Charger les données au montage du composant
    useEffect(() => {
        fetchTechnicians();
    }, []);

    // 🆕 Convertir les données API vers le format d'affichage
    const displayTechnicians: DisplayTechnician[] = useMemo(() => {
        return technicians
            .filter(apiTechnician =>
                searchTerm === "" ||
                apiTechnician.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apiTechnician.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apiTechnician.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(apiTechnician => ({
                id: apiTechnician.id,
                technicianId: apiTechnician.id.slice(-8), // Afficher les 8 derniers caractères de l'ID
                name: `${apiTechnician.prenom} ${apiTechnician.nom}`,
                email: apiTechnician.email,
                phone: apiTechnician.telephone || "Non renseigné",
                status: apiTechnician.actif ? "Actif" : "Inactif",
                address: apiTechnician.adresse || "Non renseignée",
                interventionsCount: apiTechnician._count?.interventionsRealisées || 0
            }));
    }, [technicians, searchTerm]);

    // Calcul des données paginées
    const { paginatedData, totalPages } = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedData = displayTechnicians.slice(startIndex, endIndex);
        const totalPages = Math.ceil(displayTechnicians.length / itemsPerPage);

        return { paginatedData, totalPages };
    }, [displayTechnicians, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // 🆕 Gestionnaire de recherche
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Retour à la première page lors d'une recherche
    };

    // 🆕 Fonction de suppression
    const handleDelete = async (technicianId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce technicien ?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/users/${technicianId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Recharger les données après suppression
                fetchTechnicians();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        }
    };

    // 🆕 Rendu des cartes mobiles
    const renderCard = (item: DisplayTechnician) => (
        <div
            key={item.id}
            className="md:hidden bg-white shadow rounded-md p-4 mb-4 border border-gray-200"
        >
            <div className="flex items-center gap-4 mb-2">
                {/* 🎨 Icône FontAwesome pour les techniciens */}
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon
                        icon={faUserCog}
                        className="text-orange-600 text-lg"
                    />
                </div>
                <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </div>
            <div className="text-sm text-gray-700 space-y-1 mb-3">
                <p>
                    <span className="font-semibold">ID: </span>
                    {item.technicianId}
                </p>
                <p>
                    <span className="font-semibold">Statut: </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Actif'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {item.status}
                    </span>
                </p>
                <p>
                    <span className="font-semibold">Téléphone: </span>
                    {item.phone}
                </p>
                <p>
                    <span className="font-semibold">Adresse: </span>
                    {item.address}
                </p>
                <p>
                    <span className="font-semibold">Interventions: </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {item.interventionsCount}
                    </span>
                </p>
            </div>
            <div className="flex gap-3">
                <Link href={`/list/technicians/${item.id}`}>
                    <button className="flex items-center justify-center rounded-full bg-benSky w-8 h-8">
                        <Image src="/view.png" alt="Voir" width={16} height={16} />
                    </button>
                </Link>
                {role === "ADMINISTRATEUR" && (
                    <button 
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 w-8 h-8"
                    >
                        <Image src="/delete.png" alt="Supprimer" width={16} height={16} />
                    </button>
                )}
            </div>
        </div>
    );

    const renderRow = (item: DisplayTechnician) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-bensPurpleLight"
        >
            <td className="flex items-center gap-4 p-4">
                {/* 🎨 Icône FontAwesome au lieu de la photo */}
                <div className="md:hidden xl:block w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <FontAwesomeIcon
                        icon={faUserCog}
                        className="text-orange-600 text-lg"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.technicianId}</td>
            <td className="hidden md:table-cell">
                <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'Actif'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {item.status}
                </span>
            </td>
            <td className="hidden lg:table-cell">{item.phone}</td>
            <td className="hidden lg:table-cell">{item.address}</td>
            <td className="hidden lg:table-cell">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {item.interventionsCount} intervention{item.interventionsCount > 1 ? 's' : ''}
                </span>
            </td>
            <td className="">
                <div className="flex items-center gap-2">
                    <Link href={`/list/technicians/${item.id}`}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-benSky">
                            <Image src="/view.png" alt="" width={16} height={16}/>
                        </button>
                    </Link>
                    {role === "ADMINISTRATEUR" && (
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
                        >
                            <Image src="/delete.png" alt="" width={16} height={16}/>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    // 🆕 Affichage conditionnel basé sur l'état de chargement
    if (loading) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Chargement des techniciens...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
                <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">
                        <p className="text-lg mb-2">Erreur lors du chargement</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchTechnicians}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">
                    Liste des techniciens ({displayTechnicians.length} total)
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch onSearch={handleSearch} />
                    <div className="flex items-center gap-4 self-end">
                        <button
                            onClick={fetchTechnicians}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow hover:bg-yellow-400"
                            title="Actualiser"
                        >
                            <Image src="/filter.png" alt="" height={14} width={14}/>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow">
                            <Image src="/sort.png" alt="" height={14} width={14}/>
                        </button>
                        {role === "ADMINISTRATEUR" && (
                            <button
                                onClick={() => setShowPopup(true)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow cursor-pointer hover:bg-yellow-400"
                                aria-label="Ajouter un technicien"
                            >
                                <Image src="/plus.png" alt="Ajouter" height={20} width={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MESSAGE SI AUCUN TECHNICIEN */}
            {displayTechnicians.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500">
                    {searchTerm ?
                        `Aucun technicien trouvé pour "${searchTerm}"` :
                        "Aucun technicien trouvé"
                    }
                </div>
            ) : (
                <>
                    {/* MOBILE LISTE CARTES */}
                    <div className="md:hidden mt-6">
                        {paginatedData.map(renderCard)}
                    </div>

                    {/* TABLEAU DESKTOP */}
                    <div className="hidden md:block mt-6">
                        <Table columns={columns} renderRow={renderRow} data={paginatedData} />
                    </div>

                    {/* PAGINATION */}
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            {/* POPUP AJOUT */}
            <PopUpAjouterPersonne
                open={showPopup}
                onClose={() => setShowPopup(false)}
                onUserAdded={fetchTechnicians} // Recharger après ajout
            />
        </div>
    );
};

export default TechnicianListPage;
