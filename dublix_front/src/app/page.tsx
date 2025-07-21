import ProfileCard from "./ProfileCard";
import Footer from "./Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.8)),url('/pouls.jpg')] bg-cover bg-center bg-no-repeat relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-amber-500/10 rounded-full blur-xl animate-pulse [animation-delay:0.5s]" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 py-12 md:py-16 lg:py-20 flex flex-col items-center justify-center text-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight mb-2">
            Bienvenue sur{" "} 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A79DA] via-[#4A90E2] to-[#C10A6C] bg-[length:200%_200%] animate-[gradient-x_3s_ease_infinite]">
              BioQR-Suivi
            </span>
          </h1>
          
          <p className="italic text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 mb-8 font-light">
            votre boîte à outils médicaux
          </p>
          
          <div className="relative">
            <h2 className="text-amber-400 font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl leading-relaxed max-w-3xl mx-auto">
              Un accès intelligent, sécurisé et personnalisé à vos outils
            </h2>
            
            {/* Decorative line */}
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="relative z-10 flex justify-center items-center px-4 py-8 md:py-12">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 justify-items-center">
            <Link 
              href="/administrateur" 
              className="transform hover:scale-105 transition-all duration-300 hover:drop-shadow-2xl group"
            >
              <div className="relative">
                <ProfileCard title="Administrateur" imgSrc="/the_admin.svg" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </Link>
            
            <Link 
              href="/technicien" 
              className="transform hover:scale-105 transition-all duration-300 hover:drop-shadow-2xl group"
            >
              <div className="relative">
                <ProfileCard title="Technicien" imgSrc="/technician.svg" />
                <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </Link>
            
            <Link 
              href="/utilisateur" 
              className="transform hover:scale-105 transition-all duration-300 hover:drop-shadow-2xl group md:col-span-2 lg:col-span-1"
            >
              <div className="relative">
                <ProfileCard title="Utilisateur" imgSrc="/user.svg" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 text-white mt-8 md:mt-12 lg:mt-16">
        <Footer />
      </footer>
      
      {/* Styles CSS intégrés dans le DOM */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes gradient-x {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
        `
      }} />
    </div>
  );
}