"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// Types
interface Historique {
  id: string
  equipementId: string
  dateSignalement: string
  dateIntervention: string
  signalePar: string
  intervenantId: string
  typeIntervention: string
  pannesSignalees: string
  pannesConstatees: string
  diagnosticsPoses: string
  piecesRechange: string
  statutApresIntervention: string
  conclusions: string
  interventionValidee: boolean
  valideeParId: string
}

interface ViewHistoriqueProps {
  history: Historique
}

// Constantes
const ROLE = "ADMINISTRATEUR" as const

// Utilitaires de formatage
const formatDate = (date: string): string => {
  if (!date) return ""
  
  try {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return date
  }
}

const ViewHistorique: React.FC<ViewHistoriqueProps> = ({ history }) => {
  // Calculs dérivés avec useMemo pour optimiser les performances
  const derivedData = useMemo(() => {
    const isIntervention = Boolean(history.dateIntervention)
    const hasSignaledProblem = Boolean(history.pannesSignalees)
    
    const problemTitle = hasSignaledProblem 
      ? "Problème signalé" 
      : "Problème non signalé"
    
    const problemDescription = hasSignaledProblem 
      ? history.pannesSignalees 
      : history.pannesConstatees
    
    const displayDate = history.dateSignalement || history.dateIntervention
    
    return {
      isIntervention,
      hasSignaledProblem,
      problemTitle,
      problemDescription,
      displayDate: formatDate(displayDate),
      formattedSignalementDate: formatDate(history.dateSignalement),
      formattedInterventionDate: formatDate(history.dateIntervention)
    }
  }, [history])

  // Validation des données requises
  if (!history?.id) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Données d'historique invalides</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* En-tête du problème */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {derivedData.problemTitle}
          </h3>
          {derivedData.isIntervention && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Intervention effectuée
            </span>
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {derivedData.problemDescription || "Description non disponible"}
        </h2>
        
        {derivedData.displayDate && (
          <div className="flex items-center text-sm text-gray-600">
            <time dateTime={history.dateSignalement || history.dateIntervention}>
              {derivedData.displayDate}
            </time>
          </div>
        )}
      </div>

      {/* Section Description détaillée */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Détails de l'intervention
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {history.dateSignalement && (
            <div>
              <dt className="text-gray-700 font-bold">Date de signalement :</dt>
              <dd className="text-gray-600">{derivedData.formattedSignalementDate}</dd>
            </div>
          )}
          
          {history.dateIntervention && (
            <div>
              <dt className="font-bold text-gray-700">Date d'intervention :</dt>
              <dd className="text-gray-600">{derivedData.formattedInterventionDate}</dd>
            </div>
          )}
          
          {history.typeIntervention && (
            <div>
              <dt className="font-bold text-gray-700">Type d'intervention :</dt>
              <dd className="text-gray-600">{history.typeIntervention}</dd>
            </div>
          )}
          
          {history.signalePar && (
            <div>
              <dt className="font-bold text-gray-700">Signalé par :</dt>
              <dd className="text-gray-600">{history.signalePar}</dd>
            </div>
          )}
        </div>

        {/* Diagnostics et conclusions */}
        {(history.diagnosticsPoses || history.conclusions) && (
          <div className="mt-6 space-y-3">
            {history.diagnosticsPoses && (
              <div>
                <h4 className="font-bold text-gray-700 mb-1">Diagnostics posés :</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {history.diagnosticsPoses}
                </p>
              </div>
            )}
            
            {history.conclusions && (
              <div>
                <h4 className="font-bold text-gray-700 mb-1">Conclusions :</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {history.conclusions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statut de validation */}
        {history.interventionValidee && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="text-green-600 text-sm font-medium">
                ✓ Intervention validée
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewHistorique