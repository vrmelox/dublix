"use client"

import { useState, useEffect } from "react";
import EquipmentPage from "@/components/EquipmentPage";
import SignalerPanne from "@/components/SignalerPanne";
import { useParams } from "next/navigation";

// Interface pour les données d'équipement (adaptée à votre API)
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
    serviceNames?: string[]; // Services multiples
    allServices?: Array<{
        id: string;
        nom: string;
        description?: string;
    }>;
    createurUtilisateur?: {
        nom: string;
        prenom: string;
    };
}

// Interface adaptée pour vos composants existants
interface EquiProps {
    equipId: string;
    nom: string;
    modèle: string;
    services: string[];
    photo: string;
    qrcode?: string;
    // Champs supplémentaires
    marque?: string;
    numeroSerie?: string;
    numeroInventaire?: string;
    typeMateriel?: string;
    description?: string;
    anneeFabrication?: number;
    statut?: string;
    dateInstallation?: string;
    dateDerniereIntervention?: string;
    service?: {
        nom: string;
    };
}

const EquipmentID = () => {
    const params = useParams();
    const equipId = params?.id as string;

    const [equipment, setEquipment] = useState<EquipmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    // Fonction pour récupérer l'équipement par ID
    const fetchEquipment = async () => {
        if (!equipId) {
            setError("ID d'équipement manquant");
            setLoading(false);
            return;
        }

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

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';
            const response = await fetch(`${API_BASE_URL}/api/equipments/${equipId}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Équipement introuvable");
                } else if (response.status === 401) {
                    throw new Error("Non autorisé - veuillez vous reconnecter");
                } else {
                    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                }
            }

            const result = await response.json();

            if (result.success && result.equipement) {
                setEquipment(result.equipement);
            } else if (result.equipement) {
                // Si l'API retourne directement l'équipement
                setEquipment(result.equipement);
            } else {
                throw new Error("Format de réponse inattendu");
            }

        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            // Ligne à ajouter après la récupération des données
            console.log("🔍 DONNÉES ÉQUIPEMENT COMPLÈTES:", result);
            console.log("🔍 QR CODE REÇU:", result.equipement?.qrcode);
            setError(error instanceof Error ? error.message : "Erreur inconnue");
            setEquipment(null);
        } finally {
            setLoading(false);
        }
    };

    // Récupérer l'équipement au chargement
    useEffect(() => {
        fetchEquipment();
    }, [equipId]);

    // Transformer les données pour les composants existants
    const selectedEquip: EquiProps | null = equipment ? {
        equipId: equipment.id,
        nom: equipment.nom,
        modèle: equipment.modele,
        // Utiliser serviceNames en priorité, puis fallback
        services: equipment.serviceNames && equipment.serviceNames.length > 0
            ? equipment.serviceNames
            : equipment.service
                ? [equipment.service.nom]
                : [equipment.typeMateriel || 'Non spécifié'],
        photo: equipment.photo, // 🔧 SANS le "/" au début
        qrcode: equipment.qrcode, // 🔧 SANS le "/" au début
        // Ajouter tous les champs manquants
        marque: equipment.marque,
        numeroSerie: equipment.numeroSerie,
        numeroInventaire: equipment.numeroInventaire,
        typeMateriel: equipment.typeMateriel,
        description: equipment.presentation, // presentation → description
        anneeFabrication: equipment.anneeFabrication,
        statut: equipment.statut,
        dateInstallation: equipment.dateInstallation,
        dateDerniereIntervention: equipment.dateDerniereIntervention,
        service: equipment.service
    } : null;

    // Affichage pendant le chargement
    if (loading) {
        return (
            <div className="m-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement de l'équipement...</p>
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
                    <div className="flex gap-2">
                        <button
                            onClick={fetchEquipment}
                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                        >
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Affichage si équipement introuvable
    if (!selectedEquip) {
        return (
            <div className="m-6">
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-1.004-5.927-2.709" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Équipement introuvable</h2>
                    <p className="text-gray-500 mb-6">L'équipement demandé n'existe pas ou a été supprimé.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    // Affichage normal avec les données
    return (
        <div className="m-6">
            <EquipmentPage equipement={selectedEquip} />
            <SignalerPanne
                equipmentName={selectedEquip.nom}
                equipmentId={selectedEquip.equipId}
            />
        </div>
    );
};

export default EquipmentID;
