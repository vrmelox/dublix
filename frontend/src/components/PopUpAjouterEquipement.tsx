"use client";

import { useState } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";

const services = [
  "Cardiologie", "Réanimation", "Radiologie", "Chirurgie",
  "Urgences", "Soins Intensifs", "Gynécologie", "Néonatologie",
  "Pédiatrie", "Laboratoire", "Hématologie", "Anesthésie", "Banque de sang", "Néphrologie et Hémodialyse", "Urologie", "Orthopédie", "Bactériologie",
  "Réadaptation",
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

interface ErrorDetails {
  message: string;
  code?: string;
  details?: any;
  suggestion?: string;
}

const PopUpAjouterEquipement = ({ onEquipmentAdded }: Props) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [success, setSuccess] = useState("");
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
    setError(null);
    setSuccess("");
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('authToken');
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess("");

    const {
      nom, modele, services, photo, installationDate, description,
      numeroInventaire, typeMateriel, numeroSerie, marque, anneeFabrication
    } = formData;

    // Validation locale
    if (
      !nom || !modele || services.length === 0 || !photo ||
      !numeroInventaire || !typeMateriel || !numeroSerie ||
      !marque || !anneeFabrication
    ) {
      setError({
        message: "Veuillez remplir tous les champs obligatoires",
        code: "MISSING_FIELDS"
      });
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearNumber = parseInt(anneeFabrication, 10);

    if (isNaN(yearNumber) || yearNumber < 1900 || yearNumber > currentYear) {
      setError({
        message: `Veuillez entrer une année de fabrication valide entre 1900 et ${currentYear}`,
        code: "INVALID_YEAR"
      });
      return;
    }

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

      const token = getAuthToken();
      if (!token) {
        throw new Error("Token d'authentification manquant. Veuillez vous reconnecter.");
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';
      const response = await fetch(`${API_BASE_URL}/api/equipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      const result = await response.json();
      console.log('Réponse complète:', result);

      if (!response.ok) {
        // Gestion des erreurs avec le nouveau format
        const errorDetails: ErrorDetails = {
          message: result.error || 'Erreur lors de la création de l\'équipement',
          code: result.code,
          details: result.details,
          suggestion: result.details?.suggestion
        };

        // Messages spécifiques selon le code d'erreur
        switch (result.code) {
          case 'LIMIT_FILE_SIZE':
          case 'FILE_TOO_LARGE':
          case 'SERVER_FILE_TOO_LARGE':
            errorDetails.suggestion = "💡 Conseil: Utilisez un outil de compression d'image en ligne ou convertissez en JPEG.";
            break;
          case 'FORMAT_INVALIDE':
            errorDetails.suggestion = "💡 Formats acceptés: JPG, PNG, GIF, WebP";
            break;
          case 'EXTENSION_NON_AUTORISEE':
            errorDetails.suggestion = "💡 Extensions autorisées: .jpg, .jpeg, .png, .gif, .webp";
            break;
          case 'DUPLICATE_SERIAL_NUMBER':
            errorDetails.suggestion = "💡 Vérifiez le numéro de série ou contactez l'administrateur.";
            break;
          case 'MISSING_FILE':
            errorDetails.suggestion = "💡 Sélectionnez une image dans le champ 'Photo'.";
            break;
        }

        setError(errorDetails);
        return;
      }

      // Succès
      setSuccess("🎉 Équipement ajouté avec succès !");

      // Attendre un peu pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        resetForm();
        setOpen(false);
        if (onEquipmentAdded) {
          onEquipmentAdded();
        }
      }, 1500);

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setError({
        message: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'équipement",
        code: "NETWORK_ERROR"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  // Composant pour afficher les erreurs avec style amélioré
  const ErrorDisplay = ({ error }: { error: ErrorDetails }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <p className="text-red-800 font-medium">{error.message}</p>
          {error.suggestion && (
            <p className="text-red-700 text-sm mt-2">{error.suggestion}</p>
          )}
          {error.details && error.details.maxSize && (
            <div className="text-red-600 text-xs mt-2 p-2 bg-red-100 rounded">
              <p><strong>Limite:</strong> {error.details.maxSize}</p>
              {error.details.allowedFormats && (
                <p><strong>Formats:</strong> {error.details.allowedFormats.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Composant pour afficher le succès
  const SuccessDisplay = ({ message }: { message: string }) => (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div className="flex items-center">
        <CheckCircle className="text-green-500 mr-3" size={20} />
        <p className="text-green-800 font-medium">{message}</p>
      </div>
    </div>
  );

  // Indicateur de taille de fichier
  const FileSizeIndicator = ({ file }: { file: File | null }) => {
    if (!file) return null;

    const sizeInMB = file.size / (1024 * 1024);
    const isLarge = sizeInMB > 3; // Avertissement si > 3MB
    const isTooLarge = sizeInMB > 5; // Erreur si > 5MB

    return (
      <div className={`text-xs mt-1 flex items-center ${isTooLarge ? 'text-red-600' : isLarge ? 'text-orange-600' : 'text-green-600'
        }`}>
        <Info size={12} className="mr-1" />
        <span>
          Taille: {sizeInMB.toFixed(2)} MB
          {isTooLarge && ' (⚠️ Trop volumineux!)'}
          {isLarge && !isTooLarge && ' (⚠️ Fichier volumineux)'}
        </span>
      </div>
    );
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
              {error && <ErrorDisplay error={error} />}
              {success && <SuccessDisplay message={success} />}

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

              {/* Photo avec indicateur de taille */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Photo <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Max: 5MB - JPG, PNG, GIF, WebP)</span>
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
                  <div className="mt-1">
                    <p className="text-sm text-green-600">
                      ✓ Fichier sélectionné : {formData.photo.name}
                    </p>
                    <FileSizeIndicator file={formData.photo} />
                  </div>
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
