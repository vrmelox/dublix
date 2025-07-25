'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Form() {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    const redirectBasedOnRole = (role: string) => {
        switch (role) {
            case 'ADMINISTRATEUR':
                router.push('/administrateur');
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

    // Vérifier si l'utilisateur est déjà connecté
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Vérifier si le token n'est pas expiré
                const currentTime = Date.now() / 1000;
                if (payload.exp && payload.exp > currentTime) {
                    // Token valide, rediriger vers le dashboard approprié
                    redirectBasedOnRole(payload.role);
                    return;
                }
            } catch (err) {
                // Token invalide, le supprimer
                localStorage.removeItem('token');
            }
        }
        setChecking(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    motDePasse
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erreur de connexion');
                return;
            }

            localStorage.setItem('token', data.token);
            
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            const userRole = payload.role;
            
            if (data.forceReset) {
                router.push('/reset-password');
            } else {
                redirectBasedOnRole(userRole);
            }

        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    // Afficher un spinner pendant la vérification du token
    if (checking) {
        return (
            <div className="w-full max-w-md mx-auto flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
                        {error}
                    </div>
                )}
                
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    />
                </div>
                
                <div>
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Connexion en cours...</span>
                        </div>
                    ) : (
                        'Se connecter'
                    )}
                </button>

                <div className="text-center">
                    <a href="/reset-password" className="text-sm text-blue-600 hover:underline">
                        Mot de passe oublié ?
                    </a>
                </div>
            </form>
        </div>
    );
}
