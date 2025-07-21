"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import PopupAjouterIntervention from "./PopUpAjouterIntervention";

interface EquiProps {
  equipId: string;
  nom: string;
  modèle: string;
  services: string[];
  photo: string;
  description: string;
  installationDate: string;
  addedDate: string;
  lastModifiedDate: string;
  lien: string;
  qrcode: string;
}

interface EquipCardProps {
  equipement: EquiProps;
}

const EquipmentPage = ({ equipement }: EquipCardProps) => {
  const handleInterventionAdded = () => {
    console.log("Intervention ajoutée");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#333652] mb-6 text-center break-words">
          {equipement.nom} - {equipement.equipId}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center">
            <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-100">
              <Image
                src={equipement.photo}
                alt={equipement.nom}
                fill
                className="object-contain rounded-lg"
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
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Services:</span>
                  <p className="text-blue-700 font-medium break-words">
                    {equipement.services.join(", ")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-1 text-sm">Installation</h4>
                  <p className="text-sm text-green-700">
                    {equipement.installationDate
                      ? new Date(equipement.installationDate).toLocaleDateString("fr-FR")
                      : "Non spécifié"}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-1 text-sm">Ajouté le</h4>
                  <p className="text-sm text-purple-700">
                    {equipement.addedDate
                      ? new Date(equipement.addedDate).toLocaleDateString("fr-FR")
                      : "Non spécifié"}
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
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Opérationnel</span>
              </div>
              <div className="text-gray-500">
                Dernière modification: {equipement.lastModifiedDate
                  ? new Date(equipement.lastModifiedDate).toLocaleDateString("fr-FR")
                  : "Non spécifié"}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <PopupAjouterIntervention
              equipementId={equipement.equipId}
              equipementNom={equipement.nom}
              currentStatut="FONCTIONNEL"
              onInterventionAdded={handleInterventionAdded}
            />
            <Image
              src={equipement.qrcode}
              alt="qrcode de l'équipement"
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPage;
