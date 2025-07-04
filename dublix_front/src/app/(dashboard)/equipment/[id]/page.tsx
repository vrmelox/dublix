"use client"

import { useState } from "react";
import EquipmentPage from "@/components/EquipmentPage";
import SignalerPanne from "@/components/SignalerPanne";
import { equipmentsData as equi } from "@/lib/data";
import { useParams } from "next/navigation";


const EquipmentID = () => {
  const params = useParams();
  const equipId = params?.id;
  const selectedEquip = equi.find(e => e.equipId === equipId);
    if (!selectedEquip) return <div>Équipement introuvable.</div>;
    return (
        <div className="m-6">
            <EquipmentPage equipement={selectedEquip}/>
            <SignalerPanne equipmentName={selectedEquip.nom} equipmentId={selectedEquip.equipId}/>
        </div>
    )
}

export default EquipmentID;
