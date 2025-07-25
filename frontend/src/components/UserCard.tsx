import Image from "next/image"

interface UserCardProps {
  type: string
  number: number
  className?: string
}

const UserCard = ({ type, number, className = "" }: UserCardProps) => {
  return (
    <div 
      className={`
        group relative overflow-hidden rounded-2xl p-6 flex-1 min-w-[130px]
        odd:bg-gradient-to-br odd:from-[#AED6F1] odd:to-[#85C1E9] 
        even:bg-gradient-to-br even:from-[#A8D5BA] even:to-[#7FB3D3]
        shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out
        transform hover:scale-105 cursor-pointer
        ${className}
      `}
    >
      {/* Accent decoratif */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/40 to-transparent" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-gray-600 font-medium shadow-sm">
          2024/2025
        </span>
        <div className="p-1 hover:bg-white/20 rounded-full transition-colors duration-200">
          <Image 
            src="/more.png" 
            alt="Options" 
            width={18} 
            height={18}
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
      
      {/* Number */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 leading-none">
          {number.toLocaleString()}
        </h1>
        <div className="w-8 h-0.5 bg-white/50 mt-2 group-hover:w-12 transition-all duration-300" />
      </div>
      
      {/* Type */}
      <h2 className="capitalize text-sm font-semibold text-[#2C3E50] tracking-wide">
        {type}
      </h2>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_70%)]" />
    </div>
  )
}

export default UserCard