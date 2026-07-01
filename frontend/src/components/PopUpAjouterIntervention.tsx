"use client";

import { useState, useEffect } from "react";
import { X, Wrench } from "lucide-react";

// Types
type TypeIntervention = "MAINTENANCE" | "REPARATION" | "INSPECTION";
type StatutEquipement = "FONCTIONNEL" | "EN_PANNE" | "HORS_SERVICE";

interface PopupAjouterInterventionProps {
  equipementId: string;
  equipementNom: string;
  currentStatut: StatutEquipement;
  onInterventionAdded?: () => void;
}

const PopupAjouterIntervention = ({
  equipementId,
  equipementNom,
  currentStatut,
  onInterventionAdded
}: PopupAjouterInterventionProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    typeIntervention: "" as TypeIntervention | "",
    pannesConstatees: "",
    diagnosticsPoses: "",
    piecesRechange: "",
    statutApresIntervention: currentStatut as StatutEquipement,
    conclusions: "",
    interventionValidee: false
  });

  // Récupérer le rôle depuis le token JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error('Erreur lors de la lecture du token:', error);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, []);

  const resetForm = () => {
    setFormData({
      typeIntervention: "",
      pannesConstatees: "",
      diagnosticsPoses: "",
      piecesRechange: "",
      statutApresIntervention: currentStatut,
      conclusions: "",
      interventionValidee: false
    });
    setError("");
  };

  const getAuthToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("authToken")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.typeIntervention) {
      setError("Veuillez sélectionner un type d'intervention");
      return;
    }

    if (!formData.pannesConstatees && !formData.diagnosticsPoses) {
      setError("Veuillez renseigner au moins les pannes constatées ou le diagnostic");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token manquant. Veuillez vous reconnecter.");

      const payload = {
        equipementId,
        typeIntervention: formData.typeIntervention,
        pannesConstatees: formData.pannesConstatees || null,
        diagnosticsPoses: formData.diagnosticsPoses || null,
        piecesRechange: formData.piecesRechange || null,
        statutApresIntervention: formData.statutApresIntervention,
        conclusions: formData.conclusions || null,
        interventionValidee: formData.interventionValidee,
        dateIntervention: new Date().toISOString()
      };

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';
      const res = await fetch(`${API_BASE_URL}/api/interventions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout de l'intervention");
      }

      const result = await res.json();
      console.log("Intervention ajoutée avec succès:", result);

      alert("Intervention ajoutée avec succès !");

      if (onInterventionAdded) {
        onInterventionAdded();
      }

      handleClose();

    } catch (error) {
      console.error("Erreur:", error);
      setError(error instanceof Error ? error.message : "Erreur lors de l'ajout de l'intervention");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Ne pas afficher le bouton si l'utilisateur n'est pas technicien ou administrateur
  if (userRole !== "TECHNICIEN" && userRole !== "ADMINISTRATEUR") {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors shadow-md mx-auto"
      >
        <Wrench size={16} className="sm:size-5" />
        <span className="hidden sm:inline">Ajouter une intervention</span>
        <span className="inline sm:hidden">Ajouter</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#333652]">Nouvelle intervention</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Équipement : {equipementNom}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Type d'intervention */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Type d'intervention <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.typeIntervention}
                  onChange={(e) => setFormData(prev => ({ ...prev, typeIntervention: e.target.value as TypeIntervention }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner le type</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPARATION">Réparation</option>
                  <option value="INSPECTION">Inspection</option>
                </select>
              </div>

              {/* Pannes constatées */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pannes constatées
                </label>
                <textarea
                  rows={3}
                  value={formData.pannesConstatees}
                  onChange={(e) => setFormData(prev => ({ ...prev, pannesConstatees: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez les pannes observées..."
                />
              </div>

              {/* Diagnostics posés */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Diagnostics posés
                </label>
                <textarea
                  rows={3}
                  value={formData.diagnosticsPoses}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosticsPoses: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Décrivez le diagnostic effectué..."
                />
              </div>

              {/* Pièces de rechange */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pièces de rechange utilisées
                </label>
                <textarea
                  rows={2}
                  value={formData.piecesRechange}
                  onChange={(e) => setFormData(prev => ({ ...prev, piecesRechange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Listez les pièces remplacées..."
                />
              </div>

              {/* Statut après intervention */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Statut après intervention <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.statutApresIntervention}
                  onChange={(e) => setFormData(prev => ({ ...prev, statutApresIntervention: e.target.value as StatutEquipement }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FONCTIONNEL">Fonctionnel</option>
                  <option value="EN_PANNE">En panne</option>
                  <option value="HORS_SERVICE">Hors service</option>
                </select>
              </div>

              {/* Conclusions */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Conclusions
                </label>
                <textarea
                  rows={3}
                  value={formData.conclusions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conclusions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Conclusions de l'intervention..."
                />
              </div>

              {/* Intervention validée */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="interventionValidee"
                  checked={formData.interventionValidee}
                  onChange={(e) => setFormData(prev => ({ ...prev, interventionValidee: e.target.checked }))}
                  className="mr-2 text-blue-600"
                />
                <label htmlFor="interventionValidee" className="text-sm text-gray-700">
                  Intervention validée
                </label>
              </div>

              {/* Boutons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Ajout en cours..." : "Ajouter l'intervention"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PopupAjouterIntervention;
