import Pagination from "@/components/Pagination"
import Table from "@/components/Table"
import TableSearch from "@/components/TableSearch"
import Image from "next/image"
import Link from "next/link"
import { role, techniciansData } from "@/lib/data"

type Technician = {
    id: number;
    technicianId: string;
    name: string;
    email: string;
    photo: string;
    phone: string;
    adress: string;
}

const columns = [
    {
        header: "Info",
        accessor: "info"
    },
    {
        header: "ID Technicien",
        accessor: "technicianId",
        className: "hidden md:table-cell",
    },
    {
        header: "Contact",
        accessor: "phone",
        className: "hidden lg:table-cell",
    },
    {
        header: "Adresse",
        accessor: "adress",
        className: "hidden lg:table-cell",
    },
    {
        header: "Actions",
        accessor: "actions",
    },
];

const TechnicianListPage = () => {

    const renderRow = (item: Technician) => (
        <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-bensPurpleLight">
            <td className="flex items-center gap-4 p-4">
                <Image 
                    src={item.photo} 
                    alt={`Photo de ${item.name}`} 
                    width={40} 
                    height={40} 
                    className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item?.email}</p>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.technicianId}</td>
            <td className="hidden lg:table-cell">{item.phone}</td>
            <td className="hidden lg:table-cell">{item.adress}</td>
            <td className="">
                <div className="flex items-center gap-2">
                    <Link href={`/list/technicians/${item.id}`}>
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-benSky">
                            <Image src="/view.png" alt="Voir" width={16} height={16}/>
                        </button>
                    </Link>
                    {role === "admin" && (
                        <button className="w-7 h-7 flex items-center justify-center rounded-full bg-bensPurple">
                            <Image src="/delete.png" alt="Supprimer" width={16} height={16}/>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            {/* TOP */}
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Liste des techniciens</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow cursor-pointer">
                            <Image src="/filter.png" alt="Filtrer" height={20} width={20}/>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow cursor-pointer">
                            <Image src="/sort.png" alt="Trier" height={20} width={20}/>
                        </button>
                        {role === "admin" && (
                            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bensYellow cursor-pointer">
                                <Image src="/plus.png" alt="Ajouter" height={20} width={20}/>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {/* LIST */}
            <Table columns={columns} renderRow={renderRow} data={techniciansData}/>
            {/* PAGINATION */}
            <Pagination/>
        </div>
    )
}

export default TechnicianListPage