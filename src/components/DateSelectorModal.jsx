import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, FileText, Loader2 } from 'lucide-react';

/**
 * DateSelectorModal
 * Permite ao administrador selecionar um período para geração de relatórios PDF.
 */
function DateSelectorModal({ isOpen, onClose, onConfirm, title, loading }) {
    // Gera a data atual no formato YYYY-MM-DD respeitando o fuso horário local
    const today = new Date().toLocaleDateString('en-CA'); 
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                >
                    {/* Header Premium */}
                    <div className="bg-navy p-8 text-white relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Calendar className="text-primary" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight leading-none uppercase italic">Exportar PDF</h3>
                                    <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">{title}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Form Seleção */}
                    <div className="p-8 space-y-6 bg-slate-50/50">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Data Inicial</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-navy transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Data Final</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-navy transition-all"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-white text-slate-400 font-bold text-[10px] uppercase tracking-widest py-5 rounded-2xl border border-slate-100 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => onConfirm(startDate, endDate)}
                                disabled={loading}
                                className="flex-[2] bg-slate-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 border border-white/5 disabled:bg-slate-200"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-primary" size={18} />
                                ) : (
                                    <>
                                        Gerar Auditoria <FileText size={18} className="text-primary" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default DateSelectorModal;
