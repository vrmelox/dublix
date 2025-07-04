"use client";

import { useState } from "react";
import { X } from "lucide-react";

const roles = ["Utilisateur", "Admin", "Technicien"];

type NewPersonne = {
  nom: string;
  prénom: string;
  profession: string;
  role: string; // un seul rôle
  photo: File | null;
  installationDate: string;
  description: string;
};

type PopUpAjouterPersonneProps = {
  open: boolean;
  onClose: () => void;
};

const PopUpAjouterPersonne = ({ open, onClose }: PopUpAjouterPersonneProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewPersonne>({
    nom: "",
    prénom: "",
    profession: "",
    role: "", // rôle unique
    photo: null,
    installationDate: "",
    description: "",
  });

  if (!open) return null;

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nom, prénom, role, photo } = formData;

    if (!nom || !prénom || !role || !photo) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("nom", nom);
      data.append("prénom", prénom);
      data.append("role", role);
      data.append("profession", formData.profession);
      data.append("installationDate", formData.installationDate);
      data.append("description", formData.description);
      data.append("photo", photo);

      // await fetch("/api/personnes", { method: "POST", body: data });

      alert("Personne ajoutée avec succès !");
      setFormData({
        nom: "",
        prénom: "",
        profession: "",
        role: "",
        photo: null,
        installationDate: "",
        description: "",
      });
      onClose();
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-[#333652]">Ajouter une personne</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
            aria-label="Fermer"
          >
            <X size={24} className="cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nom *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prénom *</label>
            <input
              type="text"
              value={formData.prénom}
              onChange={(e) => setFormData((prev) => ({ ...prev, prénom: e.target.value }))}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Profession</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData((prev) => ({ ...prev, profession: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
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
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  photo: e.target.files?.[0] || null,
                }))
              }
              required
              className="w-full px-3 py-2 border rounded-md"
            />
            {formData.photo && (
              <p className="text-sm text-gray-500 mt-1">
                Fichier sélectionné : {formData.photo.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-slate-700 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer hover:bg-[#F8EFE4] hover:text-slate-800 hover:border hover:border-gray-300 px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            >
              {isSubmitting ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopUpAjouterPersonne;
