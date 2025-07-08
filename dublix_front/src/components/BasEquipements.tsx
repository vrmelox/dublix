"use client"

import Link from "next/link";
import Image from "next/image";
import TableSearch from "./TableSearch";
import Table from "./TableStats"; 

const role = "admin";
interface Equipements {
  equipId: string,
  nom: string,
  modèle: string,
  services: string[],
  installationDate: string,
  addedDate: string,
  statut: string,
  lastModifiedDate: string,
};

interface EquipementsProps {
  equipements: Equipements[];
}

interface Column<T> {
  key: keyof T;
  label: string;
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl';
  render?: (item: T) => React.ReactNode;
  className?: string;
}

const columns: Column<Equipements>[] = [
  {
    key: 'nom',
    label: 'Nom',
    className: 'p-4',
  },
  {
    key: 'equipId',
    label: 'ID',
    hiddenOn: 'sm',  // caché sur petit écran par exemple
  },
  {
    key: 'modèle',
    label: 'Modèle',
    hiddenOn: 'md',
  },
  {
    key: 'services',
    label: 'Services',
    hiddenOn: 'md',
    render: (item) => item.services.join(', '),  // si tu veux afficher la liste
  },
];


const BasEquipements = ({equipements}: EquipementsProps) => {

  const renderCard = (equipement: Equipements) => (
    <div
      key={equipement.equipId}
      className="md:hidden bg-white shadow rounded-md p-4 mb-4 border border-gray-200"
    >
      <div className="text-sm text-gray-700 space-y-1 mb-3">
        <div className="flex flex-col">
            <Link href={`/equipment/${equipement.equipId}`}>
                <p className="">
                    <span className="font-semibold">Nom: </span>
                    {equipement.nom}
                </p>
            </Link>
        </div>
        <p>
          <span className="font-semibold">ID: </span>
          {equipement.equipId}
        </p>
        <p>
          <span className="font-semibold">Statut: </span>
          {equipement.statut}
        </p>
        <p>
          <span className="font-semibold">Services: </span>
          {equipement.services.join(", ")}
        </p>
      </div>
      <div className="flex gap-3">
        {role === "admin" && (
          <button className="flex items-center justify-center rounded-full bg-bensPurple w-8 h-8">
            <Image src="/delete.png" alt="Supprimer" width={16} height={16} />
          </button>
        )}
      </div>
    </div>
  );

  const renderRow = (equipement: Equipements) => (
    <tr
      key={equipement.equipId}
      className="hidden md:table-row border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-bensPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
            <Link href={`/equipment/${equipement.equipId}`}>
                <p className="">{equipement.nom}</p>
            </Link>
        </div>
      </td>
      <td className="hidden md:table-cell">{equipement.equipId}</td>
      <td className="hidden lg:table-cell">{equipement.statut}</td>
      <td className="hidden lg:table-cell">{equipement.services.join(", ")}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-bensPurple cursor-pointer">
              <Image src="/delete.png" alt="Supprimer" width={16} height={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 mt-4">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Base de données des équipements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow cursor-pointer">
              <Image src="/filter.png" alt="Filtrer" height={20} width={20} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow cursor-pointer">
              <Image src="/sort.png" alt="Trier" height={20} width={20} />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE LISTE CARTES */}
      <div className="md:hidden mt-6">{equipements.map(renderCard)}</div>

      {/* TABLEAU DESKTOP */}
      <div className="hidden md:block mt-6">
        <Table columns={columns} renderRow={renderRow} data={equipements} />
      </div>
    </div>
  );
};

export default BasEquipements;
