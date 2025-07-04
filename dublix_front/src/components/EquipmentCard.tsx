"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EquiProps {
    equipId: string;
    nom: string;
    modèle: string;
    services: string[];
    photo: string;
}

interface EquipCardProps {
  equipement: EquiProps;
}

const EquipementCard = ({equipement}: EquipCardProps) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/equipment/${equipement.equipId}`);
  };
    return (
        <div 
          onClick={handleClick}
          className=" bg-[#FAFAFA] hover:bg-[#F6F1E9] transition-all duration-200 gap-3 p-4 shadow-md rounded-xl cursor-pointer min-w-0 w-[300px]"
        >
            <div className="flex justify-center items-center">
                <Image 
                    src={equipement.photo}
                    alt={equipement.nom}
                    width={200}
                    height={180}
                    className="mb-2"
                />
            </div>
                <p className="text-center mt-">{equipement.nom}</p>
        </div>
    )
}

export default EquipementCard;