import { RoleType } from '@prisma/client';
import type React from 'react';

// ========================
// Types pour Équipements
// ========================

export interface EquiProps {
  equipId: string;
  nom: string;
  modèle: string;
  services: string[];
  photo: string;
  description?: string;
  installationDate?: string;
  addedDate?: string;
  lastModifiedDate?: string;
  lien?: string;
  qrcode?: string;
  statut?: string;
}

export interface Equipements {
  equipId: string;
  nom: string;
  modèle: string;
  services: string[];
  installationDate: string;
  addedDate: string;
  statut: string;
  lastModifiedDate: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: RoleType;
  };
}

export interface EquipementsProps {
  equipements: Equipements[];
}

export interface EquipCardProps {
  equipement: EquiProps;
}

export type NewEquipement = {
  nom: string;
  modèle: string;
  services: string[];
  photo: File | null;
  installationDate: string;
  description: string;
};

// ========================
// Utilisateurs & Techniciens
// ========================

export type Technician = {
  id: number;
  technicianId: string;
  name: string;
  email: string;
  photo: string;
  phone: string;
  address: string;
};

export type User = {
  id: number;
  userId: string;
  name: string;
  email: string;
  photo: string;
  phone: string;
  status: string;
  departement: string;
  adress: string;
};

export type NewPersonne = {
  nom: string;
  prénom: string;
  email: string;
  profession: string;
  role: string;
  photo: File | null;
  installationDate: string;
  description: string;
};

// ========================
// Authentification / Gestion utilisateur
// ========================

export type NewUser = {
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
  role: RoleType;
  photo?: string;
  telephone?: string;
  adresse?: string;
};

export type LoginUser = {
  email: string;
  motDePasse: string;
};

// ========================
// Services
// ========================

export interface Services {
  id: string;
  nom: string;
}

export interface StatsServicesProps {
  services: Services[];
  equipement: {
    equipId: string;
    nom: string;
    services: string[];
    statut: string;
  }[];
}

// ========================
// Tableaux & colonnes
// ========================

export interface Column<T> {
  key: keyof T;
  label: string;
  hiddenOn?: 'sm' | 'md' | 'lg' | 'xl';
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T, ColumnType> {
  columns: ColumnType[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}

// ========================
// Pagination
// ========================

export interface PaginationProps {
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

// ========================
// Signalement de panne
// ========================

export interface FailureReport {
  equipmentName: string;
  equipmentId: string;
  problemType: 'panne' | 'hors service';
  details: string;
  reportDate: string;
}

export interface SignalerPanneProps {
  equipmentName: string;
  equipmentId: string;
  onSubmit?: (data: FailureReport) => void;
}

// ========================
// Historique d'intervention
// ========================

export interface Historique {
  id: string;
  equipementId: string;
  dateSignalement: string;
  dateIntervention: string;
  signalePar: string;
  intervenantId: string;
  typeIntervention: string;
  pannesSignalees: string;
  pannesConstatees: string;
  diagnosticsPoses: string;
  piecesRechange: string;
  statutApresIntervention: string;
  conclusions: string;
  interventionValidee: boolean;
  valideeParId: string;
}

export interface ViewHistoriqueProps {
  history: Historique;
}

// ========================
// Autres
// ========================

export interface UserCardProps {
  type: string;
  number: number;
  className?: string;
}

// Interface pour les réponses API
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

// Interface pour la pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Interface pour les filtres d'équipements
export interface EquipmentFilters {
  search?: string;
  service?: string;
  statut?: string;
  page?: number;
  limit?: number;
}

export type ValuePiece = Date | null;
export type Value = ValuePiece | [ValuePiece, ValuePiece];
