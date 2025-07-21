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

  useEffect(() => {
    const role =
      localStorage.getItem("userRole") ||
      localStorage.getItem("role") ||
      sessionStorage.getItem("userRole") ||
      sessionStorage.getItem("role");

    if (!role) {
      const userInfo =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          if (user.role) setUserRole(user.role);
        } catch (e) {
          console.error("Erreur parsing user info:", e);
        }
      }
    } else {
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      statutApresIntervention: currentStatut
    }));
  }, [currentStatut]);

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

      const res = await fetch("http://localhost:4000/api/interventions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Erreur HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Intervention créée:", data);
      alert("Intervention ajoutée avec succès !");
      resetForm();
      setOpen(false);
      onInterventionAdded?.();
    } catch (err: any) {
      console.error("❌ Erreur soumission:", err);
      setError(err?.message || "Erreur inconnue lors de l'ajout de l'intervention");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

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
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && <div className="bg-red-100 border text-red-700 px-4 py-2 rounded">{error}</div>}

              <div>
                <label className="block font-medium mb-1">Type d'intervention *</label>
                <select
                  required
                  value={formData.typeIntervention}
                  onChange={e => setFormData(p => ({ ...p, typeIntervention: e.target.value as TypeIntervention }))}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="REPARATION">Réparation</option>
                  <option value="INSPECTION">Inspection</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Pannes constatées</label>
                <textarea
                  value={formData.pannesConstatees}
                  onChange={e => setFormData(p => ({ ...p, pannesConstatees: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Diagnostics posés</label>
                <textarea
                  value={formData.diagnosticsPoses}
                  onChange={e => setFormData(p => ({ ...p, diagnosticsPoses: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Pièces de rechange</label>
                <textarea
                  value={formData.piecesRechange}
                  onChange={e => setFormData(p => ({ ...p, piecesRechange: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Statut après intervention *</label>
                <select
                  required
                  value={formData.statutApresIntervention}
                  onChange={e => setFormData(p => ({ ...p, statutApresIntervention: e.target.value as StatutEquipement }))}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="FONCTIONNEL">Fonctionnel</option>
                  <option value="EN_PANNE">En panne</option>
                  <option value="HORS_SERVICE">Hors service</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Conclusions</label>
                <textarea
                  value={formData.conclusions}
                  onChange={e => setFormData(p => ({ ...p, conclusions: e.target.value }))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              {userRole === "ADMINISTRATEUR" && (
                <div className="flex items-center">
                  <input
                    id="validee"
                    type="checkbox"
                    checked={formData.interventionValidee}
                    onChange={e => setFormData(p => ({ ...p, interventionValidee: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="validee">Valider immédiatement</label>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

export default PopupAjouterIntervention;