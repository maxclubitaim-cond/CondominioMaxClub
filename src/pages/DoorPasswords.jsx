import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Save, Plus, Trash2, Loader2, CheckCircle, X, Eye, EyeOff, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

function DoorPasswords() {
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newLocalName, setNewLocalName] = useState('');
    const [newLocalPassword, setNewLocalPassword] = useState('');
    const [newLocalWifi, setNewLocalWifi] = useState('');

    useEffect(() => {
        fetchLocais();
    }, []);

    async function fetchLocais() {
        // Fetch locais
        const { data: localesData } = await supabase
            .from('locais')
            .select('*')
            .order('nome');

        if (localesData) {
            // Check for records in registros_acesso for each local
            const { data: registros } = await supabase
                .from('registros_acesso')
                .select('local_id');

            const countMap = (registros || []).reduce((acc, current) => {
                acc[current.local_id] = (acc[current.local_id] || 0) + 1;
                return acc;
            }, {});

            setLocais(localesData.map(l => ({
                ...l,
                hasRecords: (countMap[l.id] || 0) > 0
            })));
        }
        setLoading(false);
    }

    async function handleUpdateSenha(id, novaSenha) {
        setLocais(prev => prev.map(l => l.id === id ? { ...l, senha_atual: novaSenha } : l));
    }

    async function handleUpdateWifi(id, novoWifi) {
        setLocais(prev => prev.map(l => l.id === id ? { ...l, wifi_senha: novoWifi } : l));
    }

    async function toggleAtivo(id, statusAtual) {
        setLocais(prev => prev.map(l => l.id === id ? { ...l, ativo: !statusAtual } : l));
    }

    async function saveChanges() {
        setSaving(true);
        setMessage('');

        const updates = locais.map(local =>
            supabase
                .from('locais')
                .update({
                    senha_atual: local.senha_atual,
                    wifi_senha: local.wifi_senha,
                    ativo: local.ativo
                })
                .eq('id', local.id)
        );

        const results = await Promise.all(updates);
        const errors = results.filter(r => r.error);

        if (errors.length > 0) {
            toast.error('Erro ao salvar algumas alterações: ' + errors[0].error.message);
        } else {
            toast.success('Senhas atualizadas com sucesso!');
        }

        setSaving(false);
    }

    async function handleAddLocal(e) {
        e.preventDefault();
        setSaving(true);

        const { data, error } = await supabase
            .from('locais')
            .insert([
                { 
                    nome: newLocalName, 
                    senha_atual: newLocalPassword, 
                    wifi_senha: newLocalWifi,
                    tipo: 'ACESSO' 
                }
            ])
            .select();

        if (!error) {
            setLocais(prev => [...prev, { ...data[0], hasRecords: false }].sort((a, b) => a.nome.localeCompare(b.nome)));
            setShowAddModal(false);
            setNewLocalName('');
            setNewLocalPassword('');
            setNewLocalWifi('');
            toast.success('Novo local adicionado!');
        } else {
            toast.error('Erro ao criar local: ' + error.message);
        }
        setSaving(false);
    }

    async function handleDeleteLocal(id) {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-white">Tem certeza que deseja remover este local?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const { error } = await supabase.from('locais').delete().eq('id', id);
                            if (!error) {
                                setLocais(prev => prev.filter(l => l.id !== id));
                                toast.success('Local removido com sucesso.');
                            } else {
                                toast.error('Erro ao excluir: ' + error.message);
                            }
                        }}
                        className="bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Sim, remover
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando locais...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Senhas das Portas</h1>
                    <p className="text-slate-500 text-sm font-medium">Gerencie as senhas de acesso para os moradores.</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Plus size={20} className="text-primary" />
                        Novo Local
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={saveChanges}
                        disabled={saving}
                        className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Salvar Alterações
                    </motion.button>
                </div>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-highlight/10 border border-highlight/20 text-highlight font-bold rounded-xl flex items-center gap-2 shadow-sm"
                >
                    <CheckCircle size={20} />
                    {message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {locais.map((local) => (
                        <motion.div
                            key={local.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`bg-white p-6 rounded-2xl border ${local.ativo ? 'border-slate-100' : 'border-slate-200 bg-slate-50/50'} shadow-sm relative group transition-all`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${local.ativo ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'} rounded-xl flex items-center justify-center transition-colors`}>
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${local.ativo ? 'text-slate-800' : 'text-slate-400'}`}>{local.nome}</h3>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest ${local.ativo ? 'text-primary' : 'text-slate-400'}`}>
                                            {local.ativo ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleAtivo(local.id, local.ativo)}
                                        className={`p-2.5 rounded-xl transition-all ${local.ativo ? 'text-slate-400 hover:bg-slate-100' : 'text-primary bg-primary/5 hover:bg-primary/10'}`}
                                        title={local.ativo ? "Desativar" : "Ativar"}
                                    >
                                        {local.ativo ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteLocal(local.id)}
                                        disabled={local.hasRecords}
                                        className={`p-2.5 rounded-xl transition-all ${local.hasRecords ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-secondary hover:bg-secondary/5'}`}
                                        title={local.hasRecords ? "Local com registros não pode ser removido" : "Remover Local"}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Senha Porta</label>
                                    <input
                                        type="text"
                                        value={local.senha_atual || ''}
                                        onChange={(e) => handleUpdateSenha(local.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono font-bold text-slate-700 transition-all text-sm tracking-widest"
                                        placeholder="----"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Senha Wi-Fi</label>
                                    <input
                                        type="text"
                                        value={local.wifi_senha || ''}
                                        onChange={(e) => handleUpdateWifi(local.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-700 transition-all text-sm"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            {local.hasRecords && (
                                <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                    <Info size={10} /> Local possui registros e não pode ser excluído.
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {locais.length === 0 && (
                    <div className="col-span-full bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                        <p className="text-slate-400 font-bold mb-1">Nenhum local de acesso cadastrado.</p>
                        <p className="text-slate-500/60 text-sm font-medium">Clique em "Novo Local" para começar.</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-800">Novo Local de Acesso</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddLocal} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Local</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        required
                                        value={newLocalName}
                                        onChange={(e) => setNewLocalName(e.target.value)}
                                        placeholder="Ex: Sala de Jogos"
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Senha Inicial Porta</label>
                                    <input
                                        type="text"
                                        required
                                        value={newLocalPassword}
                                        onChange={(e) => setNewLocalPassword(e.target.value)}
                                        placeholder="Ex: 5566#"
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Senha Wi-Fi (Opcional)</label>
                                    <input
                                        type="text"
                                        value={newLocalWifi}
                                        onChange={(e) => setNewLocalWifi(e.target.value)}
                                        placeholder="Senha da rede local"
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                                    >
                                        Criar Local
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default DoorPasswords;
