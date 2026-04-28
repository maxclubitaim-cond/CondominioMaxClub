import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, Trash2, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminSuggestions() {
    const [sugestoes, setSugestoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSugestoes();
    }, []);

    async function fetchSugestoes() {
        const { data } = await supabase
            .from('sugestoes')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setSugestoes(data);
        setLoading(false);
    }

    async function markAsRead(id, currentStatus) {
        await supabase.from('sugestoes').update({ lido: !currentStatus }).eq('id', id);
        fetchSugestoes();
    }

    async function deleteSugestao(id) {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-slate-800">Deseja apagar esta sugestão?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await supabase.from('sugestoes').delete().eq('id', id);
                            fetchSugestoes();
                            toast.success('Sugestão apagada.');
                        }}
                        className="bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Sim, apagar
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Sugestões e Melhorias</h1>
                <p className="text-slate-500 text-sm">Sugestões enviadas pelos moradores através do portal.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {sugestoes.map(sug => (
                    <div key={sug.id} className={`bg-white p-6 rounded-2xl border ${sug.lido ? 'border-slate-100 opacity-60' : 'border-primary/20 shadow-md shadow-primary/5'} transition-all`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                        <Building size={12} /> Unidade {sug.unidade}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {new Date(sug.created_at).toLocaleString()}
                                    </div>
                                </div>
                                <p className="text-slate-700 font-medium leading-relaxed">{sug.texto}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={() => markAsRead(sug.id, sug.lido)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${sug.lido ? 'text-slate-400 bg-slate-50' : 'text-highlight bg-highlight/10 hover:bg-highlight/20'}`}
                                >
                                    <CheckCircle size={16} /> {sug.lido ? 'Lido' : 'Marcar como lido'}
                                </button>
                                <button onClick={() => deleteSugestao(sug.id)} className="p-2 text-slate-300 hover:text-secondary transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {sugestoes.length === 0 && (
                    <div className="text-center py-20 bg-slate-100/30 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">Nenhuma sugestão recebida ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminSuggestions;
