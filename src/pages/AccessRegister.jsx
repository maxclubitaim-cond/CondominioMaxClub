import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, ArrowLeft, CheckCircle, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AccessRegister() {
    const [locais, setLocais] = useState([]);
    const [selectedLocal, setSelectedLocal] = useState('');
    const [unidade, setUnidade] = useState('');
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [password, setPassword] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocais();
    }, []);

    async function fetchLocais() {
        const { data } = await supabase
            .from('locais')
            .select('*')
            .eq('tipo', 'ACESSO')
            .eq('ativo', true)
            .order('nome');
        if (data) setLocais(data);
        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        const { error } = await supabase
            .from('registros_acesso')
            .insert([
                {
                    unidade,
                    nome_morador: nome,
                    local_id: selectedLocal
                }
            ]);

        if (!error) {
            const local = locais.find(l => l.id === selectedLocal);
            setPassword(local.senha_atual);
        }
        setSubmitting(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                >
                    <ArrowLeft size={16} /> Voltar para Início
                </button>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Key className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">Senhas Portas</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Acesso Seguro</p>
                        </div>
                    </div>

                    {!password ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                                <Info size={18} className="text-primary shrink-0 mt-0.5" />
                                <p className="text-[11px] text-primary/80 font-bold leading-relaxed">
                                    Por segurança, registre o uso do local para visualizar a senha de acesso atualizada.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Seu Nome</label>
                                <input
                                    type="text" required
                                    value={nome} onChange={(e) => setNome(e.target.value)}
                                    placeholder="Nome Completo"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Unidade</label>
                                <input
                                    type="text" required
                                    value={unidade} onChange={(e) => setUnidade(e.target.value)}
                                    placeholder="Ex: 102 Bloco A"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Local do Acesso</label>
                                <select
                                    required
                                    value={selectedLocal} onChange={(e) => setSelectedLocal(e.target.value)}
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    <option value="">Selecione o local...</option>
                                    {locais.map(l => (
                                        <option key={l.id} value={l.id}>{l.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || loading}
                                className="w-full bg-slate-900 text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-slate-800 disabled:bg-slate-300 transition-all flex justify-center items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Ver Senha de Acesso'}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-20 h-20 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-highlight w-10 h-10" />
                            </div>
                            <h2 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Acesso Liberado</h2>
                            <p className="text-slate-800 font-bold mb-8">A senha para o local é:</p>

                            <div className="bg-slate-900 py-6 rounded-3xl mb-8 relative group overflow-hidden">
                                <div className="relative z-10 text-primary text-5xl font-black tracking-widest">
                                    {password}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
                            </div>

                            <p className="text-xs text-slate-500 font-medium mb-8">
                                Por favor, não compartilhe esta senha com pessoas fora do condomínio.
                            </p>

                            <button
                                onClick={() => setPassword(null)}
                                className="text-primary font-bold text-sm hover:underline"
                            >
                                Registrar outro acesso
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default AccessRegister;
