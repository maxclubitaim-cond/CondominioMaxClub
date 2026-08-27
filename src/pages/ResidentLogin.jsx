import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Key, Building, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ResidentLogin() {
    const [unidade, setUnidade] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginMorador, morador } = useAuth();
    const navigate = useNavigate();

    // Se já estiver logado como morador, redireciona
    useEffect(() => {
        if (morador) {
            if (morador.primeiro_acesso) {
                navigate('/primeiro-acesso');
            } else {
                navigate('/condomino');
            }
        }
    }, [morador, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!unidade.trim()) {
            setError('Digite o número da sua unidade.');
            setLoading(false);
            return;
        }

        try {
            const data = await loginMorador(unidade.trim(), password);
            if (data.primeiro_acesso) {
                navigate('/primeiro-acesso');
            } else {
                navigate('/condomino');
            }
        } catch (err) {
            setError(err.message || 'Unidade ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                            <Building className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center">Portal do Morador</h1>
                        <p className="text-slate-500 font-medium text-xs mt-2 uppercase tracking-widest">Acesso exclusivo</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="p-4 bg-rose-50 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-3 border border-rose-100">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="group/field">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">
                                Unidade
                            </label>
                            <div className="relative">
                                <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={unidade}
                                    onChange={(e) => setUnidade(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                    placeholder="Ex: 101"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group/field">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">
                                Senha de Acesso
                            </label>
                            <div className="relative">
                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                    placeholder="Sua senha"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all group"
                        >
                            {loading ? 'Entrando...' : 'Acessar Portal'}
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </motion.div>
                
                <div className="mt-8 text-center">
                    <button onClick={() => navigate('/')} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto">
                        <ArrowRight size={12} className="rotate-180" /> Voltar para o Início
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResidentLogin;
