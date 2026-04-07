import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, ChevronLeft, Info, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function LostFound() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        // Busca apenas itens NÃO retirados
        const { data } = await supabase
            .from('achados_perdidos')
            .select('*')
            .eq('retirado', false)
            .order('created_at', { ascending: false });

        if (data) setItems(data);
        setLoading(false);
    }

    const filteredItems = items.filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Navbar */}
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
                    <h1 className="text-lg font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">Achados & Perdidos</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 md:py-16">
                <div className="max-w-2xl mx-auto mb-12 text-center space-y-4">
                    <p className="text-slate-500 font-medium">Esqueceu algo nas áreas comuns? Confira se o item foi encontrado e guardado pela administração.</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-16 relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="O que você está procurando?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                {loading ? (
                    <div className="py-20 text-center animate-pulse">
                        <Package size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">Buscando no inventário...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                            {filteredItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
                                >
                                    <div className="h-64 bg-slate-50 relative overflow-hidden">
                                        {item.imagem_url ? (
                                            <img
                                                src={item.imagem_url}
                                                alt={item.item}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <Package size={64} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase text-primary rounded-full shadow-sm">
                                                Disponível
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 flex-1">{item.item}</h3>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                <Clock size={14} />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                            <Info size={18} className="text-slate-200 group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-32 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Package size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-400 italic mb-2">Nada por aqui!</h3>
                        <p className="text-slate-400 text-sm font-medium">Se não encontrou seu item, procure o zelador ou administrador.</p>
                    </div>
                )}

                {/* Dica de Segurança */}
                <div className="mt-20 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary shrink-0">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">Como retirar um item?</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Para retirar um item encontrado, dirija-se ao guarda volume.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 mt-20 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">MaxClubItaim Premium Services</p>
            </footer>
        </div>
    );
}

export default LostFound;
