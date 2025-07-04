import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { equipmentsData } from "@/lib/data";

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

interface EquipCardProps {
    equipement: EquiProps;
}

const EquipmentPage = ({equipement}: EquipCardProps) => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-[#333652] mb-8 text-center">
                    {equipement.nom} - {equipement.equipId}
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
                        <Image 
                            src={equipement.photo}
                            alt={equipement.nom}
                            width={450}
                            height={300}
                            className="w-full rounded-lg "               
                        />
                    </div>

                    {/* Equipment Details Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        {/* Rating Section */}
                        <div className="flex items-center gap-2">
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

                        {/* Description Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-[#333652] mb-2">Description</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {equipement.description || "Aucune description disponible"}
                            </p>
                        </div>

                        <div className="border-b-2 border-gray-200"></div>

                        {/* Equipment Info */}
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                                <h2 className="text-xl font-bold text-[#333652] mb-2">
                                    {equipement.modèle}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Services:</span>
                                    <p className="text-blue-700 font-medium">
                                        {(equipement.services.length > 1) ? equipement.services.join(", ") : equipement.services[0]}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="font-semibold text-green-800 mb-1">Installation</h4>
                                    <p className="text-sm text-green-700">
                                        {equipement.installationDate ? new Date(equipement.installationDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                    <h4 className="font-semibold text-purple-800 mb-1">Ajouté le</h4>
                                    <p className="text-sm text-purple-700">
                                        {equipement.addedDate ? new Date(equipement.addedDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Section */}
                <div className="mt-8 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-[#333652] mb-4">État de l'équipement</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Opérationnel</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            Dernière modification: {equipement.lastModifiedDate ? new Date(equipement.lastModifiedDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentPage;