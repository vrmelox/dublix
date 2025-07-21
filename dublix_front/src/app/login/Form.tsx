'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Forms() {
    const [email, setEmail] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Fonction pour rediriger selon le rôle
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:4000/api/users/login', {
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

            // Sauvegarder le token
            localStorage.setItem('token', data.token);
            
            // Récupérer le rôle depuis le token pour la redirection
            const payload = JSON.parse(atob(data.token.split('.')[1]));
            const userRole = payload.role;
            
            // Si forceReset est true, rediriger vers reset password
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

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col items-center justify-center px-[50px] py-0 w-full">
            {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                    {error}
                </div>
            )}
            
            <div className="relative my-2 border border-gray-300 rounded w-full p-2">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-500" />
                    <input
                        type="email"
                        placeholder="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="text-sm placeholder-gray-400 outline-none w-full"
                    />
                </div>
            </div>
            
            <div className="relative my-2 w-full p-2 border border-gray-300 rounded">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faLock} className="w-4 h-4 text-gray-500" />
                    <input
                        type="password"
                        placeholder="mot de passe"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        required
                        className="text-sm placeholder-gray-400 w-full outline-none"
                    />
                </div>
            </div>

            <Link href="/" className="text-sm text-blue-500 mt-2 mb-4 hover:underline">
                Mot de passe oublié ?
            </Link>

            <button 
                type="submit" 
                disabled={loading}
                className="bg-[#E57F84] text-white px-6 py-2 rounded shadow-md hover:bg-[#e5686d] transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
                {loading ? 'Connexion...' : 'Connexion'}
            </button>
        </form>
    );
}