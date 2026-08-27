import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Clock, User, Maximize2, X } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';
import Pagination from '../common/Pagination';

function PoolRecordCard({ record, onImageClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5">
                            <Droplet size={12} /> Piscina
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {formatDateTime(record.data_registro)}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">pH</span>
                            <span className={`font-black text-lg ${record.ph >= 7.2 && record.ph <= 7.6 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.ph}
                            </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">Cloro</span>
                            <span className={`font-black text-lg ${record.cloro >= 1 && record.cloro <= 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.cloro} ppm
                            </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">Alcalinidade</span>
                            <span className={`font-black text-lg ${record.alcalinidade >= 80 && record.alcalinidade <= 120 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.alcalinidade} ppm
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-xs font-bold pt-4">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-amber-400" /> Operador: {record.perfis?.nome || 'Desconhecido'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 self-center md:self-start">
                    <div className="flex -space-x-4">
                        {[...(record.fotos_antes || []), ...(record.fotos_depois || [])].slice(0, 3).map((url, i) => (
                            <div key={i} className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg overflow-hidden relative">
                                <img src={url} className="w-full h-full object-cover" />
                                {i === 2 && [...(record.fotos_antes || []), ...(record.fotos_depois || [])].length > 3 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                        +{[...(record.fotos_antes || []), ...(record.fotos_depois || [])].length - 2}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition-all"
                    >
                        {isExpanded ? <X size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 border-t border-slate-50 bg-slate-50/30"
                    >
                        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Bloco Antes */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Antes do Tratamento
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {record.fotos_antes?.map((url, i) => (
                                        <button
                                            key={i} type="button" onClick={() => onImageClick(url)}
                                            className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                                        >
                                            <img src={url} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    {(!record.fotos_antes || record.fotos_antes.length === 0) && (
                                        <div className="col-span-full py-10 text-center text-slate-300 italic text-xs">Sem fotos do antes.</div>
                                    )}
                                </div>
                            </div>

                            {/* Bloco Depois */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Depois do Tratamento
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {record.fotos_depois?.map((url, i) => (
                                        <button
                                            key={i} type="button" onClick={() => onImageClick(url)}
                                            className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                                        >
                                            <img src={url} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    {(!record.fotos_depois || record.fotos_depois.length === 0) && (
                                        <div className="col-span-full py-10 text-center text-slate-300 italic text-xs">Sem fotos do depois.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PoolCleaningHistory({ registros, currentPage, setCurrentPage, ITEMS_PER_PAGE, onImageClick }) {
    const totalPages = Math.ceil(registros.length / ITEMS_PER_PAGE);
    const paginatedRegistros = registros.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <motion.div
            key="historico-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {registros.length > 0 ? (
                <>
                    {paginatedRegistros.map(reg => (
                        <PoolRecordCard
                            key={reg.id}
                            record={reg}
                            onImageClick={onImageClick}
                        />
                    ))}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mt-6">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={registros.length}
                        />
                    </div>
                </>
            ) : (
                <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
                    <Droplet size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Nenhum tratamento registrado ainda.</p>
                </div>
            )}
        </motion.div>
    );
}
