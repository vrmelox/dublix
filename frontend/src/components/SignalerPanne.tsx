import { useState } from "react";
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface SignalerPanneProps {
    equipmentName: string;
    equipmentId: string;
    onSubmit?: (data: FailureReport) => void;
    onSuccess?: () => void; // Callback pour rafraîchir les données parent
}

interface FailureReport {
    equipmentName: string;
    equipmentId: string;
    problemType: "panne" | "hors service";
    details: string;
    reportDate: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: {
        equipement: {
            id: string;
            nom: string;
            statut: string;
        };
        intervention: {
            id: string;
            dateSignalement: string;
            pannesSignalees: string;
        };
        problemType: string;
        nouveauStatut: string;
    };
    error?: string;
}

const SignalerPanne = ({ equipmentName, equipmentId, onSubmit, onSuccess }: SignalerPanneProps) => {
    const [problemType, setProblemType] = useState<"panne" | "hors service">("panne");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    // Configuration API
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'https://bioqrsuivi.com';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!details.trim()) {
            setErrorMessage("Veuillez fournir des détails sur la panne");
            setSubmitStatus('error');
            return;
        }

        if (details.trim().length < 10) {
            setErrorMessage("Veuillez fournir plus de détails (minimum 10 caractères)");
            setSubmitStatus('error');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('idle');
        setErrorMessage("");

        const failureReport: FailureReport = {
            equipmentName,
            equipmentId,
            problemType,
            details: details.trim(),
            reportDate: new Date().toISOString()
        };

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token d\'authentification manquant');
            }

            console.log('📡 Envoi du signalement de panne:', failureReport);

            const response = await fetch(`${API_BASE_URL}/api/equipments/${equipmentId}/report-breakdown`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemType,
                    details: details.trim()
                })
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            console.log('✅ Signalement réussi:', data);

            // Appeler les callbacks
            onSubmit?.(failureReport);
            onSuccess?.(); // Rafraîchir les données parent

            // Réinitialiser le formulaire
            setDetails("");
            setProblemType("panne");
            setSubmitStatus('success');

            // Masquer le message de succès après 3 secondes
            setTimeout(() => {
                setSubmitStatus('idle');
            }, 3000);

        } catch (error) {
            console.error('💥 Erreur signalement panne:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Erreur lors du signalement');
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetStatus = () => {
        setSubmitStatus('idle');
        setErrorMessage("");
    };

    return (
        <div className="mt-4 bg-white p-6 rounded-lg shadow-md border w-full">
            <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-[#333652]">
                    Signaler une Panne
                </h2>
            </div>

            {/* Messages de statut */}
            {submitStatus === 'success' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-green-800 font-medium">Panne signalée avec succès !</p>
                            <p className="text-green-600 text-sm">Les administrateurs et techniciens ont été notifiés.</p>
                        </div>
                    </div>
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div className="flex-1">
                            <p className="text-red-800 font-medium">Erreur lors du signalement</p>
                            <p className="text-red-600 text-sm">{errorMessage}</p>
                        </div>
                        <button
                            onClick={resetStatus}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nom de l'appareil (lecture seule) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de l'appareil
                    </label>
                    <input
                        type="text"
                        value={equipmentName}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                </div>

                {/* Type de problème */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de problème *
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="problemType"
                                value="panne"
                                checked={problemType === "panne"}
                                onChange={(e) => setProblemType(e.target.value as "panne" | "hors service")}
                                className="mr-2 text-red-600 focus:ring-red-500"
                                disabled={isSubmitting}
                            />
                            <span className="text-sm text-gray-700">
                                Panne <span className="text-gray-500">(équipement défaillant mais réparable)</span>
                            </span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="problemType"
                                value="hors service"
                                checked={problemType === "hors service"}
                                onChange={(e) => setProblemType(e.target.value as "panne" | "hors service")}
                                className="mr-2 text-red-600 focus:ring-red-500"
                                disabled={isSubmitting}
                            />
                            <span className="text-sm text-gray-700">
                                Hors service <span className="text-gray-500">(équipement inutilisable)</span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Détails sur la panne */}
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                        Détails sur la panne à signaler *
                    </label>
                    <textarea
                        id="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Décrivez précisément le problème rencontré, les symptômes observés, les circonstances..."
                        rows={4}
                        maxLength={500}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                        required
                        disabled={isSubmitting}
                    />
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                            Minimum 10 caractères requis
                        </p>
                        <p className={`text-xs ${details.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                            {details.length}/500
                        </p>
                    </div>
                </div>

                {/* Informations importantes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Après signalement :</p>
                            <ul className="text-xs space-y-1">
                                <li>• L'équipement sera automatiquement marqué comme "{problemType === 'panne' ? 'en panne' : 'hors service'}"</li>
                                <li>• Les administrateurs et techniciens recevront une notification</li>
                                <li>• Une intervention sera créée dans l'historique</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bouton soumettre */}
                <div className="flex justify-center pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting || !details.trim() || details.trim().length < 10}
                        className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Signalement en cours...</span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="w-4 h-4" />
                                <span>Signaler la Panne</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignalerPanne;
