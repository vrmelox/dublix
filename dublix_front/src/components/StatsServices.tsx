"use client"

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Rectangle,
} from "recharts";

interface Services {
  id: string;
  nom: string;
}

interface EquiProps {
  equipId: string;
  nom: string;
  services: string[];
  statut: string;
}

interface StatsServicesProps {
  services: Services[];
  equipement: EquiProps[];
}

const StatsServices = ({ services, equipement }: StatsServicesProps) => {
  const [selectedService, setSelectedService] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(event.target.value);
  };

  // Filtrage des équipements par service sélectionné
  const filteredEquipment = selectedService
    ? equipement.filter((eq) => eq.services.includes(selectedService))
    : equipement;

  // Comptage des statuts
  const fonc = filteredEquipment.filter((eq) => eq.statut === "FONCTIONNEL").length;
  const pan = filteredEquipment.filter((eq) => eq.statut !== "FONCTIONNEL").length;

  const chartData = [
    { name: selectedService || "Tous", Panne: pan, Fonctionnel: fonc },
  ];

  return (
    <div className="bg-white p-4 rounded shadow flex flex-col items-center">
      <select
        value={selectedService}
        onChange={handleChange}
        className="p-4 px-20 bg-amber-200 rounded-full mb-4"
      >
        <option value="">Tous les services</option>
        {services.map((s) => (
          <option key={s.id} value={s.nom}>
            {s.nom}
          </option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={50}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Panne" fill="#f59e0b" />
          <Bar dataKey="Fonctionnel" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatsServices;
