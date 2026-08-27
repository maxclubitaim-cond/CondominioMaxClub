import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Package, Maximize2, X, Wrench, Image as ImageIcon } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';
import Pagination from '../common/Pagination';

export default function MaintenanceHistory({ registros, currentPage, setCurrentPage, ITEMS_PER_PAGE, onImageClick }) {
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
                        <MaintenanceRecordCard
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
                    <Wrench size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Nenhuma manutenção registrada ainda.</p>
                </div>
            )}
        </motion.div>
    );
}

function MaintenanceRecordCard({ record, onImageClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {record.area_nome}
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {formatDateTime(record.data_manutencao)}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800">{record.descricao}</h3>

                    {record.observacoes && (
                        <p className="text-slate-500 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                            "{record.observacoes}"
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-xs font-bold pt-2">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-primary" /> Responsável: {record.responsavel_tecnico}
                        </div>
                        <span className="hidden sm:inline text-slate-200">•</span>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-300" /> Registrado por: {record.perfis?.nome}
                        </div>
                    </div>

                    {record.itens_usados && record.itens_usados.length > 0 && (
                        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                                <Package size={14} /> Itens de Estoque Utilizados
                            </h4>
                            <ul className="space-y-1">
                                {record.itens_usados.map((item, idx) => (
                                    <li key={idx} className="text-sm font-semibold text-emerald-800 flex justify-between border-b border-emerald-100/50 pb-1 last:border-0">
                                        <span>{item.nome}</span>
                                        <span>{item.quantidade} {item.unidade_medida}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all"
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
                        className="border-t border-slate-100 bg-slate-50"
                    >
                        <div className="p-8 grid md:grid-cols-2 gap-8">
                            {record.fotos_antes?.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                        <ImageIcon size={14} /> Antes do Serviço
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {record.fotos_antes.map((url, i) => (
                                            <div key={i} onClick={() => onImageClick(url)} className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in relative group border border-slate-200">
                                                <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {record.fotos_depois?.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                        <ImageIcon size={14} /> Depois do Serviço
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {record.fotos_depois.map((url, i) => (
                                            <div key={i} onClick={() => onImageClick(url)} className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in relative group border border-slate-200">
                                                <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
