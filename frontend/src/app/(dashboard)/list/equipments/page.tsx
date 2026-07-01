"use client"

import { useState, useMemo, useEffect } from "react";
import EquipementCard from "@/components/EquipmentCard";
import PopUpAjouterEquipement from "@/components/PopUpAjouterEquipement";
import Pagination from "@/components/Pagination";
import { useUser } from "@/app/contexts/UserContext";

// Interface basée sur votre schéma Prisma
interface EquipmentData {
    id: string;
    nom: string;
    modele: string;
    marque: string;
    numeroSerie: string;
    numeroInventaire?: string;
    typeMateriel?: string;
    presentation: string;
    serviceId?: string;
    anneeFabrication: number;
    statut: "FONCTIONNEL" | "EN_PANNE" | "HORS_SERVICE";
    dateAjout: string;
    dateInstallation: string;
    dateDerniereIntervention: string;
    nombreExemplaires: number;
    photo: string;
    lien: string;
    qrcode: string;
    createdBy: string;
    updatedBy: string;
    dateModification: string;
    service?: {
        id: string;
        nom: string;
        description?: string;
    };
    serviceNames?: string[]; // 🆕 Services multiples
    allServices?: Array<{   // 🆕 Détails des services
        id: string;
        nom: string;
        description?: string;
    }>;
    createurUtilisateur?: {
        nom: string;
        prenom: string;
    };
}

