import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, Search, Plus, CheckCircle, Clock, Info, PackageCheck, PackageOpen, Check } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function AdminPackages() {
    const { user, profile } = useAuth();
    const [encomendas, setEncomendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('PENDENTE'); // PENDENTE ou ENTREGUE

    // Form states
    const [unidade, setUnidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [codigoRastreio, setCodigoRastreio] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [itemToDeliver, setItemToDeliver] = useState(null);

    useEffect(() => {
        fetchEncomendas();
    }, [filterStatus]);

    async function fetchEncomendas() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('encomendas')
                .select(`
                    *,
                    recebedor:recebido_por_operador_id (nome),
                    entregador:entregue_por_operador_id (nome)
                `)
                .eq('status', filterStatus)
                .order('data_recebimento', { ascending: false });

            if (error) throw error;
            setEncomendas(data || []);
        } catch (error) {
            console.error('Erro ao buscar encomendas:', error);
            toast.error('Não foi possível carregar as encomendas.');
        } finally {
            setLoading(false);
        }
    }

    const handleAddEncomenda = async (e) => {
        e.preventDefault();
        if (!unidade.trim() || !descricao.trim()) {
            toast.error('Preencha a unidade e a descrição.');
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('encomendas').insert([
                {
                    unidade: unidade.trim(),
                    descricao: descricao.trim(),
                    codigo_rastreio: codigoRastreio.trim() || null,
                    recebido_por_operador_id: profile.id
                }
            ]);

            if (error) throw error;

            toast.success('Encomenda registrada com sucesso!');
            setIsAddModalOpen(false);
            setUnidade('');
            setDescricao('');
            setCodigoRastreio('');
            if (filterStatus === 'PENDENTE') {
                fetchEncomendas();
            } else {
                setFilterStatus('PENDENTE');
            }
        } catch (error) {
            console.error('Erro ao registrar encomenda:', error);
            toast.error('Erro ao registrar a encomenda.');
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelivery = async () => {
        if (!itemToDeliver) return;
        const id = itemToDeliver;

        try {
            const { error } = await supabase
                .from('encomendas')
                .update({
                    status: 'ENTREGUE',
                    data_entrega: new Date().toISOString(),
                    entregue_por_operador_id: profile.id
                })
                .eq('id', id);

            if (error) throw error;
            toast.success('Encomenda marcada como entregue.');
            fetchEncomendas();
        } catch (error) {
            console.error('Erro ao entregar encomenda:', error);
            toast.error('Erro ao atualizar status.');
        } finally {
            setItemToDeliver(null);
        }
    };

    const filteredEncomendas = encomendas.filter(enc => 
        enc.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (enc.codigo_rastreio && enc.codigo_rastreio.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <Package className="text-primary" /> Gestão de Encomendas
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Registre e controle a entrega de pacotes aos moradores.</p>
                </div>
                
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full md:w-auto bg-primary text-white font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all"
                >
                    <Plus size={16} /> Registrar Pacote
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex bg-slate-100/50 p-1 rounded-xl">
                        <button
                            onClick={() => setFilterStatus('PENDENTE')}
                            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                filterStatus === 'PENDENTE'
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/30'
                            }`}
                        >
                            Pendentes
                        </button>
                        <button
                            onClick={() => setFilterStatus('ENTREGUE')}
                            className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                filterStatus === 'ENTREGUE'
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/30'
                            }`}
                        >
                            Entregues
                        </button>
                    </div>

                    <div className="relative max-w-sm w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por unidade, descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                            <span className="animate-pulse">Buscando registros...</span>
                        </div>
                    ) : filteredEncomendas.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status / Unidade</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Rastreio</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Registro</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredEncomendas.map((enc) => (
                                    <tr key={enc.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                                    enc.status === 'PENDENTE' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                                }`}>
                                                    {enc.status === 'PENDENTE' ? <Package size={18} /> : <PackageOpen size={18} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 font-bold tracking-wide">Unidade {enc.unidade}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${enc.status === 'PENDENTE' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                        {enc.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-slate-700">{enc.descricao}</span>
                                        </td>
                                        <td className="px-6 py-5 hidden sm:table-cell">
                                            {enc.codigo_rastreio ? (
                                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{enc.codigo_rastreio}</span>
                                            ) : (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-500">Rec: {formatDate(enc.data_recebimento)}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Por: {enc.recebedor?.nome || 'Sistema'}</span>
                                                
                                                {enc.status === 'ENTREGUE' && (
                                                    <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col">
                                                        <span className="text-xs font-bold text-emerald-600">Entr: {formatDate(enc.data_entrega)}</span>
                                                        <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest mt-1">Por: {enc.entregador?.nome || 'Sistema'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {enc.status === 'PENDENTE' && (
                                                <button
                                                    onClick={() => setItemToDeliver(enc.id)}
                                                    className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2"
                                                >
                                                    <Check size={14} /> Confirmar Entrega
                                                </button>
                                            )}
                                            {enc.status === 'ENTREGUE' && (
                                                <span className="px-4 py-2 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg inline-flex items-center gap-2 border border-slate-100">
                                                    <CheckCircle size={14} /> Entregue
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                                <Package className="text-slate-300 w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Nenhuma encomenda</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Nenhum registro encontrado para "{filterStatus}".</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Novo Registro */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl z-10 overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                                    <Package className="text-primary" /> Registrar Encomenda
                                </h3>
                                <p className="text-slate-500 text-xs font-medium mt-2">Dê entrada em um novo pacote recebido na portaria.</p>
                            </div>

                            <form onSubmit={handleAddEncomenda} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within/field:text-primary transition-colors">Unidade *</label>
                                        <input
                                            type="text"
                                            value={unidade}
                                            onChange={(e) => setUnidade(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold"
                                            placeholder="Ex: 101"
                                            required
                                        />
                                    </div>
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within/field:text-primary transition-colors">Descrição do Pacote *</label>
                                        <input
                                            type="text"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold"
                                            placeholder="Ex: Caixa Mercado Livre, Envelope Sedex..."
                                            required
                                        />
                                    </div>
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-focus-within/field:text-primary transition-colors">Código de Rastreio (Opcional)</label>
                                        <input
                                            type="text"
                                            value={codigoRastreio}
                                            onChange={(e) => setCodigoRastreio(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold font-mono"
                                            placeholder="Ex: BR123456789BR"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-3 bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-4 py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                                    >
                                        {submitting ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delivery Confirmation Modal */}
            <AnimatePresence>
                {itemToDeliver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setItemToDeliver(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-8"
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="text-primary w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Confirmar Entrega</h3>
                            <p className="text-slate-500 text-center font-medium mb-8">
                                Confirmar entrega da encomenda ao morador? Esta ação registrará a data e o operador responsável.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmDelivery} className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20">Confirmar</button>
                                <button onClick={() => setItemToDeliver(null)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-xl transition-all">Cancelar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminPackages;
