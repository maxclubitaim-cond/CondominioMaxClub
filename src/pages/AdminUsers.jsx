import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldCheck, ShieldAlert, Loader2, Save, Search, UserCircle, Mail } from 'lucide-react';

function AdminUsers() {
    const { profile } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // ID do usuário sendo salvo
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingChanges, setPendingChanges] = useState({}); // { userId: newProfile }

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Bloqueia OPERADOR de acessar essa tela
    if (profile && profile.perfil === 'OPERADOR') {
        return <Navigate to="/dashboard" replace />;
    }

    async function fetchUsuarios() {
        const { data } = await supabase
            .from('perfis')
            .select('*')
            .order('nome');

        if (data) setUsuarios(data);
        setLoading(false);
    }

    async function handleSaveChange(userId) {
        const novoPerfil = pendingChanges[userId];
        if (!novoPerfil) return;

        setSaving(userId);
        const { error } = await supabase
            .from('perfis')
            .update({ perfil: novoPerfil })
            .eq('id', userId);

        if (!error) {
            setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, perfil: novoPerfil } : u));
            const newPending = { ...pendingChanges };
            delete newPending[userId];
            setPendingChanges(newPending);
        } else {
            alert('Erro ao atualizar perfil: ' + error.message);
        }
        setSaving(null);
    }

    async function toggleAtivo(userId, statusAtual) {
        const confirmacao = statusAtual
            ? 'Tem certeza que deseja INATIVAR este usuário? Ele não poderá mais logar.'
            : 'Deseja ATIVAR este usuário?';

        if (!confirm(confirmacao)) return;

        setSaving(userId);
        const { error } = await supabase
            .from('perfis')
            .update({ ativo: !statusAtual })
            .eq('id', userId);

        if (!error) {
            setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, ativo: !statusAtual } : u));
        } else {
            alert('Erro ao alterar status: ' + error.message);
        }
        setSaving(null);
    }

    const filteredUsers = usuarios.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIcon = (perfil) => {
        switch (perfil) {
            case 'ADM': return <ShieldAlert className="text-secondary" size={20} />;
            case 'GESTOR': return <ShieldCheck className="text-primary" size={20} />;
            default: return <Shield className="text-slate-400" size={20} />;
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando usuários...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="px-4 md:px-0">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Controle de Usuários</h1>
                    <p className="text-slate-500 text-xs md:sm font-medium">Gerencie os níveis de acesso e visualize e-mails da equipe.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-50 bg-slate-50">
                                <th className="px-4 md:px-8 py-4 md:py-6">Usuário</th>
                                <th className="px-4 md:px-8 py-4 md:py-6 hidden sm:table-cell">E-mail</th>
                                <th className="px-4 md:px-8 py-4 md:py-6 hidden md:table-cell">Perfil Atual</th>
                                <th className="px-4 md:px-8 py-4 md:py-6 text-right">Nível / Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="text-sm hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 md:px-8 py-4 md:py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                                                <UserCircle size={20} className="md:size-24" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 text-xs md:text-sm">{user.nome}</span>
                                                <span className="text-[10px] text-slate-400 font-medium sm:hidden truncate max-w-[100px]">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5 text-slate-500 font-medium hidden sm:table-cell">
                                        <div className="flex items-center gap-2 text-xs md:text-sm">
                                            <Mail size={14} className="text-slate-300" />
                                            {user.email || 'Não informado'}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            {getIcon(user.perfil)}
                                            <span className={`font-bold text-[10px] uppercase tracking-widest ${user.perfil === 'ADM' ? 'text-secondary' :
                                                user.perfil === 'GESTOR' ? 'text-primary' : 'text-slate-400'
                                                }`}>
                                                {user.perfil}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-4 md:py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 md:gap-3">
                                            <select
                                                value={pendingChanges[user.id] || user.perfil}
                                                onChange={(e) => setPendingChanges({ ...pendingChanges, [user.id]: e.target.value })}
                                                className={`bg-slate-50 border border-slate-200 px-2 md:px-4 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer ${!user.ativo ? 'opacity-50 grayscale' : 'text-slate-600'}`}
                                                disabled={saving === user.id || !user.ativo}
                                            >
                                                <option value="OPERADOR">OP</option>
                                                <option value="GESTOR">GESTOR</option>
                                                <option value="ADM">ADM</option>
                                            </select>
                                            
                                            <span className="md:hidden">
                                                {getIcon(user.perfil)}
                                            </span>

                                            {pendingChanges[user.id] && pendingChanges[user.id] !== user.perfil && (
                                                <motion.button
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    onClick={() => handleSaveChange(user.id)}
                                                    disabled={saving === user.id}
                                                    className="bg-primary text-white font-bold px-3 py-2 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 text-[10px] md:text-xs"
                                                >
                                                    {saving === user.id ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                                    <span className="hidden md:inline">Salvar</span>
                                                </motion.button>
                                            )}

                                            <button
                                                onClick={() => toggleAtivo(user.id, user.ativo)}
                                                disabled={saving === user.id || (profile?.id === user.id)}
                                                className={`p-2.5 rounded-xl transition-all ${user.ativo
                                                        ? 'text-highlight bg-highlight/5 hover:bg-highlight/10'
                                                        : 'text-slate-300 bg-slate-50 hover:bg-slate-100'
                                                    } ${profile?.id === user.id ? 'opacity-20 cursor-not-allowed' : ''}`}
                                                title={user.ativo ? "Inativar Usuário" : "Ativar Usuário"}
                                            >
                                                {user.ativo ? <ShieldCheck size={18} /> : <Shield size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="py-20 text-center">
                        <Users size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold italic">Nenhum usuário encontrado.</p>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                <Shield className="text-primary shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">Sobre as Permissões</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        **OPERADOR**: Vizualização básica e registros operacionais.<br />
                        **GESTOR**: Gerenciamento de avisos, itens, vagas e acesso total às senhas.<br />
                        **ADM**: Controle total do sistema, incluindo esta gestão de usuários e perfis.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminUsers;
