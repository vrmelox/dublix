"use client"
import Link from "next/link";
import Image from "next/image";
import { role } from "@/lib/data";
import { useState } from "react";
import { usePathname } from "next/navigation";

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
        href: "/statistiques",
        visible: ["admin", "technician"],
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
  const pathname = usePathname();
  return (
    <div className="mt-4 text-sm">
      {menuItems.map(i =>(
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">{i.title}</span>
          {i.items.map(item => {
            if (item.visible.includes(role)) {
            const isActive = pathname === item.href;
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
                      alt="" 
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