import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck,
    Search,
    Calendar,
    Eye,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Image as ImageIcon,
    ArrowLeft,
    Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(date);
};

const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

const AdminChecklistHistory = () => {
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    useEffect(() => {
        fetchChecklists();
    }, []);

    const fetchChecklists = async () => {
        try {
            const { data, error } = await supabase
                .from('salao_checklist')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setChecklists(data || []);
        } catch (error) {
            console.error('Erro ao buscar checklists:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChecklists = checklists.filter(c => {
        const matchesSearch = c.unidade.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = selectedDate ? c.data_evento === selectedDate : true;
        return matchesSearch && matchesDate;
    });

    const getStatusColor = (aderencia) => {
        if (aderencia >= 90) return 'text-emerald-500 bg-emerald-50';
        if (aderencia >= 70) return 'text-amber-500 bg-amber-50';
        return 'text-rose-500 bg-rose-50';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="px-4 md:px-0">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ClipboardCheck className="text-primary w-6 h-6 md:w-7 md:h-7" />
                        Checklists Salão
                    </h1>
                    <p className="text-slate-500 text-xs md:sm font-medium">Histórico de vistorias</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar unidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none font-medium transition-all text-sm"
                    />
                </div>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 md:py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-primary outline-none font-medium transition-all text-sm"
                    />
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-primary uppercase">Total Registros</p>
                        <p className="text-xl font-bold text-primary">{filteredChecklists.length}</p>
                    </div>
                    <TrendingUp className="text-primary" size={24} />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 md:p-6 py-5 md:py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                                <th className="px-4 md:p-6 py-5 md:py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidade / Ref.</th>
                                <th className="px-4 md:p-6 py-5 md:py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Aderência</th>
                                <th className="px-4 md:p-6 py-5 md:py-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-10 text-center animate-pulse">Carregando...</td></tr>
                            ) : filteredChecklists.length === 0 ? (
                                <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-bold">Nenhum registro.</td></tr>
                            ) : (
                                filteredChecklists.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 md:p-6 py-4">
                                            <p className="text-xs md:text-sm font-bold text-slate-700">{formatDate(item.data_evento)}</p>
                                        </td>
                                        <td className="px-4 md:p-6 py-5 md:py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] md:text-xs font-bold">
                                                    U {item.unidade}
                                                </span>
                                                <div className={`inline-flex items-center text-[10px] md:text-xs font-bold ${getStatusColor(item.aderencia).split(' ')[0]}`}>
                                                    {Math.round(item.aderencia)}%
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:p-6 py-4 hidden sm:table-cell">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(item.aderencia)}`}>
                                                {Math.round(item.aderencia)}% Aderente
                                            </div>
                                        </td>
                                        <td className="px-4 md:p-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedChecklist(item)}
                                                className="p-2.5 md:p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye className="w-4 h-4 md:w-4.5 md:h-4.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedChecklist && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">Checklist Unidade {selectedChecklist.unidade}</h3>
                                    <p className="text-xs text-slate-500 font-medium">Evento: {formatFullDate(selectedChecklist.data_evento)}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedChecklist(null)}
                                    className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {Object.entries(selectedChecklist.respostas).map(([pergunta, resposta]) => {
                                        const ocorrencia = selectedChecklist.ocorrencias[pergunta];
                                        const isRuim = resposta === 'Ruim';

                                        return (
                                            <div key={pergunta} className={`rounded-[2rem] border overflow-hidden ${isRuim ? 'border-rose-100 ring-1 ring-rose-50' : 'border-slate-50'}`}>
                                                <div className={`p-5 flex items-center justify-between ${isRuim ? 'bg-rose-50/50' : 'bg-white'}`}>
                                                    <p className="text-sm font-bold text-slate-600 pr-4">{pergunta}</p>
                                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${resposta === 'Ótimo' ? 'text-emerald-500 bg-emerald-50' :
                                                            resposta === 'Regular' ? 'text-amber-500 bg-amber-50' :
                                                                'text-rose-500 bg-rose-50'
                                                        }`}>
                                                        {resposta}
                                                    </span>
                                                </div>

                                                {isRuim && ocorrencia && (
                                                    <div className="px-5 pb-5 pt-2 bg-rose-50/50 space-y-4">
                                                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-rose-100/50">
                                                            <p className="text-[10px] font-black text-rose-400 uppercase mb-2 flex items-center gap-1">
                                                                <Info size={12} /> Relato do Morador
                                                            </p>
                                                            <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
                                                                "{ocorrencia.relato || 'Morador não deixou relato escrito.'}"
                                                            </p>
                                                        </div>

                                                        {ocorrencia.foto && (
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-1">
                                                                    <ImageIcon size={12} /> Foto da Irregularidade
                                                                </p>
                                                                <img
                                                                    src={ocorrencia.foto}
                                                                    alt="Evidência"
                                                                    className="w-full rounded-2xl shadow-md border-4 border-white cursor-zoom-in hover:scale-[1.02] transition-transform"
                                                                    onClick={() => window.open(ocorrencia.foto, '_blank')}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminChecklistHistory;
