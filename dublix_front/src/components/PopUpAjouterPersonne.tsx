"use client";

import { useState } from "react";
import { X } from "lucide-react";

const roles = ["UTILISATEUR", "ADMINISTRATEUR", "TECHNICIEN"];

type NewPersonne = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: string;
};

type PopUpAjouterPersonneProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback pour rafraîchir la liste
};

const PopUpAjouterPersonne = ({ open, onClose, onSuccess }: PopUpAjouterPersonneProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewPersonne>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    role: "",
  });

  if (!open) return null;

  // ✅ FONCTION CORRIGÉE POUR RÉCUPÉRER LE TOKEN
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || 
             localStorage.getItem('authToken') || 
             sessionStorage.getItem('token') || 
             sessionStorage.getItem('authToken');
    }
    return null;
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const { nom, prenom, email, role } = formData;

    if (!nom || !prenom || !email || !role) {
      setError("Veuillez remplir tous les champs obligatoires (nom, prénom, email, rôle)");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ UTILISATION DE LA FONCTION CORRIGÉE
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      // Envoyer en JSON au lieu de FormData
      const response = await fetch("http://localhost:4000/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          prenom,
          email,
          role,
          telephone: formData.telephone,
          adresse: formData.adresse,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || "Erreur lors de l'ajout");
      }

      alert(`Personne ajoutée avec succès ! Mot de passe par défaut: ${responseData.motDePasseParDefaut}`);
      
      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        role: "",
      });
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
      
    } catch (error: any) {
      console.error("Erreur:", error);
      setError(error.message || "Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-[#333652]">Ajouter une personne</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Fermer"
            disabled={isSubmitting}
          >
            <X size={24} className="cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Nom *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prénom *</label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => setFormData((prev) => ({ ...prev, prenom: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Téléphone</label>
            <input
              type="tel"
              value={formData.telephone}
              onChange={(e) => setFormData((prev) => ({ ...prev, telephone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
              placeholder="Ex: +229 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Adresse</label>
            <textarea
              value={formData.adresse}
              onChange={(e) => setFormData((prev) => ({ ...prev, adresse: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isSubmitting}
              placeholder="Adresse complète"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rôle *</label>
            <div className="grid grid-cols-3 gap-4 border rounded-md p-3">
              {roles.map((r) => (
                <label key={r} className="flex items-center text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={formData.role === r}
                    onChange={() => handleRoleChange(r)}
                    className="mr-2"
                    required
                    disabled={isSubmitting}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopUpAjouterPersonne;