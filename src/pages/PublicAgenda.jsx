import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, MapPin, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { parseDate } from '../utils/dateUtils';

function PublicAgenda() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgenda();
    }, []);

    async function fetchAgenda() {
        const { data } = await supabase
            .from('agenda')
            .select('*')
            .order('data', { ascending: true });

        if (data) setEvents(data);
        setLoading(false);
    }

    const filteredEvents = events.filter(e =>
        e.titulo.toLowerCase().includes(filter.toLowerCase()) ||
        (e.local && e.local.toLowerCase().includes(filter.toLowerCase()))
    );

    // Agrupar por mês
    const grouped = filteredEvents.reduce((acc, event) => {
        const date = parseDate(event.data);
        const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (!acc[monthYear]) acc[monthYear] = [];
        acc[monthYear].push(event);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Navbar Copiado da Home */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary transition-all font-bold text-sm"
                    >
                        <ChevronLeft size={20} />
                        Voltar
                    </button>
                    <span className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
                        MaxClub<span className="text-primary">Itaim</span>
                    </span>
                    <h1 className="text-lg font-black text-slate-900 absolute left-1/2 -translate-x-1/2">Agenda do Prédio</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <p className="text-slate-500 font-medium">Acompanhe todos os eventos, manutenções e atividades do condomínio.</p>
                </div>

                {/* Filtro */}
                <div className="mb-10 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Pesquisar por evento ou local..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Carregando eventos...</div>
                ) : (
                    <div className="space-y-12">
                        {Object.keys(grouped).length > 0 ? Object.keys(grouped).map((month) => (
                            <section key={month}>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 ml-4">
                                    {month}
                                </h2>
                                <div className="space-y-4">
                                    {grouped[month].map((event) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 items-start md:items-center"
                                        >
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                                                <span className="text-lg font-black text-slate-800 group-hover:text-primary transition-colors">
                                                    {event.data.split('-')[2]}
                                                </span>
                                                <span className="text-[10px] font-black uppercase text-slate-400">
                                                    {parseDate(event.data).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{event.titulo}</h3>
                                                <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-primary" />
                                                        {event.hora.slice(0, 5)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-secondary" />
                                                        {event.local || 'Local não informado'}
                                                    </div>
                                                </div>
                                                {event.observacao && (
                                                    <p className="mt-3 text-sm text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                                                        {event.observacao}
                                                    </p>
                                                )}
                                            </div>

                                            <button className="md:opacity-0 group-hover:opacity-100 transition-all bg-slate-50 text-slate-400 p-3 rounded-full hover:bg-primary hover:text-white">
                                                <Calendar size={18} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )) : (
                            <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold italic">Nenhum evento encontrado para este filtro.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <footer className="py-12 text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">MaxClubItaim Experience</p>
            </footer>
        </div>
    );
}

export default PublicAgenda;
