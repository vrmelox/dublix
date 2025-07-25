"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import TableSearch from "./TableSearch";
import Table from "./TableStats";
import { useUser } from "@/app/contexts/UserContext";
import { Loader2, Filter, MoreVertical } from 'lucide-react';

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
    hiddenOn: 'sm',
  },
  {
    key: 'statut',
    label: 'Statut',
    hiddenOn: 'md',
    render: (item) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        item.statut === 'FONCTIONNEL' ? 'bg-green-100 text-green-800' :
        item.statut === 'EN_PANNE' ? 'bg-red-100 text-red-800' :
        item.statut === 'HORS_SERVICE' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {item.statut === 'FONCTIONNEL' ? 'Fonctionnel' :
         item.statut === 'EN_PANNE' ? 'En panne' :
         item.statut === 'HORS_SERVICE' ? 'Hors service' :
         item.statut}
      </span>
    )
  },
  {
    key: 'services',
    label: 'Services',
    hiddenOn: 'lg',
    render: (item) => (
      <div className="max-w-[200px]">
        <span className="text-sm text-gray-600 truncate block" title={item.services.join(', ')}>
          {item.services.join(', ')}
        </span>
      </div>
    )
  },
];

const BasEquipements = ({ equipements: initialEquipements }: EquipementsProps) => {
  const user = useUser();
  const role = user.user?.role;
  
  // États pour les filtres
  const [equipements, setEquipements] = useState<Equipements[]>(initialEquipements);
  const [filteredEquipements, setFilteredEquipements] = useState<Equipements[]>(initialEquipements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TOUS");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("nom");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  // Mettre à jour les équipements quand les props changent
  useEffect(() => {
    setEquipements(initialEquipements);
    setFilteredEquipements(initialEquipements);
  }, [initialEquipements]);

  // Fonction de filtrage et tri
  useEffect(() => {
    let filtered = [...equipements];

    // Filtrage par recherche
    if (searchTerm) {
      filtered = filtered.filter(eq => 
        eq.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.modèle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.equipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrage par statut
    if (statusFilter !== "TOUS") {
      filtered = filtered.filter(eq => eq.statut === statusFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'nom':
          aValue = a.nom.toLowerCase();
          bValue = b.nom.toLowerCase();
          break;
        case 'statut':
          aValue = a.statut;
          bValue = b.statut;
          break;
        case 'addedDate':
          aValue = new Date(a.addedDate).getTime();
          bValue = new Date(b.addedDate).getTime();
          break;
        default:
          aValue = a.nom.toLowerCase();
          bValue = b.nom.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredEquipements(filtered);
  }, [equipements, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fonction pour supprimer un équipement (simulée)
  const handleDelete = async (equipId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Appel API pour supprimer
      console.log('Suppression équipement:', equipId);
      
      // Simulation d'un délai
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour la liste localement
      const updatedEquipements = equipements.filter(eq => eq.equipId !== equipId);
      setEquipements(updatedEquipements);
      
      alert('Équipement supprimé avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (equipement: Equipements) => (
    <div
      key={equipement.equipId}
      className="md:hidden bg-white shadow rounded-md p-4 mb-4 border border-gray-200"
    >
      <div className="text-sm text-gray-700 space-y-2 mb-3">
        <div className="flex flex-col">
          <Link href={`/equipment/${equipement.equipId}`}>
            <p className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">
              {equipement.nom}
            </p>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <p>
            <span className="font-semibold">ID: </span>
            {equipement.equipId}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            equipement.statut === 'FONCTIONNEL' ? 'bg-green-100 text-green-800' :
            equipement.statut === 'EN_PANNE' ? 'bg-red-100 text-red-800' :
            equipement.statut === 'HORS_SERVICE' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {equipement.statut === 'FONCTIONNEL' ? 'Fonctionnel' :
             equipement.statut === 'EN_PANNE' ? 'En panne' :
             equipement.statut === 'HORS_SERVICE' ? 'Hors service' :
             equipement.statut}
          </span>
        </div>
        <p>
          <span className="font-semibold">Modèle: </span>
          {equipement.modèle}
        </p>
        <p>
          <span className="font-semibold">Services: </span>
          {equipement.services.join(", ")}
        </p>
        <p className="text-xs text-gray-500">
          Ajouté le {equipement.addedDate}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <Link 
          href={`/equipment/${equipement.equipId}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Voir détails →
        </Link>
        {role === "ADMINISTRATEUR" && (
          <button 
            onClick={() => handleDelete(equipement.equipId)}
            disabled={loading}
            className="flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 w-8 h-8 text-white transition-colors disabled:opacity-50"
            title="Supprimer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Image src="/delete.png" alt="Supprimer" width={16} height={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderRow = (equipement: Equipements) => (
    <tr
      key={equipement.equipId}
      className="hidden md:table-row border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-blue-50 transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <Link href={`/equipment/${equipement.equipId}`}>
            <p className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
              {equipement.nom}
            </p>
          </Link>
          <p className="text-xs text-gray-500">{equipement.modèle}</p>
        </div>
      </td>
      <td className="hidden md:table-cell text-gray-600">{equipement.equipId}</td>
      <td className="hidden md:table-cell">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          equipement.statut === 'FONCTIONNEL' ? 'bg-green-100 text-green-800' :
          equipement.statut === 'EN_PANNE' ? 'bg-red-100 text-red-800' :
          equipement.statut === 'HORS_SERVICE' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {equipement.statut === 'FONCTIONNEL' ? 'Fonctionnel' :
           equipement.statut === 'EN_PANNE' ? 'En panne' :
           equipement.statut === 'HORS_SERVICE' ? 'Hors service' :
           equipement.statut}
        </span>
      </td>
      <td className="hidden lg:table-cell">
        <div className="max-w-[200px]">
          <span className="text-sm text-gray-600 truncate block" title={equipement.services.join(', ')}>
            {equipement.services.join(', ')}
          </span>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link 
            href={`/equipment/${equipement.equipId}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Voir
          </Link>
          {role === "ADMINISTRATEUR" && (
            <button 
              onClick={() => handleDelete(equipement.equipId)}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              title="Supprimer"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Image src="/delete.png" alt="Supprimer" width={14} height={14} />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 mt-4">
      {/* TOP */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
          Base de données des équipements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Rechercher un équipement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                showFilters ? 'bg-blue-500 text-white' : 'bg-yellow-400 hover:bg-yellow-500'
              }`}
              title="Filtres"
            >
              <Filter className="w-4 h-4" />
            </button>
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer"
              >
                <option value="nom-asc">Nom A-Z</option>
                <option value="nom-desc">Nom Z-A</option>
                <option value="statut-asc">Statut A-Z</option>
                <option value="addedDate-desc">Plus récent</option>
                <option value="addedDate-asc">Plus ancien</option>
              </select>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 hover:bg-yellow-500 cursor-pointer transition-colors">
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTRES */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="FONCTIONNEL">Fonctionnel</option>
                <option value="EN_PANNE">En panne</option>
                <option value="HORS_SERVICE">Hors service</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter("TOUS");
                  setSearchTerm("");
                  setSortBy("nom");
                  setSortOrder("asc");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RÉSULTATS */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredEquipements.length} équipement{filteredEquipements.length !== 1 ? 's' : ''} 
          {searchTerm && ` trouvé${filteredEquipements.length !== 1 ? 's' : ''} pour "${searchTerm}"`}
        </span>
        {statusFilter !== "TOUS" && (
          <span className="text-blue-600">
            Filtre: {statusFilter === 'FONCTIONNEL' ? 'Fonctionnel' :
                    statusFilter === 'EN_PANNE' ? 'En panne' :
                    statusFilter === 'HORS_SERVICE' ? 'Hors service' : statusFilter}
          </span>
        )}
      </div>

      {/* MOBILE LISTE CARTES */}
      <div className="md:hidden">
        {filteredEquipements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📋</span>
            </div>
            <p className="font-medium">Aucun équipement trouvé</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          filteredEquipements.map(renderCard)
        )}
      </div>

      {/* TABLEAU DESKTOP */}
      <div className="hidden md:block">
        {filteredEquipements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📋</span>
            </div>
            <p className="font-medium text-lg">Aucun équipement trouvé</p>
            <p className="text-sm">Essayez de modifier vos critères de recherche ou vos filtres</p>
          </div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={filteredEquipements} />
        )}
      </div>
    </div>
  );
};

export default BasEquipements;
