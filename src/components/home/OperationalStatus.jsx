import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getDayOfMonth, getMonthName } from '../../utils/dateUtils';

export default function OperationalStatus({ limpeza, agenda }) {
    const navigate = useNavigate();

    return (
        <motion.div
            className="w-full lg:max-w-sm space-y-8 mt-12 lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between relative z-10">
                    Status Operacional
                    <div className="w-2 h-2 bg-highlight rounded-full animate-pulse" />
                </h4>
                <div className="space-y-5 relative z-10">
                    {limpeza.length > 0 ? limpeza.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center group/item text-sm">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">{item.locais_limpeza?.nome}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{formatDate(item.data_limpeza)}</span>
                            </div>
                            <span className="px-3 py-1 bg-highlight/10 text-highlight text-[9px] font-bold rounded-lg uppercase border border-highlight/20">Finalizado</span>
                        </div>
                    )) : (
                        <p className="text-xs text-slate-400 font-bold italic">Aguardando registros...</p>
                    )}
                </div>
                <button
                    onClick={() => navigate('/limpeza')}
                    className="w-full mt-8 py-4 bg-primary text-white font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/10"
                >
                    Painel de Higienização
                </button>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-6 flex items-center justify-between relative z-10">
                    Próximos Eventos
                    <Calendar size={14} className="text-primary" />
                </h4>
                <div className="space-y-4 relative z-10">
                    {agenda.length > 0 ? agenda.map((evento) => (
                        <div key={evento.id} className="flex gap-4 group/ev pointer-events-none">
                            <div className="text-primary font-bold text-xs pt-1 flex flex-col items-center">
                                <span>{getDayOfMonth(evento.data)}</span>
                                <span className="text-[8px] uppercase">{getMonthName(evento.data)}</span>
                            </div>
                            <div className="flex-1 border-l border-white/10 pl-4 py-1">
                                <p className="text-[11px] font-bold leading-tight uppercase tracking-wide group-hover/ev:text-primary transition-colors">{evento.titulo}</p>
                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{evento.hora.slice(0, 5)} • {evento.local}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-xs text-slate-500 font-bold italic">Nenhum evento agendado.</p>
                    )}
                </div>
                <button 
                    onClick={() => navigate('/agenda')}
                    className="w-full mt-8 text-primary hover:text-white text-[9px] font-bold uppercase tracking-widest text-center transition-colors hover:underline"
                >
                    Acessar Agenda Completa
                </button>
            </div>
        </motion.div>
    );
}
