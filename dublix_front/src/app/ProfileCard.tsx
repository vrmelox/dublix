import React from "react";
import { jost } from "./layout";

interface ProfileCardProps {
  title: string;
  imgSrc: string;
  alt?: string;
}

export default function ProfileCard({ title, imgSrc, alt }: ProfileCardProps) {
  return (
    <div className={`
      ${jost.className} group font-bold
      flex flex-col items-center
      border-2 bg-white p-4
      rounded-2xl shadow-md cursor-pointer
      hover:border-[#0A79DA] hover:bg-[#004369]  hover:shadow-lg hover:scale-105
      transition-all ease-in-out duration-300 max-w-[140px] lg:max-w-[200px] 
    `}>
      <img
        src={imgSrc}
        alt={alt || `Profil de ${title}`}
        className="w-30 h-16 mb-4"
      />
      <p className="text-[18px] group-hover:text-white">{title}</p>
    </div>
  );
}
