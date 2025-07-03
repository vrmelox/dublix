import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function Forms() {
    return (
        <form className="h-full flex flex-col items-center justify-center px-[50px] py-0 w-full">
            <div className="relative my-2 border border-gray-300 rounded w-full p-2 ">
                <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-gray-500" />
                <input
                    type="email"
                    placeholder="email"
                    name="email"
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
                        name="password"
                        className="text-sm placeholder-gray-400 w-full outline-none"
                    />
                </div>
            </div>

        <Link href="/" className="text-sm text-blue-500 mt-2 mb-4 hover:underline">
            Mot de passe oublié ?
        </Link>

        <button className="bg-[#E57F84] text-white px-6 py-2 rounded shadow-md hover:bg-[#e5686d] transition-all duration-300 cursor-pointer">
            Connexion
        </button>
        </form>
    )
}