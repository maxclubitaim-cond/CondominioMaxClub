import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, Loader2, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Login() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data: { user }, error: signInError } = await signIn(email, password);

        if (signInError) {
            setError('Credenciais inválidas ou erro de conexão.');
            setLoading(false);
            return;
        }

        // Verificar se usuário está ativo
        const { data: profileData } = await supabase
            .from('perfis')
            .select('ativo')
            .eq('id', user?.id)
            .single();

        if (profileData && profileData.ativo === false) {
            await supabase.auth.signOut();
            setError('Usuário inativo. Procure o administrador.');
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { nome }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-premium text-center border border-slate-100"
                >
                    <div className="w-20 h-20 bg-highlight/10 text-highlight rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Solicitação Enviada!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        Seu acesso foi solicitado com sucesso. <br />
                        Um administrador irá liberar seu perfil em breve.
                    </p>
                    <button
                        onClick={() => { setSuccess(false); setIsRegistering(false); }}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all font-premium"
                    >
                        Voltar para Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                        <Shield className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">
                        {isRegistering ? 'Solicitar Acesso' : 'Painel Administrativo'}
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {isRegistering ? 'Cadastre-se para a equipe administrativa' : 'MaxClubItaim Control Center'}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegistering ? 'register' : 'login'}
                            initial={{ opacity: 0, x: isRegistering ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isRegistering ? -20 : 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
                                {isRegistering && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                            placeholder="Ex: João Silva"
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 px-1">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Seu e-mail corporativo"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 px-1">Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold rounded-xl text-center leading-relaxed">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-slate-800 disabled:bg-slate-400 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-premium"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : isRegistering ? 'Solicitar Agora' : 'Acessar Painel'}
                                </button>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <button
                            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                            className="text-primary font-bold text-sm hover:underline flex items-center gap-2 mx-auto"
                        >
                            {isRegistering ? (
                                <><ArrowLeft size={16} /> Já tenho acesso</>
                            ) : (
                                <><UserPlus size={16} /> Solicitar novo acesso</>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 mx-auto"
                >
                    Voltar para Início
                </button>
            </motion.div>
        </div>
    );
}

export default Login;
