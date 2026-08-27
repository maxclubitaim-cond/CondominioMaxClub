import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';
import { supabase } from '../lib/supabase';
import { Trophy, CheckCircle, Clock, Trash2, User, Building, FileText, Settings, Loader2 } from 'lucide-react';
import { PdfService } from '../services/PdfService';
import DateSelectorModal from '../components/DateSelectorModal';
import Pagination from '../components/common/Pagination';
import { toast } from 'react-hot-toast';

function AdminVolleyball() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isExportLoading, setIsExportLoading] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [voleiModo, setVoleiModo] = useState('todos'); // 'todos' ou 'alternado'
    const [savingConfig, setSavingConfig] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchReservas();
    }, []);

    async function fetchReservas() {
        const { data: configData } = await supabase
            .from('configuracoes_sistema')
            .select('valor')
            .eq('chave', 'volei_modo')
            .single();
            
        if (configData) {
            setVoleiModo(configData.valor);
        }

        const { data } = await supabase
            .from('reservas_volei')
            .select('*')
            .order('data', { ascending: true });
        if (data) setReservas(data);
        setLoading(false);
    }

    async function handleConfigChange(newMode) {
        setSavingConfig(true);
        const { error } = await supabase
            .from('configuracoes_sistema')
            .upsert({ chave: 'volei_modo', valor: newMode, updated_at: new Date().toISOString() });
            
        if (!error) {
            setVoleiModo(newMode);
            toast.success('Configuração de liberação atualizada!');
        } else {
            toast.error('Erro ao salvar configuração.');
        }
        setSavingConfig(false);
    }

    async function toggleStatus(id, currentStatus) {
        await supabase.from('reservas_volei').update({ entregue: !currentStatus }).eq('id', id);
        fetchReservas();
    }

    async function deleteReserva(id) {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-white">Deseja excluir esta reserva?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await supabase.from('reservas_volei').delete().eq('id', id);
                            fetchReservas();
                            toast.success('Reserva excluída.');
                        }}
                        className="bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Sim, excluir
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    }

    async function handleExportConfirm(startDate, endDate) {
        setIsExportLoading(true);
        try {
            const { data, error } = await supabase
                .from('reservas_volei')
                .select('*')
                .gte('data', startDate)
                .lte('data', endDate)
                .order('data', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.error('Nenhum registro encontrado para este período.');
                return;
            }

            const reportData = data.map(r => ({
                unidade: `Unid. ${r.unidade}`,
                local: r.nome || 'N/A',
                data: r.data,
                status: r.entregue ? 'ENTREGUE' : 'PENDENTE'
            }));

            await PdfService.generateModuleReport('Controle de Vôlei', reportData, { start: startDate, end: endDate });
            setIsPdfModalOpen(false);
            toast.success('Relatório gerado!');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            toast.error('Falha ao gerar relatório.');
        } finally {
            setIsExportLoading(false);
        }
    }

    if (loading) return <div>Carregando...</div>;

    const totalPages = Math.ceil(reservas.length / ITEMS_PER_PAGE);
    const paginatedReservas = reservas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Controle de Vôlei</h1>
                    <p className="text-slate-500 text-sm">Gerencie as retiradas e devoluções da rede de vôlei.</p>
                </div>
                <button
                    onClick={() => setIsPdfModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-sm"
                >
                    <FileText size={18} className="text-primary" />
                    Exportar PDF
                </button>
            </header>

            {/* Configuração da Regra */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">Regra de Liberação da Rede</h3>
                        <p className="text-xs text-slate-500 font-medium">Defina quando os moradores podem agendar a rede.</p>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto">
                    <button
                        onClick={() => handleConfigChange('todos')}
                        disabled={savingConfig}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${voleiModo === 'todos' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {savingConfig && voleiModo === 'todos' ? <Loader2 size={14} className="animate-spin" /> : null}
                        Livre (Todos os Dias)
                    </button>
                    <button
                        onClick={() => handleConfigChange('alternado')}
                        disabled={savingConfig}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${voleiModo === 'alternado' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {savingConfig && voleiModo === 'alternado' ? <Loader2 size={14} className="animate-spin" /> : null}
                        Dias Alternados
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <th className="px-4 md:px-6 py-4">Morador</th>
                            <th className="px-4 md:px-6 py-4">Data</th>
                            <th className="px-4 md:px-6 py-4">Status</th>
                            <th className="px-4 md:px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedReservas.map(res => (
                            <tr key={res.id} className="text-sm">
                                <td className="px-4 md:px-6 py-4">
                                    <p className="font-bold text-slate-800 text-xs md:text-sm">{res.nome}</p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Unid: {res.unidade}</p>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-slate-500 font-medium text-xs md:text-sm">
                                    {formatDate(res.data)}
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(res.id, res.entregue)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-bold uppercase flex items-center gap-2 transition-all ${res.entregue ? 'bg-highlight/10 text-highlight' : 'bg-secondary/10 text-secondary'}`}
                                    >
                                        {res.entregue ? <><CheckCircle size={12} /> ENTREGUE</> : <><Clock size={12} /> PENDENTE</>}
                                    </button>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <button onClick={() => deleteReserva(res.id)} className="text-slate-200 hover:text-secondary p-1">
                                        <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-white rounded-b-[2rem] border border-t-0 border-slate-100 shadow-sm overflow-hidden mt-[-2rem] pt-[2rem]">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={reservas.length}
                />
            </div>

            <DateSelectorModal 
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                onConfirm={handleExportConfirm}
                loading={isExportLoading}
                title="Histórico de Vôlei"
            />
        </div>
    );
}

export default AdminVolleyball;
