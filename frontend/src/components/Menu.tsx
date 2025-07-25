"use client"
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/app/contexts/UserContext";
import { useRouter } from 'next/navigation';
import { usePathname } from "next/navigation";

const Menu = () => {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    logout();
    router.push('/'); // Redirection vers la page d'accueil
  };

  // Mapping des rôles pour la compatibilité
  const getRoleForMenu = (userRole: string) => {
    switch (userRole) {
      case 'ADMINISTRATEUR':
        return 'ADMINISTRATEUR';
      case 'TECHNICIEN':
        return 'TECHNICIEN';
      case 'UTILISATEUR':
        return 'UTILISATEUR';
      default:
        return 'UTILISATEUR';
    }
  };

  const menuItems = [
    {
      title: "MENU",
      items: [
        {
          icon: "/home.png",
          label: "Home",
          href: `/${user?.role.toLowerCase() || ''}`,
          visible: ["ADMINISTRATEUR", "TECHNICIEN", "UTILISATEUR"],
        },
        {
          icon: "/user.png",
          label: "Utilisateurs",
          href: "/list/users",
          visible: ["ADMINISTRATEUR"],
        },
        {
          icon: "/technicien.png",
          label: "Techniciens",
          href: "/list/techniciens",
          visible: ["ADMINISTRATEUR"],
        },
        {
          icon: "/equipment.png",
          label: "Equipments",
          href: "/list/equipments",
          visible: ["ADMINISTRATEUR", "UTILISATEUR", "TECHNICIEN"],
        },
        {
          icon: "/stats.png",
          label: "Statistiques",
          href: "/statistiques",
          visible: ["ADMINISTRATEUR", "TECHNICIEN"],
        },
        {
          icon: "/journal.png",
          label: "Historique",
          href: "/historique",
          visible: ["ADMINISTRATEUR", "TECHNICIEN"],
        },
        {
        	icon: "/notification.png",
        	label: "Notifications",
        	href: "/notifications",
        	visible: ["ADMINISTRATEUR", "TECHNICIEN", "UTILISATEUR"],	
        },
      ],
    },
    {
      title: "ACTIONS",
      items: [
        {
          icon: "/logout.png",
          label: "Déconnexion",
          href: "#",
          visible: ["ADMINISTRATEUR", "TECHNICIEN", "UTILISATEUR"],
          isLogout: true,
        },
      ],
    },
  ];

  // Si l'utilisateur n'est pas encore chargé, afficher un loader
  if (!user) {
    return (
      <div className="mt-4 text-sm">
        <div className="flex items-center justify-center p-4">
          <span className="text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  const userRoleForMenu = getRoleForMenu(user.role);

  return (
    <div className="mt-4 text-sm">
      {menuItems.map(i => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">{i.title}</span>
          {i.items.map(item => {
            if (item.visible.includes(userRoleForMenu)) {
              const isActive = pathname === item.href;
              
              // Si c'est le bouton de déconnexion, utiliser un bouton au lieu d'un Link
              if (item.isLogout) {
                return (
                  <button
                    key={item.label}
                    onClick={handleLogout}
                    className="flex items-center justify-center lg:justify-start gap-4 py-3 px-3 rounded-xl transition-all duration-200 group text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      <Image 
                        src={item.icon} 
                        alt={`Icône ${item.label}`}
                        width={32}
                        height={32}
                        className="w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 p-1 rounded-md shadow-sm transition-all duration-200 object-contain bg-gray-200 lg:bg-gray-300 group-hover:bg-red-100"
                      />
                    </div>
                    <span className="hidden lg:block">{item.label}</span>
                  </button>
                )
              }
              
              return (
                <Link 
                  href={item.href} 
                  key={item.label} 
                  className={`flex items-center justify-center lg:justify-start gap-4 py-3 px-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Image 
                      src={item.icon} 
                      alt={`Icône ${item.label}`}
                      width={32}
                      height={32}
                      className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-8 lg:h-8 p-1 rounded-md shadow-sm transition-all duration-200 object-contain ${
                        isActive 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'bg-gray-200 lg:bg-gray-300'
                      }`}
                    />
                  </div>
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              )
            }
          })}
        </div>
      ))}
    </div>
  )
}

export default Menu;
