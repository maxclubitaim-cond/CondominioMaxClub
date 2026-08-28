import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AdminLocaisRonda() {
    const navigate = useNavigate();
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [currentLocal, setCurrentLocal] = useState({ nome: '', ativo: true, ordem: 0 });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLocais();
    }, []);

    async function fetchLocais() {
        setLoading(true);
        const { data, error } = await supabase
            .from('locais_ronda')
            .select('*')
            .order('ordem', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            toast.error('Erro ao buscar locais: ' + error.message);
        } else {
            setLocais(data || []);
        }
        setLoading(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentLocal.nome.trim()) return toast.error('O nome do local é obrigatório.');

        setSubmitting(true);
        try {
            if (currentLocal.id) {
                // Atualizar
                const { error } = await supabase
                    .from('locais_ronda')
                    .update({
                        nome: currentLocal.nome,
                        ativo: currentLocal.ativo,
                        ordem: currentLocal.ordem
                    })
                    .eq('id', currentLocal.id);
                if (error) throw error;
                toast.success('Local atualizado!');
            } else {
                // Criar novo
                const { error } = await supabase
                    .from('locais_ronda')
                    .insert([{
                        nome: currentLocal.nome,
                        ativo: currentLocal.ativo,
                        ordem: locais.length + 1
                    }]);
                if (error) throw error;
                toast.success('Novo local criado!');
            }
            setIsEditing(false);
            setCurrentLocal({ nome: '', ativo: true, ordem: 0 });
            fetchLocais();
        } catch (err) {
            toast.error('Erro: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (local) => {
        setCurrentLocal(local);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este local permanentemente? (Isso excluirá os registros de ronda dele)')) {
            const { error } = await supabase
                .from('locais_ronda')
                .delete()
                .eq('id', id);
            
            if (error) {
                toast.error('Erro ao excluir: ' + error.message);
            } else {
                toast.success('Local excluído!');
                fetchLocais();
            }
        }
    };

    const openNew = () => {
        setCurrentLocal({ nome: '', ativo: true, ordem: locais.length + 1 });
        setIsEditing(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
            <div className="max-w-4xl w-full">
                
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/dashboard/ronda')}
                        className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                    >
                        <ArrowLeft size={16} /> Voltar para Ronda
                    </button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Gerenciar Locais de Ronda</h1>
                        <p className="text-slate-500 text-sm mt-1">Crie, edite ou exclua os pontos que o vigilante deve visitar.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/dashboard/ronda/qr-codes')}
                            className="bg-slate-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl hover:bg-slate-200 transition-all text-sm"
                        >
                            Imprimir QRs
                        </button>
                        <button
                            onClick={openNew}
                            className="bg-primary text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center gap-2 text-sm"
                        >
                            <Plus size={18} /> Novo Local
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isEditing && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">
                                    {currentLocal.id ? 'Editar Local' : 'Cadastrar Novo Local'}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nome do Local</label>
                                        <input
                                            type="text"
                                            required
                                            value={currentLocal.nome}
                                            onChange={(e) => setCurrentLocal({...currentLocal, nome: e.target.value})}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Ex: Garagem Subsolo 1"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ordem</label>
                                            <input
                                                type="number"
                                                value={currentLocal.ordem}
                                                onChange={(e) => setCurrentLocal({...currentLocal, ordem: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-end">
                                            <label className="flex items-center gap-2 cursor-pointer h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl">
                                                <input
                                                    type="checkbox"
                                                    checked={currentLocal.ativo}
                                                    onChange={(e) => setCurrentLocal({...currentLocal, ativo: e.target.checked})}
                                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                                />
                                                <span className="font-bold text-sm text-slate-700">Ativo</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Salvar Local
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : locais.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">Nenhum local cadastrado.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-16">Ordem</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nome do Local</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-24">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-24 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locais.map((local) => (
                                    <tr key={local.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm font-bold">
                                                <GripVertical size={14} className="opacity-30" /> {local.ordem}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">{local.nome}</td>
                                        <td className="p-4">
                                            {local.ativo ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg w-max">
                                                    <CheckCircle size={12} /> Ativo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg w-max">
                                                    <XCircle size={12} /> Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(local)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(local.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
}

export default AdminLocaisRonda;
