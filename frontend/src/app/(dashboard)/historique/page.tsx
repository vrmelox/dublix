"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useUser } from "@/app/contexts/UserContext"
import ViewHistorique from "@/components/ViewHistorique"
import { 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Check
} from 'lucide-react'

// Types pour l'API
interface Equipement {
  nom: string;
  modele: string;
  numeroSerie: string;
}

interface Utilisateur {
  nom: string;
  prenom: string;
  email?: string;
}

interface Intervention {
  id: string;
  equipementId: string;
  dateSignalement: string;
  dateIntervention: string | null;
  signalePar: string | null;
  intervenantId: string | null;
  typeIntervention: 'MAINTENANCE' | 'REPARATION' | 'INSPECTION' | null;
  pannesSignalees: string | null;
  pannesConstatees: string | null;
  diagnosticsPoses: string | null;
  piecesRechange: string | null;
  statutApresIntervention: string | null;
  conclusions: string | null;
  interventionValidee: boolean;
  valideeParId: string | null;
  dateCreation: string;
  dateModification: string;
  equipement: Equipement;
  signalantUtilisateur: Utilisateur | null;
  intervenantUtilisateur: Utilisateur | null;
  validateurUtilisateur: Utilisateur | null;
}

interface ApiResponse {
  interventions: Intervention[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Types pour les filtres
type StatutFilter = "TOUS" | "VALIDE" | "NON_VALIDE" | "EN_ATTENTE"
type TypeFilter = "TOUS" | "REPARATION" | "INSPECTION" | "MAINTENANCE"
type SortOption = "DATE_DESC" | "DATE_ASC" | "EQUIPEMENT" | "TYPE"

const Historique = () => {
  const { user } = useUser();
  const isAdmin = user?.role === 'ADMINISTRATEUR';

  // États pour les données
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validatingIds, setValidatingIds] = useState<Set<string>>(new Set());

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("TOUS")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("TOUS")
  const [sortOption, setSortOption] = useState<SortOption>("DATE_DESC")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 6

  // Configuration API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

  // Fonction pour récupérer les interventions
  const fetchInterventions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      // Construction des paramètres de requête
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      // Ajout des filtres API si nécessaire
      if (typeFilter !== 'TOUS') {
        params.append('typeIntervention', typeFilter);
      }

      if (statutFilter === 'VALIDE') {
        params.append('validees', 'true');
      } else if (statutFilter === 'NON_VALIDE') {
        params.append('validees', 'false');
      }

      console.log('📡 Récupération des interventions:', params.toString());

      const response = await fetch(`${API_BASE_URL}/api/interventions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      setInterventions(data.interventions);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);

      console.log('✅ Interventions récupérées:', data.interventions.length);

    } catch (err) {
      console.error('💥 Erreur récupération interventions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [currentPage, typeFilter, statutFilter, API_BASE_URL]);

  // Fonction pour valider une intervention
  const validateIntervention = async (interventionId: string) => {
    if (!isAdmin) return;

    try {
      setValidatingIds(prev => new Set([...prev, interventionId]));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token manquant');
      }

      const response = await fetch(`${API_BASE_URL}/api/interventions/${interventionId}/validate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Intervention validée:', result);

      // Mettre à jour localement
      setInterventions(prev => 
        prev.map(intervention => 
          intervention.id === interventionId 
            ? { ...intervention, interventionValidee: true, valideeParId: user?.id || null }
            : intervention
        )
      );

    } catch (err) {
      console.error('💥 Erreur validation intervention:', err);
      alert('Erreur lors de la validation: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setValidatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(interventionId);
        return newSet;
      });
    }
  };

  // Chargement initial et rechargement lors des changements de filtres
  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  // Filtrage côté client pour la recherche textuelle et EN_ATTENTE
  const filteredInterventions = useMemo(() => {
    let filtered = interventions;

    // Filtrage par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(intervention => 
        intervention.equipement.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.equipement.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.equipement.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.pannesSignalees?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.pannesConstatees?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.diagnosticsPoses?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.conclusions?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage EN_ATTENTE (interventions sans date d'intervention)
    if (statutFilter === 'EN_ATTENTE') {
      filtered = filtered.filter(intervention => !intervention.dateIntervention);
    }

    // Tri côté client
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "DATE_DESC":
          const dateA = new Date(a.dateIntervention || a.dateSignalement || "1970-01-01");
          const dateB = new Date(b.dateIntervention || b.dateSignalement || "1970-01-01");
          return dateB.getTime() - dateA.getTime();

        case "DATE_ASC":
          const dateA2 = new Date(a.dateIntervention || a.dateSignalement || "1970-01-01");
          const dateB2 = new Date(b.dateIntervention || b.dateSignalement || "1970-01-01");
          return dateA2.getTime() - dateB2.getTime();

        case "EQUIPEMENT":
          return a.equipement.nom.localeCompare(b.equipement.nom);

        case "TYPE":
          return (a.typeIntervention || "").localeCompare(b.typeIntervention || "");

        default:
          return 0;
      }
    });

    return filtered;
  }, [interventions, searchTerm, statutFilter, sortOption]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = totalCount;
    const enCours = interventions.filter(h => !h.dateIntervention).length;
    const valides = interventions.filter(h => h.interventionValidee && h.dateIntervention).length;
    const nonValides = interventions.filter(h => !h.interventionValidee && h.dateIntervention).length;

    return { total, enCours, valides, nonValides };
  }, [interventions, totalCount]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatutFilter("TOUS");
    setTypeFilter("TOUS");
    setSortOption("DATE_DESC");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchInterventions();
  };

  // Gestion du chargement
  if (loading && interventions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error && interventions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Historique des Interventions
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Consultez et gérez l'historique
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-semibold text-orange-600">{stats.enCours}</p>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Validées</p>
                <p className="text-2xl font-semibold text-green-600">{stats.valides}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Non validées</p>
                <p className="text-2xl font-semibold text-red-600">{stats.nonValides}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        {/* Barre de filtres et recherche */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <input
                id="search"
                type="text"
                placeholder="Équipement, panne, diagnostic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtre par statut */}
            <div>
              <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="statut"
                value={statutFilter}
                onChange={(e) => {
                  setStatutFilter(e.target.value as StatutFilter);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TOUS">Tous</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validées</option>
                <option value="NON_VALIDE">Non validées</option>
              </select>
            </div>

            {/* Filtre par type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as TypeFilter);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TOUS">Tous</option>
                <option value="REPARATION">Réparation</option>
                <option value="INSPECTION">Inspection</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            {/* Tri */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Trier par
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DATE_DESC">Plus récent</option>
                <option value="DATE_ASC">Plus ancien</option>
                <option value="EQUIPEMENT">Équipement</option>
                <option value="TYPE">Type</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {filteredInterventions.length} résultat{filteredInterventions.length !== 1 ? 's' : ''} trouvé{filteredInterventions.length !== 1 ? 's' : ''}
              {searchTerm && <span className="text-blue-600"> pour "{searchTerm}"</span>}
            </p>
            {(searchTerm || statutFilter !== "TOUS" || typeFilter !== "TOUS" || sortOption !== "DATE_DESC") && (
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Liste des historiques */}
        {filteredInterventions.length > 0 ? (
          <div className="space-y-6 mb-8">
            {filteredInterventions.map((intervention) => (
              <div key={intervention.id} className="relative">
                <ViewHistorique 
                  history={{
                    id: intervention.id,
                    equipementId: intervention.equipementId,
                    dateSignalement: intervention.dateSignalement,
                    dateIntervention: intervention.dateIntervention || '',
                    // 🔧 Afficher les noms complets au lieu des IDs
                    signalePar: intervention.signalantUtilisateur 
                      ? `${intervention.signalantUtilisateur.prenom} ${intervention.signalantUtilisateur.nom}`
                      : 'Non renseigné',
                    intervenantId: intervention.intervenantUtilisateur
                      ? `${intervention.intervenantUtilisateur.prenom} ${intervention.intervenantUtilisateur.nom}`
                      : 'Non renseigné',
                    typeIntervention: intervention.typeIntervention || '',
                    pannesSignalees: intervention.pannesSignalees || '',
                    pannesConstatees: intervention.pannesConstatees || '',
                    diagnosticsPoses: intervention.diagnosticsPoses || '',
                    piecesRechange: intervention.piecesRechange || '',
                    statutApresIntervention: intervention.statutApresIntervention || '',
                    conclusions: intervention.conclusions || '',
                    interventionValidee: intervention.interventionValidee,
                    valideeParId: intervention.validateurUtilisateur
                      ? `${intervention.validateurUtilisateur.prenom} ${intervention.validateurUtilisateur.nom}`
                      : '',
                  }} 
                />
                
                {/* Bouton de validation pour les admins */}
                {isAdmin && !intervention.interventionValidee && intervention.dateIntervention && (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => validateIntervention(intervention.id)}
                      disabled={validatingIds.has(intervention.id)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      title={validatingIds.has(intervention.id) ? 'Validation en cours...' : 'Valider cette intervention'}
                    >
                      {validatingIds.has(intervention.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Aucune intervention ne correspond à vos critères de recherche.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voir toutes les interventions
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchTerm && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} ({totalCount} résultats au total)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {/* Numéros de pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loader en bas si chargement en cours */}
        {loading && interventions.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Historique;
