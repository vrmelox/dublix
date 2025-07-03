import Link from "next/link";
import Image from "next/image";
import { role } from "@/lib/data";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/user.png",
        label: "Utilisateurs",
        href: "/list/users",
        visible: ["admin"],
      },
      {
        icon: "/technicien.png",
        label: "Techniciens",
        href: "/list/techniciens",
        visible: ["admin"],
      },
      {
        icon: "/equipment.png",
        label: "Equipments",
        href: "/list/equipments",
        visible: ["admin", "user", "technician"],
      },
      {
        icon: "/stats.png",
        label: "Statistiques",
        href: "/list/attendance",
        visible: ["admin", "technician"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin","technician"],
      },
      {
        icon: "/journal.png",
        label: "Historique",
        href: "/list/messages",
        visible: ["admin", "technician"],
      },
      {
        icon: "/notification.png",
        label: "Notifications",
        href: "/list/announcements",
        visible: ["admin", "technician", "user"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profil.png",
        label: "Profil",
        href: "/profil",
        visible: ["admin", "technician", "user"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "technician", "user"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "technician", "user"],
      },
    ],
  },
];

const Menu = () => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map(i =>(
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4 text-xs uppercase tracking-wider">{i.title}</span>
          {i.items.map(item => {
            if (item.visible.includes(role)) {
              return (
                <Link 
                  href={item.href} 
                  key={item.label} 
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-3 px-3 rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 group"
                >
                  <Image 
                    src={item.icon} 
                    alt="" 
                    width={20} 
                    height={20}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="hidden lg:block font-medium">{item.label}</span>
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