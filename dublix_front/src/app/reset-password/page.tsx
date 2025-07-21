'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
    const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
    const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Récupérer userId et role depuis le token
    const getUserFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return { id: payload.id, role: payload.role };
        } catch {
            return null;
        }
    };

    // Fonction pour rediriger selon le rôle
    const redirectBasedOnRole = (role: string) => {
        switch (role) {
            case 'ADMINISTRATEUR':
                router.push('/admin');
                break;
            case 'UTILISATEUR':
                router.push('/utilisateur');
                break;
            case 'TECHNICIEN':
                router.push('/technicien');
                break;
            default:
                router.push('/');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (nouveauMotDePasse.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
        }

        if (nouveauMotDePasse !== confirmMotDePasse) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (nouveauMotDePasse === '12345678') {
            setError('Vous ne pouvez pas utiliser le mot de passe par défaut');
            setLoading(false);
            return;
        }

        const userInfo = getUserFromToken();
        if (!userInfo) {
            setError('Session expirée, veuillez vous reconnecter');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: userInfo.id,
                    nouveauMotDePasse
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur lors de la mise à jour');
                return;
            }

            // Rediriger selon le rôle de l'utilisateur
            redirectBasedOnRole(userInfo.role);

        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Changement de mot de passe requis
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Vous devez changer votre mot de passe par défaut pour continuer
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Nouveau mot de passe */}
                    <div className="relative border border-gray-300 rounded p-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Nouveau mot de passe"
                                value={nouveauMotDePasse}
                                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                                required
                                className="text-sm placeholder-gray-400 outline-none flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FontAwesomeIcon 
                                    icon={showPassword ? faEyeSlash : faEye} 
                                    className="w-4 h-4" 
                                />
                            </button>
                        </div>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div className="relative border border-gray-300 rounded p-3">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-gray-500" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmer le mot de passe"
                                value={confirmMotDePasse}
                                onChange={(e) => setConfirmMotDePasse(e.target.value)}
                                required
                                className="text-sm placeholder-gray-400 outline-none flex-1"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FontAwesomeIcon 
                                    icon={showConfirmPassword ? faEyeSlash : faEye} 
                                    className="w-4 h-4" 
                                />
                            </button>
                        </div>
                    </div>

                    {/* Critères du mot de passe */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p className={nouveauMotDePasse.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                            ✓ Au moins 8 caractères
                        </p>
                        <p className={nouveauMotDePasse !== '12345678' && nouveauMotDePasse.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                            ✓ Différent du mot de passe par défaut
                        </p>
                        <p className={nouveauMotDePasse === confirmMotDePasse && nouveauMotDePasse.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                            ✓ Mots de passe identiques
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E57F84] text-white py-3 rounded shadow-md hover:bg-[#e5686d] transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    );
}