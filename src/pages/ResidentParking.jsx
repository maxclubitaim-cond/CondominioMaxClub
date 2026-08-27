import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Loader2, Car, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ResidentParking() {
    const { morador } = useAuth();
    const navigate = useNavigate();
    const [vagas, setVagas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (morador?.unidade) {
            fetchMinhasVagas();
        }
    }, [morador]);

    async function fetchMinhasVagas() {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('obter_vagas_morador', {
                p_unidade: morador.unidade
            });

            if (error) throw error;
            setVagas(data || []);
        } catch (error) {
            console.error('Erro ao buscar vagas:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/condomino')}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <MapPin className="text-emerald-500 w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 text-lg md:text-xl tracking-tight leading-none mb-1">Minhas Vagas</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unidade {morador?.unidade}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando vagas...</p>
                    </div>
                ) : vagas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vagas.map((vaga) => {
                            const isAlugada = vaga.unidade_alugou === morador.unidade;
                            return (
                                <motion.div 
                                    key={vaga.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-10 ${isAlugada ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                    
                                    <div className="flex items-center justify-between mb-4 relative">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isAlugada ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                            <Car size={28} />
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                {isAlugada ? 'Vaga Alugada' : 'Vaga Própria'}
                                            </span>
                                            {isAlugada ? (
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold">
                                                    <Key size={12} /> Uso Temporário
                                                </span>
                                            ) : vaga.unidade_alugou ? (
                                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-md text-xs font-bold">
                                                    Alugada p/ {vaga.unidade_alugou}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold">
                                                    Disponível
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="relative">
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                                            Vaga {vaga.numero}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                                            <MapPin size={16} className="text-slate-400" /> {vaga.subsolo}º Subsolo
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Car className="text-slate-300 w-10 h-10" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-xl mb-2">Nenhuma vaga encontrada</h4>
                        <p className="text-slate-500 text-sm">Não localizamos vagas vinculadas à sua unidade no momento.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ResidentParking;