const ListEquipementPage = () => {
    const user = useUser();
    const role = user.user?.role;

    // États pour les données
    const [equipments, setEquipments] = useState<EquipmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour le filtrage et la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalEquipments, setTotalEquipments] = useState(0);
    const itemsPerPage = 12; // Nombre d'éléments par page

    // Fonction pour récupérer le token d'authentification
    const getAuthToken = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token') ||
                localStorage.getItem('authToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('authToken');
        }
        return null;
    };

    // 🆕 Extraire les services uniques depuis les équipements
    const availableServices = useMemo(() => {
        const servicesSet = new Set<string>();

        equipments.forEach(equipment => {
            // Récupérer les services depuis serviceNames (priorité)
            if (equipment.serviceNames && equipment.serviceNames.length > 0) {
                equipment.serviceNames.forEach(serviceName => {
                    if (serviceName && serviceName.trim()) {
                        servicesSet.add(serviceName.trim());
                    }
                });
            }
            // Fallback sur l'ancien service
            else if (equipment.service?.nom) {
                servicesSet.add(equipment.service.nom.trim());
            }
            // Fallback sur le type de matériel
            else if (equipment.typeMateriel) {
                servicesSet.add(equipment.typeMateriel.trim());
            }
        });

        // Convertir en array et trier alphabétiquement
        return Array.from(servicesSet).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
    }, [equipments]);

    // Fonction pour récupérer les équipements
    const fetchEquipments = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getAuthToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            };

            // Ajouter le token si disponible
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Construire les paramètres de requête
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            console.log(`🔍 Récupération des équipements - Page ${currentPage}...`);

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';
            const response = await fetch(`${API_BASE_URL}/api/equipments?${params}`, {
                method: 'GET',
                headers
            });

            console.log('📡 Réponse reçue:', response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Non autorisé - veuillez vous reconnecter");
                } else {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
            }

            const result = await response.json();
            console.log('📄 Données reçues:', result);

            if (result.success && result.equipements) {
                setEquipments(result.equipements);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotalEquipments(result.pagination?.total || result.equipements.length);
            } else if (result.equipements) {
                // Si l'API retourne directement les équipements
                setEquipments(result.equipements);
                setTotalPages(result.pagination?.totalPages || 1);
                setTotalEquipments(result.pagination?.total || result.equipements.length);
            } else {
                throw new Error("Format de réponse inattendu");
            }

        } catch (error) {
            console.error('💥 Erreur lors de la récupération:', error);
            setError(error instanceof Error ? error.message : "Erreur inconnue");
            setEquipments([]);
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les données au chargement et lors des changements
    useEffect(() => {
        fetchEquipments();
    }, [currentPage, searchTerm]);

    // 🆕 Filtrer les équipements par service sélectionné
    const filteredEquipments = useMemo(() => {
        if (!selectedCategory) return equipments;

        return equipments.filter(equipment => {
            // Filtrer par les nouveaux serviceNames (priorité)
            if (equipment.serviceNames && equipment.serviceNames.length > 0) {
                return equipment.serviceNames.some(serviceName =>
                    serviceName.toLowerCase().includes(selectedCategory.toLowerCase())
                );
            }
            // Fallback sur l'ancien service
            if (equipment.service?.nom) {
                return equipment.service.nom.toLowerCase().includes(selectedCategory.toLowerCase());
            }
            // Fallback sur le type de matériel
            if (equipment.typeMateriel) {
                return equipment.typeMateriel.toLowerCase().includes(selectedCategory.toLowerCase());
            }
            return false;
        });
    }, [equipments, selectedCategory]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(selectedCategory === category ? null : category);
        setCurrentPage(1); // Reset à la première page
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset à la première page
    };

    // Fonction appelée après ajout d'équipement pour rafraîchir la liste
    const handleEquipmentAdded = () => {
        fetchEquipments();
    };

    // Affichage pendant le chargement
    if (loading) {
        return (
            <div className="m-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des équipements...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage en cas d'erreur
    if (error) {
        return (
            <div className="m-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Erreur</h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            fetchEquipments();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors w-full"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="m-6">
            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Rechercher un équipement..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {role && ["ADMINISTRATEUR", "TECHNICIEN"].includes(role) && (
                        <PopUpAjouterEquipement onEquipmentAdded={handleEquipmentAdded} />
                    )}
                </div>
            </div>

            {/* 🆕 Category Filter Section - Services extraits des équipements */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-[#333652]">
                        Filtrer par service
                    </h2>
                    <span className="text-sm text-gray-500">
                        ({availableServices.length} service{availableServices.length > 1 ? 's' : ''} disponible{availableServices.length > 1 ? 's' : ''})
                    </span>
                </div>

                {availableServices.length > 0 ? (
                    <div className="w-full flex flex-wrap gap-3 py-4 px-2 text-[#333652]">
                        {availableServices.map((serviceName) => (
                            <button
                                key={serviceName}
                                onClick={() => handleCategoryClick(serviceName)}
                                className={`px-4 py-2 cursor-pointer text-sm rounded-full shadow-sm transition duration-200 ease-in-out hover:shadow-md hover:scale-[1.03] font-medium ${selectedCategory === serviceName
                                        ? "bg-[#F3E1C0] text-[#333652] shadow-md scale-[1.03]"
                                        : "bg-[#F5F5F5] hover:bg-[#F3E1C0]"
                                    }`}
                            >
                                {serviceName}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        {loading ? (
                            "Chargement des services..."
                        ) : equipments.length === 0 ? (
                            "Aucun service disponible - aucun équipement trouvé"
                        ) : (
                            "Aucun service détecté"
                        )}
                    </div>
                )}

                {/* Clear Filter Button */}
                {selectedCategory && (
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        Effacer le filtre
                    </button>
                )}
            </div>

            {/* Equipment Grid Section */}
            <div className="mb-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-[#333652]">
                        {selectedCategory ? `Équipements - ${selectedCategory}` : "Tous les équipements"}
                    </h2>
                    <span className="text-sm text-gray-500">
                        {selectedCategory
                            ? `${filteredEquipments.length} équipement${filteredEquipments.length > 1 ? 's' : ''} filtré${filteredEquipments.length > 1 ? 's' : ''}`
                            : `${totalEquipments} équipement${totalEquipments > 1 ? 's' : ''} au total`
                        }
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEquipments.length > 0 ? (
                        filteredEquipments.map((equipment) => (
                            <EquipementCard
                                key={equipment.id}
                                equipement={{
                                    equipId: equipment.id,
                                    nom: equipment.nom,
                                    modèle: equipment.modele,
                                    // 🆕 Utiliser serviceNames en priorité, puis fallback
                                    services: equipment.serviceNames && equipment.serviceNames.length > 0
                                        ? equipment.serviceNames
                                        : equipment.service
                                            ? [equipment.service.nom]
                                            : [equipment.typeMateriel || 'Non spécifié'],
                                    photo: `/${equipment.photo}`,
                                    qrcode: `/${equipment.qrcode}`
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {selectedCategory
                                ? `Aucun équipement trouvé dans le service "${selectedCategory}"`
                                : searchTerm
                                    ? `Aucun équipement trouvé pour "${searchTerm}"`
                                    : "Aucun équipement disponible"
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination - seulement si pas de filtre de catégorie */}
            {!selectedCategory && totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default ListEquipementPage;
