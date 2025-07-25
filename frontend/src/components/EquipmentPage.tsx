"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import PopupAjouterIntervention from "./PopUpAjouterIntervention";
import { getImageUrl } from "@/utils/imageUtils";

interface EquiProps {
  equipId: string;
  nom: string;
  modèle: string;
  services: string[];
  photo: string;
  qrcode?: string;
  // 🆕 Champs ajoutés pour correspondre aux données de l'API
  marque?: string;
  numeroSerie?: string;
  numeroInventaire?: string;
  typeMateriel?: string;
  description?: string;
  anneeFabrication?: number;
  statut?: string;
  dateInstallation?: string;
  dateDerniereIntervention?: string;
  // 🆕 Champs pour compatibilité avec l'ancien code
  installationDate?: string;
  addedDate?: string;
  lastModifiedDate?: string;
  lien?: string;
  service?: {
    nom: string;
  };
}

interface EquipCardProps {
  equipement: EquiProps;
}

const EquipmentPage = ({ equipement }: EquipCardProps) => {
  const handleInterventionAdded = () => {
    console.log("Intervention ajoutée");
  };

  // 🆕 Fonctions utilitaires pour les dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  // 🆕 Fonction pour déterminer le statut et sa couleur
  const getStatusInfo = (statut?: string) => {
    switch (statut) {
      case 'FONCTIONNEL':
        return { color: 'bg-green-500', text: 'Opérationnel', textColor: 'text-green-700' };
      case 'EN_PANNE':
        return { color: 'bg-red-500', text: 'En panne', textColor: 'text-red-700' };
      case 'HORS_SERVICE':
        return { color: 'bg-gray-500', text: 'Hors service', textColor: 'text-gray-700' };
      default:
        return { color: 'bg-green-500', text: 'Opérationnel', textColor: 'text-green-700' };
    }
  };

  const statusInfo = getStatusInfo(equipement.statut);
  
  console.log("🎯 PROPS EQUIPEMENT:", equipement);
  console.log("🎯 QR CODE PROP:", equipement.qrcode);
  console.log("🎯 URL QR CODE GÉNÉRÉE:", equipement.qrcode ? getImageUrl(equipement.qrcode) : "PAS DE QR CODE");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#333652] mb-6 text-center break-words">
          {equipement.nom} - {equipement.numeroSerie || equipement.equipId}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-100">
              <img
                src={getImageUrl(equipement.photo)}
                alt={equipement.nom}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Equipment Details */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Évaluation:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`w-4 h-4 ${i < 3 ? "text-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">(3/5)</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-[#333652] mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                {equipement.description || "Aucune description disponible"}
              </p>
            </div>

            <div className="border-b-2 border-gray-200"></div>

            {/* Equipment Info */}
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-lg font-bold text-[#333652] mb-2">
                  {equipement.modèle}
                  {equipement.marque && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      - {equipement.marque}
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                  <span className="font-medium text-gray-700">Services:</span>
                  <p className="text-blue-700 font-medium break-words">
                    {equipement.services.join(", ")}
                  </p>
                </div>
                {/* 🆕 Informations supplémentaires */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                  {equipement.numeroSerie && (
                    <div>
                      <span className="font-medium">N° Série:</span> {equipement.numeroSerie}
                    </div>
                  )}
                  {equipement.numeroInventaire && (
                    <div>
                      <span className="font-medium">N° Inventaire:</span> {equipement.numeroInventaire}
                    </div>
                  )}
                  {equipement.anneeFabrication && (
                    <div>
                      <span className="font-medium">Année:</span> {equipement.anneeFabrication}
                    </div>
                  )}
                  {equipement.typeMateriel && (
                    <div>
                      <span className="font-medium">Type:</span> {equipement.typeMateriel}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-1 text-sm">Installation</h4>
                  <p className="text-sm text-green-700">
                    {formatDate(equipement.dateInstallation || equipement.installationDate)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-1 text-sm">Ajouté le</h4>
                  <p className="text-sm text-purple-700">
                    {formatDate(equipement.addedDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section Responsive */}
        <div className="mt-8 bg-white rounded-xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#333652] mb-4">État de l'équipement</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 ${statusInfo.color} rounded-full`}></div>
                <span className={`${statusInfo.textColor} font-medium`}>{statusInfo.text}</span>
              </div>
              <div className="text-gray-500">
                Dernière modification: {formatDate(
                  equipement.dateDerniereIntervention || 
                  equipement.lastModifiedDate || 
                  equipement.dateInstallation || 
                  equipement.installationDate
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <PopupAjouterIntervention
              equipementId={equipement.equipId}
              equipementNom={equipement.nom}
              currentStatut={equipement.statut || "FONCTIONNEL"}
              onInterventionAdded={handleInterventionAdded}
            />
            {equipement.qrcode && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={getImageUrl(equipement.qrcode)}
                  alt="QR code de l'équipement"
                  width={100}
                  height={100}
                  className="border border-gray-200 rounded"
                />
                <span className="text-xs text-gray-500">QR Code</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPage;
