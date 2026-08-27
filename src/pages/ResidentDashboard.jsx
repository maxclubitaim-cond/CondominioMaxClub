import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Package, Store, MessageSquare, MapPin, Clock, Lock, Key, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

function ResidentDashboard() {
    const { morador, logoutMorador } = useAuth();
    const navigate = useNavigate();
    const [encomendas, setEncomendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (morador?.unidade) {
            fetchMinhasEncomendas();
        }
    }, [morador]);

    async function fetchMinhasEncomendas() {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('obter_encomendas_morador', {
                p_unidade: morador.unidade
            });

            if (error) throw error;
            setEncomendas(data || []);
        } catch (error) {
            console.error('Erro ao buscar encomendas:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleConfirmarRetirada = async (id) => {
        try {
            const { error } = await supabase.rpc('confirmar_retirada_morador', {
                p_encomenda_id: id,
                p_unidade: morador.unidade
            });
                
            if (error) throw error;
            toast.success('Retirada confirmada!');
            fetchMinhasEncomendas();
        } catch (error) {
            console.error('Erro ao confirmar retirada:', error);
            toast.error('Erro ao confirmar retirada.');
        }
    };

    const handleLogout = async () => {
        logoutMorador();
        navigate('/');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.error('Digite a senha atual.');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        if (newPassword === 'maxclub123' || newPassword === currentPassword) {
            toast.error('Escolha uma senha nova e segura.');
            return;
        }

        setSavingPassword(true);

        try {
            const { error } = await supabase.rpc('alterar_senha_morador', {
                p_unidade: morador.unidade,
                p_senha_atual: currentPassword,
                p_nova_senha: newPassword
            });

            if (error) throw error;

            toast.success('Senha alterada com sucesso!');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao alterar a senha. Tente novamente.');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                            <span className="font-black text-primary text-xl">M</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 text-lg md:text-xl tracking-tight leading-none mb-1">Portal do Morador</h1>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">MaxClub Itaim</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-sm font-bold text-slate-800 uppercase">Unidade {morador?.unidade}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Condômino</span>
                        </div>
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="p-3 text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-all"
                            title="Trocar Senha"
                        >
                            <Key size={20} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-3 text-rose-400 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 rounded-xl transition-all"
                            title="Sair"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Olá, Unidade {morador?.unidade}</h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Aqui você gerencia suas encomendas, classificados e serviços.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Widgets Temporários */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Package size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Minhas Encomendas</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Verifique o que chegou para você.</p>
                    </div>

                    <div 
                        onClick={() => navigate('/condomino/classificados')}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Store size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Classificados</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Anuncie e compre no condomínio.</p>
                    </div>

                    <div 
                        onClick={() => navigate('/condomino/vagas')}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MapPin size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Minhas Vagas</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Consulte suas vagas de garagem.</p>
                    </div>

                    <div 
                        onClick={() => navigate('/condomino/empreendedores')}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Empreendedores</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Ofereça seus serviços profissionais.</p>
                    </div>
                </div>

                <div className="mt-10">
                    <h3 className="font-bold text-slate-900 text-xl mb-6 flex items-center gap-3">
                        <Package className="text-primary" /> Encomendas Pendentes
                        {encomendas.length > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                {encomendas.length}
                            </span>
                        )}
                    </h3>

                    {loading ? (
                        <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Carregando pacotes...</p>
                        </div>
                    ) : encomendas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {encomendas.map((enc) => (
                                <div key={enc.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-start gap-5">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg leading-tight mb-1">{enc.descricao}</h4>
                                        <div className="flex flex-col gap-1 mt-2">
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                                <Clock size={14} className="text-slate-400" /> Recebido em: {formatDate(enc.data_recebimento)}
                                            </span>
                                            {enc.codigo_rastreio && (
                                                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md w-fit mt-1">
                                                    {enc.codigo_rastreio}
                                                </span>
                                            )}
                                            <button 
                                                onClick={() => handleConfirmarRetirada(enc.id)}
                                                className="mt-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 w-fit"
                                            >
                                                <CheckCircle2 size={14} /> Recebido
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-sm text-center">
                            <Package className="text-slate-200 w-12 h-12 mx-auto mb-4" />
                            <h4 className="font-bold text-slate-900 text-lg">Tudo limpo por aqui</h4>
                            <p className="text-slate-500 text-sm mt-1">Nenhuma encomenda aguardando retirada na portaria.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Troca de Senha */}
            <AnimatePresence>
                {isChangingPassword && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                                        <Lock className="text-amber-500 w-6 h-6" />
                                    </div>
                                    <button 
                                        onClick={() => setIsChangingPassword(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Alterar Senha</h3>
                                <p className="text-sm text-slate-500 mb-6">Defina uma nova senha para acessar o portal do morador.</p>
                                
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Senha Atual</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900 text-sm"
                                                placeholder="Sua senha atual"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Nova Senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900 text-sm"
                                                placeholder="Mínimo 6 caracteres"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Confirmar Nova Senha</label>
                                        <div className="relative">
                                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within/field:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900 text-sm"
                                                placeholder="Repita a nova senha"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={savingPassword || !newPassword || !confirmPassword}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        {savingPassword ? <Loader2 className="animate-spin" size={18} /> : (
                                            <><CheckCircle2 size={18} /> Salvar Nova Senha</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResidentDashboard;
