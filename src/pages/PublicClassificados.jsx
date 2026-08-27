import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Store, Search, Filter, Phone, MapPin, Tag, Info, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';

function PublicClassificados() {
    const navigate = useNavigate();
    const [classificados, setClassificados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('TODOS');

    useEffect(() => {
        fetchClassificados();
    }, []);

    async function fetchClassificados() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('classificados')
                .select('*')
                .eq('status', 'ATIVO')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClassificados(data || []);
        } catch (error) {
            console.error('Erro ao buscar classificados:', error);
        } finally {
            setLoading(false);
        }
    }

    const filtered = classificados.filter(item => {
        const matchBusca = 
            item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (item.descricao && item.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchCategoria = filterCategoria === 'TODOS' || item.categoria === filterCategoria;
        
        return matchBusca && matchCategoria;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/')}
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Store className="text-primary w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none mb-1">
                                    Classificados
                                </h1>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MaxClub Itaim</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8 md:py-12 w-full">
                {/* Hero / Search */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Vitrine do Condomínio</h2>
                        <p className="text-slate-500 font-medium mt-2 max-w-lg">
                            Compre, venda, doe ou troque itens com seus vizinhos com segurança.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar itens..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-sm font-medium shadow-sm"
                            />
                        </div>
                        <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm overflow-x-auto hide-scrollbar">
                            {['TODOS', 'VENDA', 'DOACAO', 'TROCA'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategoria(cat)}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${
                                        filterCategoria === cat 
                                        ? 'bg-primary text-white shadow-md' 
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {cat === 'DOACAO' ? 'Doação' : cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Lista */}
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-6"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando vitrine...</p>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filtered.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -8 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group"
                            >
                                <div className="h-56 bg-slate-50 relative overflow-hidden">
                                    {item.imagem_url ? (
                                        <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <ImageIcon size={48} className="mb-2 opacity-50" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sem Imagem</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-lg flex items-center gap-2">
                                        <Tag size={12} className={
                                            item.categoria === 'VENDA' ? 'text-blue-500' :
                                            item.categoria === 'DOACAO' ? 'text-emerald-500' : 'text-purple-500'
                                        } />
                                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{item.categoria}</span>
                                    </div>
                                    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex items-center gap-2">
                                        <MapPin size={12} className="text-white/70" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Unidade {item.unidade}</span>
                                    </div>
                                </div>
                                
                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">{item.titulo}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1 leading-relaxed">{item.descricao}</p>
                                    
                                    <div className="pt-6 border-t border-slate-100 mt-auto">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Preço</p>
                                        <div className="flex items-center justify-between mb-6">
                                            <p className="font-black text-slate-900 text-2xl">
                                                {item.preco > 0 ? `R$ ${Number(item.preco).toFixed(2)}` : <span className="text-emerald-500">Grátis</span>}
                                            </p>
                                        </div>
                                        <a 
                                            href={`https://wa.me/55${item.contato.replace(/\D/g, '')}?text=Olá! Vi seu anúncio "${item.titulo}" no Portal MaxClub e tenho interesse.`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-emerald-50 text-emerald-600 font-bold py-4 rounded-2xl hover:bg-emerald-100 hover:text-emerald-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] shadow-sm border border-emerald-100"
                                        >
                                            <Phone size={14} /> Chamar no WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="text-slate-300 w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Nenhum anúncio encontrado</h2>
                        <p className="text-slate-500 font-medium text-sm">Não há itens disponíveis no momento ou a sua busca não retornou resultados.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PublicClassificados;
