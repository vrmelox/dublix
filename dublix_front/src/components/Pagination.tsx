"use client"

import { useEffect, useState } from "react";

interface PaginationProps {
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

const Pagination = ({ 
    totalPages = 10, 
    currentPage = 1, 
    onPageChange 
}: PaginationProps) => {
    const [activePage, setActivePage] = useState(currentPage);

    // Synchroniser avec les props externes
    useEffect(() => {
        setActivePage(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== activePage) {
            setActivePage(page);
            onPageChange?.(page);
        }
    };

    const getVisiblePages = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (activePage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (activePage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages);
            }
        }
        
        return pages;
    };

    const visiblePages = getVisiblePages();

    // Ne pas afficher la pagination si il n'y a qu'une seule page
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="p-4 flex items-center justify-between text-gray-500">
            <button 
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
                className="p-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
            >
                Précédent
            </button>
            
            <div className="flex items-center gap-2 text-sm">
                {visiblePages.map((page, index) => (
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`px-3 py-1 rounded-sm transition-colors ${
                                activePage === page
                                    ? "bg-benSky text-white"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>
            
            <button 
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
                className="p-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
            >
                Suivant
            </button>
        </div>
    );
};

export default Pagination;