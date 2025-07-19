"use client"

import { useState, useMemo } from "react"
import { historiques } from "@/lib/data"
import ViewHistorique from "@/components/ViewHistorique"

// Types pour les filtres
type StatutFilter = "TOUS" | "VALIDE" | "NON_VALIDE" | "EN_ATTENTE"
type TypeFilter = "TOUS" | "REPARATION" | "INSPECTION" | "MAINTENANCE"
type SortOption = "DATE_DESC" | "DATE_ASC" | "EQUIPEMENT" | "TYPE"

const Historique = () => {
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("TOUS")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("TOUS")
  const [sortOption, setSortOption] = useState<SortOption>("DATE_DESC")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filtrage et tri des données
  const filteredAndSortedHistoriques = useMemo(() => {
    let filtered = historiques.filter(historique => {
      // Filtrage par recherche textuelle
      const matchesSearch = searchTerm === "" || 
        historique.pannesSignalees?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historique.pannesConstatees?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historique.diagnosticsPoses?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historique.equipementId.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtrage par statut
      const matchesStatut = statutFilter === "TOUS" || 
        (statutFilter === "VALIDE" && historique.interventionValidee) ||
        (statutFilter === "NON_VALIDE" && !historique.interventionValidee && historique.dateIntervention) ||
        (statutFilter === "EN_ATTENTE" && !historique.dateIntervention)

      // Filtrage par type d'intervention
      const matchesType = typeFilter === "TOUS" || historique.typeIntervention === typeFilter

      return matchesSearch && matchesStatut && matchesType
    })

    // Tri des résultats
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "DATE_DESC":
          const dateA = new Date(a.dateIntervention || a.dateSignalement || "1970-01-01")
          const dateB = new Date(b.dateIntervention || b.dateSignalement || "1970-01-01")
          return dateB.getTime() - dateA.getTime()
        
        case "DATE_ASC":
          const dateA2 = new Date(a.dateIntervention || a.dateSignalement || "1970-01-01")
          const dateB2 = new Date(b.dateIntervention || b.dateSignalement || "1970-01-01")
          return dateA2.getTime() - dateB2.getTime()
        
        case "EQUIPEMENT":
          return a.equipementId.localeCompare(b.equipementId)
        
        case "TYPE":
          return (a.typeIntervention || "").localeCompare(b.typeIntervention || "")
        
        default:
          return 0
      }
    })

    return filtered
  }, [historiques, searchTerm, statutFilter, typeFilter, sortOption])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedHistoriques.length / itemsPerPage)
  const paginatedHistoriques = filteredAndSortedHistoriques.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistiques rapides
  const stats = useMemo(() => {
    const total = historiques.length
    const enCours = historiques.filter(h => !h.dateIntervention).length
    const valides = historiques.filter(h => h.interventionValidee && h.dateIntervention).length
    const nonValides = historiques.filter(h => !h.interventionValidee && h.dateIntervention).length
    
    return { total, enCours, valides, nonValides }
  }, [historiques])

  const resetFilters = () => {
    setSearchTerm("")
    setStatutFilter("TOUS")
    setTypeFilter("TOUS")
    setSortOption("DATE_DESC")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Historique des Interventions
          </h1>
          <p className="text-gray-600">
            Consultez et gérez l'historique de toutes les interventions sur vos équipements
          </p>
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
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">⏳</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Validées</p>
                <p className="text-2xl font-semibold text-green-600">{stats.valides}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Non validées</p>
                <p className="text-2xl font-semibold text-red-600">{stats.nonValides}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">⚠</span>
              </div>
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
                onChange={(e) => setStatutFilter(e.target.value as StatutFilter)}
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
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
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
              {filteredAndSortedHistoriques.length} résultat{filteredAndSortedHistoriques.length !== 1 ? 's' : ''} trouvé{filteredAndSortedHistoriques.length !== 1 ? 's' : ''}
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
        {paginatedHistoriques.length > 0 ? (
          <div className="space-y-6 mb-8">
            {paginatedHistoriques.map((historique) => (
              <ViewHistorique key={historique.id} history={historique} />
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
        {totalPages > 1 && (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} ({filteredAndSortedHistoriques.length} résultats)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
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
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Historique