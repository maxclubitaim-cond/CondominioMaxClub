import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

function CleaningHistory() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRegistros();
    }, []);

    async function fetchRegistros() {
        const { data } = await supabase
            .from('limpeza_registros')
            .select('*, locais_limpeza(nome)')
            .order('data_limpeza', { ascending: false });

        if (data) setRegistros(data);
        setLoading(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <ClipboardList className="text-primary" /> Controle de Limpeza
                        </h1>
                        <p className="text-slate-500 font-medium">Acompanhe a manutenção das áreas comuns em tempo real.</p>
                    </div>
                    <div className="p-4 bg-highlight/10 border border-highlight/20 text-highlight font-bold rounded-2xl flex items-center gap-3 text-sm">
                        <Info size={20} />
                        Próxima limpeza estimada em 3 dias após a atual.
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-medium">Carregando histórico...</div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Local</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Data Limpeza</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Próxima Prevista</th>
                                    <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {registros.map((reg) => (
                                    <motion.tr
                                        key={reg.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/30 transition-colors"
                                    >
                                        <td className="px-8 py-6 font-bold text-slate-800">{reg.locais_limpeza?.nome}</td>
                                        <td className="px-8 py-6 text-slate-500 font-medium">
                                            {new Date(reg.data_limpeza).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-8 py-6 text-primary font-bold">
                                            {formatDate(reg.proxima_limpeza)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-highlight/10 text-highlight text-[10px] font-bold rounded-lg uppercase">Realizada</span>
                                        </td>
                                    </motion.tr>
                                ))}
                                {registros.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic">Nenhum registro encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CleaningHistory;
