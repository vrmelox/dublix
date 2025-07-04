"use client";

import { useState } from "react";
import { X } from "lucide-react";

const services = [
  "Cardiologie", "Réanimation", "Radiologie", "Chirurgie",
  "Urgences", "Soins Intensifs", "Gynécologie", "Néonatologie",
  "Pédiatrie", "Laboratoire", "Hématologie", "Anesthésie", "Orthopédie"
];

type NewEquipement = {
  nom: string;
  modèle: string;
  services: string[];
  photo: File | null;
  installationDate: string;
  description: string;
};

const PopUpAjouterEquipement = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewEquipement>({
    nom: "",
    modèle: "",
    services: [],
    photo: null,
    installationDate: "",
    description: ""
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { nom, modèle, services, photo } = formData;

    if (!nom || !modèle || services.length === 0 || !photo) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("nom", nom);
      data.append("modèle", modèle);
      data.append("services", JSON.stringify(services));
      data.append("installationDate", formData.installationDate);
      data.append("description", formData.description);
      data.append("photo", photo);

      // 👇 Exemple d'envoi à une API (à adapter selon ton backend)
      /*
      await fetch("/api/equipements", {
        method: "POST",
        body: data,
      });
      */

      alert("Équipement ajouté avec succès !");
      setFormData({
        nom: "",
        modèle: "",
        services: [],
        photo: null,
        installationDate: "",
        description: ""
      });
      setOpen(false);
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-slate-800 text-white rounded-md cursor-pointer hover:bg-slate-600"
      >
        Ajouter un Équipement
      </button>

      {open && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-[#333652]">Ajouter un Équipement</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} className="cursor-pointer"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Modèle */}
              <div>
                <label className="block text-sm font-medium mb-2">Modèle *</label>
                <input
                  type="text"
                  value={formData.modèle}
                  onChange={(e) => setFormData(prev => ({ ...prev, modèle: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium mb-2">Services *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {services.map((service) => (
                    <label key={service} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="mr-2"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium mb-2">Photo *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      photo: e.target.files?.[0] || null
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

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Date d'installation</label>
                <input
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, installationDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-slate-700 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer hover:bg-[#F8EFE4] hover:text-slate-800 hover:border hover-border-gray-300 px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
                >
                  {isSubmitting ? "Ajout..." : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PopUpAjouterEquipement;
