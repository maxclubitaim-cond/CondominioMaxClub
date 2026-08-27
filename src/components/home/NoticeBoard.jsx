import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Info } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export default function NoticeBoard({ avisos }) {
    return (
        <section id="avisos" className="mb-24">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-4 tracking-tight">
                    <Bell className="text-primary" /> Comunicados
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atualizado em tempo real</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {avisos.length > 0 ? avisos.map((aviso) => (
                    <motion.div
                        key={aviso.id}
                        whileHover={{ y: -10 }}
                        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group relative"
                    >
                        <div className="absolute top-6 right-6 z-10">
                            <span className="px-3 py-1 bg-primary text-white text-[9px] font-bold uppercase rounded-full tracking-widest shadow-lg">
                                Novo
                            </span>
                        </div>
                        {aviso.imagem_url ? (
                            <div className="h-56 w-full overflow-hidden">
                                <img src={aviso.imagem_url} alt={aviso.titulo} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        ) : (
                            <div className="h-56 w-full bg-slate-50 flex items-center justify-center">
                                <Info size={40} className="text-slate-200" />
                            </div>
                        )}
                        <div className="p-10 flex-1">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} className="text-primary" />
                                    {formatDate(aviso.created_at)}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-primary transition-colors leading-tight">{aviso.titulo}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                {aviso.descricao}
                            </p>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                        <Info className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum aviso ativo no momento.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
