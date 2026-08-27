import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseAdminAuth } from '../lib/supabaseAdmin';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Loader2, Search, Home, Plus, KeyRound, AlertCircle, X, ShieldAlert, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pagination from '../components/common/Pagination';

function AdminResidents() {
    const { profile } = useAuth();
    const [moradores, setMoradores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [newUnidade, setNewUnidade] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToReset, setItemToReset] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const ITEMS_PER_PAGE = 10;

    // Bloqueia acesso de quem não é GESTOR ou ADM
    if (profile && profile.perfil !== 'GESTOR' && profile.perfil !== 'ADM') {
        return <Navigate to="/dashboard" replace />;
    }

    useEffect(() => {
        fetchMoradores();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    async function fetchMoradores() {
        setLoading(true);
        const { data, error } = await supabase
            .from('moradores_auth')
            .select('*')
            .order('unidade');

        if (error) {
            toast.error('Erro ao carregar moradores.');
        } else {
            setMoradores(data || []);
        }
        setLoading(false);
    }

    const handleCreateResident = async (e) => {
        e.preventDefault();
        if (!newUnidade.trim()) return;

        setIsSubmitting(true);
        const unidadeLimpa = newUnidade.trim();

        try {
            const { error } = await supabase.rpc('criar_morador_interno', {
                p_unidade: unidadeLimpa,
                p_senha: 'maxclub123'
            });

            if (error) throw error;

            toast.success(`Unidade ${unidadeLimpa} cadastrada com sucesso!`);
            setIsCreating(false);
            setNewUnidade('');
            fetchMoradores();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Erro ao cadastrar unidade. Pode já existir.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmResetPassword = async () => {
        if (!itemToReset) return;
        const loadingToast = toast.loading('Resetando senha...');
        
        try {
            const { error } = await supabase.rpc('gestor_resetar_senha_morador', {
                p_unidade: itemToReset,
                p_nova_senha: 'maxclub123'
            });

            if (error) throw error;

            toast.success('Senha resetada com sucesso!', { id: loadingToast });
            fetchMoradores(); 
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Erro ao resetar senha.', { id: loadingToast });
        } finally {
            setItemToReset(null);
        }
    };

    const confirmDeleteResident = async () => {
        if (!itemToDelete) return;
        const loadingToast = toast.loading('Excluindo acesso...');
        
        try {
            const { error } = await supabase.rpc('gestor_excluir_morador', {
                p_unidade: itemToDelete
            });

            if (error) throw error;

            toast.success('Acesso excluído com sucesso!', { id: loadingToast });
            fetchMoradores();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Erro ao excluir unidade.', { id: loadingToast });
        } finally {
            setItemToDelete(null);
        }
    };

    const filteredMoradores = moradores.filter(m =>
        m.unidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMoradores.length / ITEMS_PER_PAGE);
    const paginatedMoradores = filteredMoradores.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 relative">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Gestão de Moradores</h1>
                    <p className="text-slate-500 text-xs md:sm font-medium">Cadastre unidades e gerencie os acessos do portal.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar unidade..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        <span>Nova Unidade</span>
                    </button>
                </div>
            </header>

            {/* Modal de Criação */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Home className="text-primary w-6 h-6" />
                                    </div>
                                    <button 
                                        onClick={() => setIsCreating(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Cadastrar Unidade</h3>
                                <p className="text-sm text-slate-500 mb-6">A unidade será criada com a senha padrão <strong>maxclub123</strong> e o morador precisará trocá-la no primeiro acesso.</p>
                                
                                <form onSubmit={handleCreateResident} className="space-y-6">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Número da Unidade</label>
                                        <input
                                            type="text"
                                            value={newUnidade}
                                            onChange={(e) => setNewUnidade(e.target.value)}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-slate-900"
                                            placeholder="Ex: 101, 204B, etc"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newUnidade.trim()}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Cadastro'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-slate-400 font-medium text-sm">Carregando moradores...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50 bg-slate-50/50">
                                    <th className="px-6 py-5">Unidade / Nome</th>
                                    <th className="px-6 py-5 hidden md:table-cell">E-mail de Acesso</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedMoradores.map(morador => (
                                    <tr key={morador.unidade} className="text-sm hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                                                    <Home className="text-primary w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700">Unidade {morador.unidade}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium hidden md:table-cell">
                                            -
                                        </td>
                                        <td className="px-6 py-4">
                                            {morador.primeiro_acesso ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                                                    <AlertCircle size={12} /> Primeiro Acesso
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Ativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setItemToReset(morador.unidade)}
                                                    className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                                                    title="Resetar Senha"
                                                >
                                                    <Key size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setItemToDelete(morador.unidade)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Excluir Acesso"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredMoradores.length === 0 && (
                            <div className="py-20 text-center">
                                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">Nenhuma unidade encontrada.</p>
                            </div>
                        )}
                        
                        {filteredMoradores.length > 0 && (
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                totalItems={filteredMoradores.length}
                            />
                        )}
                    </div>
                )}
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                <ShieldAlert className="text-primary shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Sobre o Reset de Senhas</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Ao resetar a senha de um morador, ela voltará para <strong>maxclub123</strong>. O morador será bloqueado na tela inicial até que defina uma nova senha pessoal de acesso.
                    </p>
                </div>
            </div>
            {/* Reset Modal */}
            <AnimatePresence>
                {itemToReset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setItemToReset(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-8"
                        >
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Key className="text-amber-500 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Resetar Senha</h3>
                            <p className="text-slate-500 text-center font-medium mb-8">
                                Deseja resetar a senha da unidade {itemToReset} para "maxclub123"? O morador terá que trocar no próximo acesso.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmResetPassword} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/20">Confirmar Reset</button>
                                <button onClick={() => setItemToReset(null)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-xl transition-all">Cancelar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {itemToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setItemToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-8"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="text-red-500 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Excluir Unidade</h3>
                            <p className="text-slate-500 text-center font-medium mb-8">
                                ATENÇÃO: Tem certeza que deseja EXCLUIR o acesso da unidade {itemToDelete}?
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmDeleteResident} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20">Confirmar Exclusão</button>
                                <button onClick={() => setItemToDelete(null)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-xl transition-all">Cancelar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminResidents;
