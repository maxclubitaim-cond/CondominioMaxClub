import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    Check,
    FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PdfService } from '../services/PdfService';
import DateSelectorModal from '../components/DateSelectorModal';
import { toast } from 'react-hot-toast';

function AdminPoolPasses() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { profile } = useAuth();
    const [isExportLoading, setIsExportLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        setLoading(true);
        const { data, error } = await supabase
            .from('solicitacoes_pulseiras')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setRequests(data || []);
        }
        setLoading(false);
    }

    async function markAsDelivered(id) {
        const { error } = await supabase
            .from('solicitacoes_pulseiras')
            .update({ 
                status: 'ENTREGUE', 
                entregue_em: new Date().toISOString(),
                entregue_por: profile?.id
            })
            .eq('id', id);

        if (!error) {
            setRequests(requests.map(r => r.id === id ? { ...r, status: 'ENTREGUE' } : r));
            toast.success('Entrega confirmada!');
        } else {
            toast.error('Erro ao confirmar: ' + error.message);
        }
    }

    async function handleExportConfirm(startDate, endDate) {
        setIsExportLoading(true);
        try {
            const { data, error } = await supabase
                .from('solicitacoes_pulseiras')
                .select('*')
                .gte('data_uso', startDate)
                .lte('data_uso', endDate)
                .order('data_uso', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.error('Nenhum registro encontrado para este período.');
                return;
            }

            // Mapear dados para o formato esperado pelo PdfService
            const reportData = data.map(r => ({
                unidade: `Unid. ${r.unidade}`,
                local: r.nome_visitante || 'VISITANTE',
                quantidade: `${r.quantidade} Pulseiras`,
                data_uso: r.data_uso,
                status: r.status
            }));

            await PdfService.generateModuleReport('Pulseiras Piscina', reportData, { start: startDate, end: endDate });
            setIsModalOpen(false);
            toast.success('Relatório gerado!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            toast.error('Falha ao gerar relatório.');
        } finally {
            setIsExportLoading(false);
        }
    }

    const filteredRequests = requests.filter(r => 
        r.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.nome_visitante && r.nome_visitante.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">Pulseiras Piscina</h1>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Acessos e Entregas</p>
                </div>
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none group/search">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por unidade ou nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none min-w-full md:min-w-[320px] font-bold text-slate-900 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border border-slate-200 text-slate-600 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 hover:text-primary transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest shadow-sm"
                    >
                        <FileText size={18} className="text-primary" /> Auditoria PDF
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="px-8 py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Unidade / Residente</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Qtde</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Data de Uso</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest">Status</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-right">Controle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold">Carregando solicitações...</td></tr>
                                ) : filteredRequests.length > 0 ? (
                                    filteredRequests.map((req) => (
                                        <motion.tr 
                                            key={req.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1">Unidade {req.unidade}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{req.nome_visitante || 'Visitante não informado'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-900">
                                                        {req.quantidade}x
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                    <Clock size={14} className="text-primary" />
                                                    {new Date(req.data_uso + 'T00:00:00').toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border ${
                                                        req.status === 'ENTREGUE' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'ENTREGUE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {req.status === 'PENDENTE' && (
                                                    <button
                                                        onClick={() => markAsDelivered(req.id)}
                                                        className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto shadow-lg shadow-primary/20"
                                                    >
                                                        <Check size={14} /> Confirmar Entrega
                                                    </button>
                                                )}
                                                {req.status === 'ENTREGUE' && (
                                                    <div className="flex items-center justify-end gap-2 text-emerald-500">
                                                        <span className="text-[8px] font-bold uppercase opacity-60">Entregue</span>
                                                        <CheckCircle size={20} className="opacity-40" />
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-bold">Nenhuma solicitação encontrada.</td></tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <DateSelectorModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleExportConfirm}
                loading={isExportLoading}
                title="Lista de Solicitações"
            />
        </div>
    );
}

export default AdminPoolPasses;
