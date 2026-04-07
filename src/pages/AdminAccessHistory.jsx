import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    Calendar as CalendarIcon,
    MapPin,
    Hash,
    User,
    ChevronDown,
    ArrowLeft,
    Clock,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminAccessHistory() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocal, setFilterLocal] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [locais, setLocais] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);

        // Buscar registros com join para o nome do local
        const { data: accessData, error: accessError } = await supabase
            .from('registros_acesso')
            .select(`
                *,
                locais (nome)
            `)
            .order('data_uso', { ascending: false });

        if (!accessError) {
            // Simplify data mapping to avoid join issues if not configured in DB
            setRegistros(accessData || []);
        } else {
            console.error("Erro ao buscar acessos:", accessError);
        }

        // Buscar locais para o filtro
        const { data: locaisData } = await supabase
            .from('locais')
            .select('id, nome')
            .eq('tipo', 'ACESSO')
            .order('nome');

        if (locaisData) setLocais(locaisData);

        setLoading(false);
    }

    const filteredRegistros = registros.filter(reg => {
        const matchesSearch =
            reg.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.nome_morador.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLocal = filterLocal === '' || reg.local_id === filterLocal;

        const matchesDate = !filterDate ||
            (reg.data_uso && new Date(reg.data_uso).toISOString().split('T')[0] === filterDate);

        return matchesSearch && matchesLocal && matchesDate;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all mb-4"
                >
                    <ArrowLeft size={16} /> Voltar ao Painel
                </button>
                <h1 className="text-3xl font-bold text-slate-800">Histórico de Acessos</h1>
                <p className="text-slate-500 font-medium">Monitore quem utilizou as senhas de acesso do condomínio.</p>
            </motion.div>

            {/* Filtros */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-4 gap-4"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por unidade ou nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                    />
                </div>

                <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                        value={filterLocal}
                        onChange={(e) => setFilterLocal(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium appearance-none transition-all"
                    >
                        <option value="">Todos os Locais</option>
                        {locais.map(l => (
                            <option key={l.id} value={l.id}>{l.nome}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                <div className="relative">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium transition-all"
                    />
                </div>

                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilterLocal('');
                        setFilterDate('');
                    }}
                    className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 rounded-xl transition-all border border-slate-100"
                >
                    <X size={18} />
                    Limpar Filtros
                </button>
            </motion.div>

            {/* Tabela de Resultados */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                                <th className="px-4 md:p-8 py-4 md:py-8">Local</th>
                                <th className="px-4 md:p-8 py-4 md:py-8">Data/Hora</th>
                                <th className="px-4 md:p-8 py-4 md:py-8">Unid.</th>
                                <th className="px-4 md:p-8 py-4 md:py-8 hidden sm:table-cell">Morador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredRegistros.length > 0 ? (
                                filteredRegistros.map((reg) => (
                                    <motion.tr
                                        variants={itemVariants}
                                        key={reg.id}
                                        className="group hover:bg-slate-50 transition-all font-medium"
                                    >
                                        <td className="px-4 md:p-8 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></div>
                                                <span className="text-slate-700 font-bold text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{reg.locais?.nome || 'Local'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:p-8 py-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg flex flex-col items-center justify-center group-hover:bg-white transition-colors shrink-0">
                                                    <span className="text-[8px] md:text-[10px] font-black text-slate-400">
                                                        {new Date(reg.data_uso).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                                                    </span>
                                                    <span className="text-xs md:text-sm font-black text-slate-700">
                                                        {new Date(reg.data_uso).getDate()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-slate-800 text-xs md:text-sm font-bold">
                                                        {new Date(reg.data_uso).toLocaleDateString('pt-BR')}
                                                    </p>
                                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-black flex items-center gap-1 uppercase">
                                                        <Clock size={10} /> {new Date(reg.data_uso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:p-8 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 bg-slate-100 rounded-lg">
                                                <span className="text-slate-700 font-black text-[10px] md:text-sm">{reg.unidade}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:p-8 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-slate-600 text-sm font-bold">{reg.nome_morador}</span>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="space-y-3 opacity-30">
                                            <Search className="mx-auto" size={40} />
                                            <p className="font-black uppercase tracking-widest text-sm">Nenhum registro encontrado</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminAccessHistory;
