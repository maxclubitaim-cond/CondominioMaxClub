import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Shield, Key, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

function FirstAccess() {
    const { morador, updateMorador } = useAuth();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const verifyStatus = async () => {
            if (!morador) {
                navigate('/');
                return;
            }
            if (!morador.primeiro_acesso) {
                navigate('/condomino');
                return;
            }
            setVerifying(false);
        };
        verifyStatus();
    }, [morador, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        if (password === 'maxclub123') {
            toast.error('Você não pode usar a senha padrão. Escolha uma senha segura.');
            return;
        }

        setLoading(true);

        try {
            const { error: authError } = await supabase.rpc('alterar_senha_morador', {
                p_unidade: morador.unidade,
                p_senha_atual: 'maxclub123',
                p_nova_senha: password
            });

            if (authError) throw authError;

            // Atualizar contexto local
            updateMorador({ primeiro_acesso: false });

            toast.success('Senha atualizada com sucesso!');
            
            // Redirecionar após breve delay para UX fluida
            setTimeout(() => {
                navigate('/condomino');
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar a senha. Tente novamente.');
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-blue-400 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 relative z-10"
            >
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 text-center tracking-tight mb-2">Primeiro Acesso</h1>
                <p className="text-sm text-slate-500 text-center mb-8 px-4">
                    Para garantir sua segurança, por favor defina uma nova senha pessoal de acesso.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="group/field">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                        </div>
                    </div>

                    <div className="group/field">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                placeholder="Repita a nova senha"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <CheckCircle2 size={18} /> Salvar e Entrar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default FirstAccess;
