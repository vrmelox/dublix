import { useState } from "react";

interface SignalerPanneProps {
    equipmentName: string;
    equipmentId: string;
    onSubmit?: (data: FailureReport) => void;
}

interface FailureReport {
    equipmentName: string;
    equipmentId: string;
    problemType: "panne" | "hors service";
    details: string;
    reportDate: string;
}

const SignalerPanne = ({ equipmentName, equipmentId, onSubmit }: SignalerPanneProps) => {
    const [problemType, setProblemType] = useState<"panne" | "hors service">("panne");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!details.trim()) {
            alert("Veuillez fournir des détails sur la panne");
            return;
        }

        setIsSubmitting(true);

        const failureReport: FailureReport = {
            equipmentName,
            equipmentId,
            problemType,
            details: details.trim(),
            reportDate: new Date().toISOString()
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            onSubmit?.(failureReport);
            
            setDetails("");
            setProblemType("panne");
            
            alert("Panne signalée avec succès!");
        } catch (error) {
            alert("Erreur lors du signalement de la panne");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className=" mt-4 bg-white p-6 rounded-lg shadow-md border w-full">
            <h2 className="text-xl font-bold text-[#333652] mb-4">
                Signaler une Panne
            </h2>
            
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
                        Type de problème
                    </label>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="problemType"
                                value="panne"
                                checked={problemType === "panne"}
                                onChange={(e) => setProblemType(e.target.value as "panne" | "hors service")}
                                className="mr-2 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Panne</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="problemType"
                                value="hors service"
                                checked={problemType === "hors service"}
                                onChange={(e) => setProblemType(e.target.value as "panne" | "hors service")}
                                className="mr-2 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Hors service</span>
                        </label>
                    </div>
                </div>

                {/* Détails sur la panne */}
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                        Détails sur la panne à signaler
                    </label>
                    <textarea
                        id="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Décrivez le problème rencontré..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Caractères: {details.length}/500
                    </p>
                </div>

                {/* Bouton soumettre */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting || !details.trim()}
                        className="cursor-pointer text-center w-sm py-2 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? "Envoi en cours..." : "Signaler la Panne"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignalerPanne;