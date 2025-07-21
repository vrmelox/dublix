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
  modele: string;
  services: string[];
  photo: File | null;
  installationDate: string;
  description: string;
  numeroInventaire: string;
  typeMateriel: string;
  numeroSerie: string;
  marque: string;
  anneeFabrication: string;
};

interface Props {
  onEquipmentAdded?: () => void;
}

const PopUpAjouterEquipement = ({ onEquipmentAdded }: Props) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<NewEquipement>({
    nom: "",
    modele: "",
    services: [],
    photo: null,
    installationDate: "",
    description: "",
    numeroInventaire: "",
    typeMateriel: "",
    numeroSerie: "",
    marque: "",
    anneeFabrication: "",
  });

  const resetForm = () => {
    setFormData({
      nom: "",
      modele: "",
      services: [],
      photo: null,
      installationDate: "",
      description: "",
      numeroInventaire: "",
      typeMateriel: "",
      numeroSerie: "",
      marque: "",
      anneeFabrication: "",
    });
    setError("");
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

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

  const logFormData = (formData: FormData) => {
    console.log('📋 === DÉBOGAGE DONNÉES ENVOYÉES ===');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  📎 ${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: new Date(value.lastModified).toLocaleString()
        });
      } else {
        console.log(`  📝 ${key}:`, value);
        if (key === 'services') {
          try {
            const parsed = JSON.parse(value as string);
            console.log(`    📊 ${key} (parsé):`, parsed);
          } catch {
            console.log(`    ⚠️ Erreur parsing JSON pour ${key}`);
          }
        }
      }
    }
    console.log('🔚 === FIN DÉBOGAGE ===\n');
  };

  const logFormState = () => {
    console.log('🎯 === DÉBOGAGE ÉTAT DU FORMULAIRE ===');
    console.log('📊 État actuel de formData:', {
      ...formData,
      photo: formData.photo ? {
        name: formData.photo.name,
        size: formData.photo.size,
        type: formData.photo.type
      } : null
    });
    console.log('🔚 === FIN DÉBOGAGE ÉTAT ===\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const {
      nom, modele, services, photo, installationDate, description,
      numeroInventaire, typeMateriel, numeroSerie, marque, anneeFabrication
    } = formData;

    logFormState();

    if (
      !nom || !modele || services.length === 0 || !photo ||
      !numeroInventaire || !typeMateriel || !numeroSerie ||
      !marque || !anneeFabrication
    ) {
      console.log('❌ Validation échouée - champs manquants:', {
        nom: !nom,
        modele: !modele,
        services: services.length === 0,
        photo: !photo,
        numeroInventaire: !numeroInventaire,
        typeMateriel: !typeMateriel,
        numeroSerie: !numeroSerie,
        marque: !marque,
        anneeFabrication: !anneeFabrication
      });
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNumber = parseInt(anneeFabrication, 10);

    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
      console.log('❌ Validation année échouée:', { anneeFabrication, yearNumber, currentYear });
      setError(`Veuillez entrer une année de fabrication valide entre 1900 et ${currentYear}`);
      return;
    }

    console.log('✅ Validation réussie, préparation des données...');

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("nom", nom);
      data.append("modele", modele);
      data.append("services", JSON.stringify(services));
      data.append("installationDate", installationDate);
      data.append("description", description);
      data.append("numeroInventaire", numeroInventaire);
      data.append("typeMateriel", typeMateriel);
      data.append("numeroSerie", numeroSerie);
      data.append("marque", marque);
      data.append("anneeFabrication", anneeFabrication);
      if (photo) data.append("photo", photo);

      logFormData(data);

      // ✅ UTILISATION DE LA FONCTION CORRIGÉE
      const token = getAuthToken();
      console.log('🔑 Token d\'authentification:', token ? `${token.substring(0, 20)}...` : 'Aucun');

      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      // ✅ HEADERS TOUJOURS AVEC AUTHORIZATION
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };

      console.log('🚀 Envoi de la requête vers:', 'http://localhost:4000/api/equipments');

      const response = await fetch('http://localhost:4000/api/equipments', {
        method: 'POST',
        headers,
        body: data,
      });

      console.log('📡 Réponse reçue:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type');
      console.log('  Content-Type:', contentType);

      if (!response.ok) {
        const responseText = await response.text();
        console.log('❌ Réponse d\'erreur brute:', responseText);

        let errorMessage = 'Erreur lors de la création de l\'équipement';
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(responseText);
            console.log('📄 Données d\'erreur parsées:', errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            console.error('⚠️ Erreur de parsing JSON:', parseError);
            errorMessage = `Erreur serveur: ${responseText}`;
          }
        } else {
          errorMessage = responseText || `Erreur HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('✅ Réponse de succès brute:', responseText);

      let result;
      if (contentType && contentType.includes('application/json')) {
        try {
          result = JSON.parse(responseText);
          console.log('📄 Données de succès parsées:', result);
        } catch (parseError) {
          console.error('⚠️ Erreur de parsing JSON pour la réponse de succès:', parseError);
          result = { message: 'Équipement créé avec succès' };
        }
      } else {
        result = { message: responseText || 'Équipement créé avec succès' };
      }

      console.log('🎉 Équipement créé avec succès:', result);
      alert("Équipement ajouté avec succès !");

      resetForm();
      setOpen(false);

      if (onEquipmentAdded) {
        console.log('🔄 Callback onEquipmentAdded appelé');
        onEquipmentAdded();
      }

    } catch (error) {
      console.error('💥 Erreur lors de la création:', error);
      console.error('💥 Type d\'erreur:', typeof error);
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'N/A');
      setError(error instanceof Error ? error.message : "Erreur lors de l'ajout de l'équipement");
    } finally {
      setIsSubmitting(false);
      console.log('🏁 Fin de la soumission');
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-slate-800 text-white rounded-md cursor-pointer hover:bg-slate-600 transition-colors"
      >
        Ajouter un Équipement
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-[#333652]">Ajouter un Équipement</h2>
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

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de l'équipement"
                />
              </div>

              {/* Modèle */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Modèle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.modele}
                  onChange={(e) => setFormData(prev => ({ ...prev, modele: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Modèle de l'équipement"
                />
              </div>

              {/* Champs supplémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Numéro d'inventaire <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numeroInventaire}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroInventaire: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: INV001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type de matériel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.typeMateriel}
                    onChange={(e) => setFormData(prev => ({ ...prev, typeMateriel: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: Équipement médical"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Numéro de série <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numeroSerie}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroSerie: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: SN123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.marque}
                    onChange={(e) => setFormData(prev => ({ ...prev, marque: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: Philips"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Année de fabrication <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.anneeFabrication}
                    onChange={(e) => setFormData(prev => ({ ...prev, anneeFabrication: e.target.value }))}
                    required
                    min={1900}
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: 2020"
                  />
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
                  {services.map((service) => (
                    <label key={service} className="flex items-center text-sm cursor-pointer hover:bg-gray-100 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="mr-2 text-blue-600"
                      />
                      {service}
                    </label>
                  ))}
                </div>
                {formData.services.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formData.services.length} service{formData.services.length > 1 ? 's' : ''} sélectionné{formData.services.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      photo: e.target.files?.[0] || null
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {formData.photo && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Fichier sélectionné : {formData.photo.name}
                  </p>
                )}
              </div>

              {/* Date d'installation */}
              <div>
                <label className="block text-sm font-medium mb-2">Date d'installation</label>
                <input
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, installationDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description optionnelle de l'équipement..."
                />
              </div>

              {/* Buttons */}
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
                  {isSubmitting ? "Ajout en cours..." : "Ajouter l'équipement"}
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