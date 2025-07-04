"use client";

import Link from "next/link";
import Image from "next/image";
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

const EquipementCard = ({ equipement }: EquipCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/equipment/${equipement.equipId}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#FAFAFA] hover:bg-[#F6F1E9] transition-all duration-200 gap-3 p-4 shadow-md rounded-xl cursor-pointer w-full max-w-xs sm:max-w-sm md:max-w-md"
    >
      <div className="relative w-full h-48 mb-2">
        <Image
          src={equipement.photo}
          alt={equipement.nom}
          fill
          className="object-contain rounded"
        />
      </div>
      <p className="text-center text-sm font-medium text-[#333652]">{equipement.nom}</p>
    </div>
  );
};

export default EquipementCard;
