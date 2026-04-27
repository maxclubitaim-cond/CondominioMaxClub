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
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary rounded-full blur-[100px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-blue-400 rounded-full blur-[100px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center border border-slate-100 relative z-10"
                >
                    <div className="w-24 h-24 bg-highlight/10 text-highlight rounded-3xl flex items-center justify-center mx-auto mb-8 border border-highlight/20">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight uppercase">Solicitação Enviada!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10 px-4">
                        Seu acesso foi registrado. <br />
                        A administração analisará seu perfil para liberação imediata.
                    </p>
                    <button
                        onClick={() => { setSuccess(false); setIsRegistering(false); }}
                        className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                    >
                        Voltar para o Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none font-bold text-[20vw] flex items-center justify-center text-primary select-none">
                MAXCLUB
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-6 group overflow-hidden relative"
                    >
                        <Shield className="text-white w-10 h-10 relative z-10" />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tighter leading-none mb-3 uppercase">
                        {isRegistering ? 'Solicitar Acesso' : 'MaxClub Itaim'}
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {isRegistering ? 'Portal de Credenciamento' : 'Painel de Controle do Morador'}
                    </p>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegistering ? 'register' : 'login'}
                            initial={{ opacity: 0, x: isRegistering ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isRegistering ? -20 : 20 }}
                            transition={{ duration: 0.3, ease: "circOut" }}
                        >
                            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-8">
                                {isRegistering && (
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                            placeholder="Ex: João Silva"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">Credential Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                            placeholder="morador@exemplo.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 group-focus-within/field:text-primary transition-colors">Access Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 bg-rose-50 border border-rose-100 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-2xl text-center leading-relaxed"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:bg-slate-100 disabled:text-slate-300 flex items-center justify-center gap-4 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
                                >
                                    {loading ? <Loader2 className="animate-spin text-white" /> : (
                                        <>
                                            {isRegistering ? 'Solicitar Credenciais' : 'Entrar no Sistema'}
                                            <ArrowLeft size={16} className="rotate-180" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                        <button
                            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                            className="text-primary font-bold text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all flex items-center justify-center gap-3 mx-auto py-2"
                        >
                            {isRegistering ? (
                                <><ArrowLeft size={16} /> Voltar para o Login</>
                            ) : (
                                <><UserPlus size={16} /> Solicitar novo credenciamento</>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2 mx-auto"
                >
                    Voltar
                </button>
            </motion.div>
        </div>
    );
}

export default Login;
