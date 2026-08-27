import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-4 md:px-8 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:inline-block">
                    Total: {totalItems} {totalItems === 1 ? 'registro' : 'registros'}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">{currentPage}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">de {totalPages}</span>
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

export default Pagination;
