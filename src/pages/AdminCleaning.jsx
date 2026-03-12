import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList,
    Plus,
    Save,
    Loader2,
    CheckCircle,
    Trash2,
    User,
    Settings,
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AdminCleaning() {
    const { profile } = useAuth();
    const [locaisLimpeza, setLocaisLimpeza] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [selectedLocal, setSelectedLocal] = useState('');
    const [operadorNome, setOperadorNome] = useState(profile?.nome || '');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Modal de Gestão de Locais
    const [showLocaisModal, setShowLocaisModal] = useState(false);
    const [newLocalName, setNewLocalName] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const { data: dataLocais } = await supabase.from('locais_limpeza').select('*').order('nome');
        const { data: dataRegs } = await supabase
            .from('limpeza_registros')
            .select('*, locais_limpeza(nome)')
            .order('data_limpeza', { ascending: false })
            .limit(20);

        if (dataLocais) setLocaisLimpeza(dataLocais);
        if (dataRegs) setRegistros(dataRegs);
        setLoading(false);
    }

    async function handleAddRegistro(e) {
        e.preventDefault();
        setSaving(true);

        const dataLimpeza = new Date();
        const proximaLimpeza = new Date();
        proximaLimpeza.setDate(dataLimpeza.getDate() + 3);

        const { data, error } = await supabase
            .from('limpeza_registros')
            .insert([
                {
                    local_id: selectedLocal,
                    nome_operador: operadorNome,
                    data_limpeza: dataLimpeza.toISOString(),
                    proxima_limpeza: proximaLimpeza.toISOString().split('T')[0]
                }
            ])
            .select('*, locais_limpeza(nome)');

        if (!error) {
            setRegistros(prev => [data[0], ...prev]);
            setMessage('Limpeza registrada com sucesso!');
            setTimeout(() => setMessage(''), 3000);
            setSelectedLocal('');
        } else {
            alert('Erro ao registrar limpeza: ' + error.message);
        }
        setSaving(false);
    }

    async function deleteRegistro(id) {
        if (!confirm('Excluir este registro?')) return;
        const { error } = await supabase.from('limpeza_registros').delete().eq('id', id);
        if (!error) setRegistros(prev => prev.filter(r => r.id !== id));
    }

    // Funções de Gestão de Locais de Limpeza
    async function handleAddLocal(e) {
        e.preventDefault();
        if (!newLocalName) return;
        const { data, error } = await supabase
            .from('locais_limpeza')
            .insert([{ nome: newLocalName }])
            .select();

        if (!error) {
            setLocaisLimpeza(prev => [...prev, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
            setNewLocalName('');
        } else {
            alert('Erro ao adicionar local: ' + error.message);
        }
    }

    async function toggleLocalStatus(id, currentStatus) {
        const { error } = await supabase
            .from('locais_limpeza')
            .update({ ativo: !currentStatus })
            .eq('id', id);

        if (!error) {
            setLocaisLimpeza(prev => prev.map(l => l.id === id ? { ...l, ativo: !currentStatus } : l));
        }
    }

    async function deleteLocal(id) {
        if (!confirm('Excluir este local? Isso pode afetar o histórico.')) return;
        const { error } = await supabase.from('locais_limpeza').delete().eq('id', id);
        if (!error) setLocaisLimpeza(prev => prev.filter(l => l.id !== id));
    }

    if (loading) return <div className="p-8">Carregando...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-800">Controle de Limpeza</h1>
                    <p className="text-slate-500 text-xs md:sm">Registre as atividades de limpeza do condomínio.</p>
                </div>
                <button
                    onClick={() => setShowLocaisModal(true)}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
                >
                    <Settings size={18} className="text-primary" />
                    Locais
                </button>
            </header>

            <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-md mx-4 md:mx-0">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Plus className="text-primary" /> Novo Lançamento
                </h2>
                <form onSubmit={handleAddRegistro} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local</label>
                        <select
                            required
                            value={selectedLocal}
                            onChange={(e) => setSelectedLocal(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        >
                            <option value="">Selecione...</option>
                            {locaisLimpeza.filter(l => l.ativo).map(l => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operador</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                            <input
                                type="text" required
                                value={operadorNome}
                                onChange={(e) => setOperadorNome(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Registrar
                    </button>
                </form>
                {message && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-highlight font-bold text-xs flex items-center gap-2">
                        <CheckCircle size={14} /> {message}
                    </motion.div>
                )}
            </section>

            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800">Últimos Registros</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-4 md:px-6 py-4">Local</th>
                                <th className="px-4 md:px-6 py-4">Data</th>
                                <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Operador</th>
                                <th className="px-4 md:px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {registros.map(reg => (
                                <tr key={reg.id} className="text-xs md:text-sm">
                                    <td className="px-4 md:px-6 py-4 font-bold text-slate-700">{reg.locais_limpeza?.nome}</td>
                                    <td className="px-4 md:px-6 py-4 text-slate-500">
                                        {new Date(reg.data_limpeza).toLocaleDateString('pt-BR')} <span className="hidden md:inline">{new Date(reg.data_limpeza).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-slate-500 font-medium hidden sm:table-cell">{reg.nome_operador}</td>
                                    <td className="px-4 md:px-6 py-4 text-right">
                                        <button onClick={() => deleteRegistro(reg.id)} className="text-slate-300 hover:text-secondary p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {registros.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Nenhum registro de limpeza encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal de Gestão de Locais de Limpeza */}
            <AnimatePresence>
                {showLocaisModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowLocaisModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-800">Locais de Limpeza</h3>
                                <button onClick={() => setShowLocaisModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <form onSubmit={handleAddLocal} className="flex gap-2">
                                    <input
                                        type="text" required value={newLocalName} onChange={(e) => setNewLocalName(e.target.value)}
                                        placeholder="Novo local de limpeza..."
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                                    />
                                    <button type="submit" className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                                        <Plus size={20} />
                                    </button>
                                </form>

                                <div className="space-y-2">
                                    {locaisLimpeza.map(l => (
                                        <div key={l.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className={`font-bold text-sm ${l.ativo ? 'text-slate-700' : 'text-slate-400 shadow-none'}`}>{l.nome}</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleLocalStatus(l.id, l.ativo)}
                                                    className={`p-2 rounded-lg transition-all ${l.ativo ? 'text-primary hover:bg-white' : 'text-slate-300 hover:text-slate-500 hover:bg-white'}`}
                                                >
                                                    {l.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                                <button onClick={() => deleteLocal(l.id)} className="p-2 text-slate-200 hover:text-secondary">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminCleaning;
