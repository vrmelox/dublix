"use client"

import { useState } from "react";
import EquipementCard from "@/components/EquipmentCard";
import { equipmentsData as equi } from "@/lib/data";
import PopUpAjouterEquipement from "@/components/PopUpAjouterEquipement";
import Pagination from "@/components/Pagination";

interface EquiProps {
    equipId: string;
    nom: string;
    modèle: string;
    services: string[];
    photo: string;
    installationDate: string;
    addedDate: string;
    lastModifiedDate: string;
    lien: string;
    qrcode: string;
}

const categories = [
    "Cardiologie", "Réanimation", "Radiologie", "Chirurgie",
    "Urgences", "Soins Intensifs", "Gynécologie", "Néonatologie",
    "Pédiatrie", "Laboratoire", "Hématologie", "Anesthésie",
    "Orthopédie"
];

const ListEquipementPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredEquipment = selectedCategory 
        ? equi.filter(equipment => equipment.services.includes(selectedCategory))
        : equi;

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(selectedCategory === category ? null : category);
    };

    return (
        <div className="m-6">
            {/* Category Filter Section */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#333652] mb-4">
                    Filtrer par catégorie
                </h2>
                <div className="w-full flex flex-wrap gap-3 py-4 px-2 text-[#333652]">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`px-4 py-2 cursor-pointer text-sm rounded-full shadow-sm transition duration-200 ease-in-out hover:shadow-md hover:scale-[1.03] font-medium ${
                                selectedCategory === category
                                    ? "bg-[#F3E1C0] text-[#333652] shadow-md scale-[1.03]"
                                    : "bg-[#F5F5F5] hover:bg-[#F3E1C0]"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                
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
            
            <PopUpAjouterEquipement />
            {/* Equipment Grid Section */}
            <div className="mb-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-[#333652]">
                        {selectedCategory ? `Équipements - ${selectedCategory}` : "Tous les équipements"}
                    </h2>
                    <span className="text-sm text-gray-500">
                        {filteredEquipment.length} équipement{filteredEquipment.length > 1 ? 's' : ''}
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEquipment.length > 0 ? (
                        filteredEquipment.map((equipment) => (
                            <EquipementCard key={equipment.equipId} equipement={equipment} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {selectedCategory 
                                ? `Aucun équipement trouvé dans la catégorie "${selectedCategory}"`
                                : "Aucun équipement disponible"
                            }
                        </div>
                    )}
                </div>
            </div>
            <Pagination />
        </div>
    );
};

export default ListEquipementPage;