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

    const getVisiblePages = (isMobile: boolean = false) => {
        const pages = [];
        const maxVisible = isMobile ? 3 : 5; // 3 sur mobile, 5 sur desktop
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (isMobile) {
                // Version mobile simplifiée
                if (activePage === 1) {
                    pages.push(1, 2, "...", totalPages);
                } else if (activePage === totalPages) {
                    pages.push(1, "...", totalPages - 1, totalPages);
                } else {
                    pages.push(1, "...", activePage, "...", totalPages);
                }
            } else {
                // Version desktop complète
                if (activePage <= 3) {
                    pages.push(1, 2, 3, 4, "...", totalPages);
                } else if (activePage >= totalPages - 2) {
                    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                    pages.push(1, "...", activePage - 1, activePage, activePage + 1, "...", totalPages);
                }
            }
        }
        
        return pages;
    };

    const [isMobile, setIsMobile] = useState(false);
    const [visiblePages, setVisiblePages] = useState(getVisiblePages());

    // Détection mobile côté client uniquement
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
            setVisiblePages(getVisiblePages(mobile));
        };

        // Initial check
        checkMobile();

        // Listen for resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [activePage, totalPages]);

    // Ne pas afficher la pagination si il n'y a qu'une seule page
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="p-2 sm:p-4 flex items-center justify-between text-gray-500 gap-2">
            {/* Bouton Précédent */}
            <button 
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
                className="px-2 py-2 sm:px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors flex-shrink-0"
            >
                <span className="hidden sm:inline">Précédent</span>
                <span className="sm:hidden">‹</span>
            </button>
            
            {/* Pages */}
            <div className="flex items-center gap-1 sm:gap-2 text-sm overflow-hidden">
                {visiblePages.map((page, index) => (
                    page === "..." ? (
                        <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-sm transition-colors text-xs sm:text-sm min-w-[28px] sm:min-w-[32px] flex-shrink-0 ${
                                activePage === page
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>
            
            {/* Bouton Suivant */}
            <button 
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
                className="px-2 py-2 sm:px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors flex-shrink-0"
            >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">›</span>
            </button>
        </div>
    );
};

export default Pagination;
