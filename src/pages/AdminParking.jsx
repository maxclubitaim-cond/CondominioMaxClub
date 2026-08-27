import React, { useState } from 'react';
import { Search, Shuffle, FileText, Plus, Trash2, Edit2, ArrowLeftRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';
import Pagination from '../components/common/Pagination';
import { useParking } from '../hooks/useParking';
import { ParkingEditModal, ParkingSwapModal, ParkingLotteryModal, ParkingLotteryDetailsModal } from '../components/parking/ParkingModals';

export default function AdminParking() {
    const { vagas, sorteios, loading, addEditVaga, removeVaga, swapVagas, generateLottery } = useParking();

    // Modais e UI States
    const [isLoterriaOpen, setIsLoterriaOpen] = useState(false);
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);
    const [selectedSorteio, setSelectedSorteio] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // States para Formulários
    const [editingVaga, setEditingVaga] = useState(null);
    const [numero, setNumero] = useState('');
    const [subsolo, setSubsolo] = useState(1);
    const [unidadeDona, setUnidadeDona] = useState('');
    const [unidadeAlugou, setUnidadeAlugou] = useState('');
    const [swapVaga1, setSwapVaga1] = useState('');
    const [swapVaga2, setSwapVaga2] = useState('');
    const [lotteryTitle, setLotteryTitle] = useState('');
    
    // Status
    const [formSaving, setFormSaving] = useState(false);
    const [lotteryLoading, setLotteryLoading] = useState(false);

    const handleAddEdit = async (e) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            await addEditVaga({
                numero,
                subsolo: parseInt(subsolo),
                unidade_dona: unidadeDona,
                unidade_alugou: unidadeAlugou || null
            }, editingVaga);
            closeAddEdit();
            setCurrentPage(1);
        } catch (err) {
            // Error logged by hook
        } finally {
            setFormSaving(false);
        }
    };

    const handleSwap = async (e) => {
        e.preventDefault();
        setFormSaving(true);
        try {
            await swapVagas(swapVaga1, swapVaga2);
            toast.success('Vagas remanejadas com sucesso!');
            setIsSwapOpen(false);
            setSwapVaga1('');
            setSwapVaga2('');
        } catch (err) {
            toast.error('Erro ao remanejar vagas.');
        } finally {
            setFormSaving(false);
        }
    };

    const runLottery = async () => {
        setLotteryLoading(true);
        try {
            await generateLottery(lotteryTitle);
            setIsLoterriaOpen(false);
            setLotteryTitle('');
        } catch (err) {
            // Handled by hook
        } finally {
            setLotteryLoading(false);
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-white">Excluir esta vaga?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await removeVaga(id);
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
        ));
    };

    const openEdit = (vaga) => {
        setEditingVaga(vaga);
        setNumero(vaga.numero);
        setSubsolo(vaga.subsolo);
        setUnidadeDona(vaga.unidade_dona);
        setUnidadeAlugou(vaga.unidade_alugou || '');
        setIsAddEditOpen(true);
    };

    const closeAddEdit = () => {
        setIsAddEditOpen(false);
        setEditingVaga(null);
        setNumero('');
        setSubsolo(1);
        setUnidadeDona('');
        setUnidadeAlugou('');
    };

    const printAta = (sorteio) => {
        const printWindow = window.open('', '_blank');
        const dataFormatada = formatDate(sorteio.created_at);

        let tabelaHtml = '';
        sorteio.resultado.forEach(res => {
            tabelaHtml += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${res.unidade}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">#${res.vaga}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">Subsolo ${res.subsolo}</td>
                </tr>
            `;
        });

        const content = `
            <html>
            <head>
                <title>Ata de Sorteio - MaxClub Itaim</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .header p { margin: 5px 0; color: #666; }
                    .title { text-align: center; margin-bottom: 30px; font-weight: bold; font-size: 20px; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { background: #f5f5f5; padding: 12px; border: 1px solid #ddd; }
                    .signatures { margin-top: 60px; display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 40px; text-align: center; }
                    .sig-line { border-top: 1px solid #000; padding-top: 10px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>CONDOMÍNIO MAX CLUB ITAIM</h1>
                    <p>Rua Cachoeira do Utupiru, 318 - São Paulo/SP</p>
                </div>
                <div class="title">ATA DE SORTEIO: ${sorteio.titulo}</div>
                <p>Data do Sorteio: ${dataFormatada}</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Unidade</th>
                            <th>Vaga</th>
                            <th>Subsolo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tabelaHtml}
                    </tbody>
                </table>
                
                <div class="signatures">
                    <div>
                        <div class="sig-line">SÍNDICO(A)</div>
                    </div>
                    <div>
                        <div class="sig-line">CONSELHEIRO(A) 01</div>
                    </div>
                    <div>
                        <div class="sig-line">CONSELHEIRO(A) 02</div>
                    </div>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) return <div className="p-8">Carregando...</div>;

    const totalPages = Math.ceil(vagas.length / ITEMS_PER_PAGE);
    const paginatedVagas = vagas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Gestão de Vagas</h1>
                    <p className="text-slate-500 text-xs md:sm font-medium">Controle de subsolos, proprietários e trocas internas.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    <button onClick={() => setIsSwapOpen(true)} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 font-bold px-3 md:px-6 py-2.5 md:py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs md:text-sm">
                        <ArrowLeftRight size={16} className="text-primary" /> Trocar
                    </button>
                    <button onClick={() => setIsAddEditOpen(true)} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 font-bold px-3 md:px-6 py-2.5 md:py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs md:text-sm">
                        <Plus size={16} className="text-primary" /> Nova
                    </button>
                    <button onClick={() => setIsLoterriaOpen(true)} className="flex-1 md:flex-none bg-primary text-white font-bold px-3 md:px-6 py-2.5 md:py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-xs md:text-sm">
                        <Shuffle size={16} /> Sorteio
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <section className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
                                <Search size={18} className="text-slate-400" /> Mapa de Garagem
                            </h2>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <span className="w-2 h-2 bg-primary rounded-full" /> SUBSOLO 1
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <span className="w-2 h-2 bg-secondary rounded-full" /> SUBSOLO 2
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-50">
                                        <th className="px-4 md:px-6 py-4 md:py-5">Sub / Vaga</th>
                                        <th className="px-4 md:px-6 py-4 md:py-5">Proprietário</th>
                                        <th className="px-4 md:px-6 py-4 md:py-5 hidden sm:table-cell">Status</th>
                                        <th className="px-4 md:px-6 py-4 md:py-5 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedVagas.map(v => (
                                        <tr key={v.id} className="text-sm hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-4 md:px-6 py-4">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                    <span className={`w-fit px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-bold uppercase ${v.subsolo === 1 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                                        S{v.subsolo}
                                                    </span>
                                                    <span className="font-bold text-slate-900 text-base md:text-lg">#{v.numero}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 font-bold text-[10px] md:text-xs">
                                                        {v.unidade_dona.slice(0, 1)}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-xs md:text-sm">Unid. {v.unidade_dona}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                                                {v.unidade_alugou ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Alugada</span>
                                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg w-fit text-xs">Unid. {v.unidade_alugou}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300 font-medium italic text-xs">Vaga livre</span>
                                                )}
                                            </td>
                                            <td className="px-4 md:px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-secondary transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={vagas.length}
                        />
                    </div>
                </section>

                <section className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Shuffle size={120} />
                        </div>
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                            <FileText className="text-primary" /> Resultados
                        </h2>
                        <div className="space-y-4 relative z-10">
                            {sorteios.map(s => (
                                <div
                                    key={s.id}
                                    onClick={() => setSelectedSorteio(s)}
                                    className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold text-sm text-slate-100">{s.titulo}</h3>
                                        <FileText size={16} className="text-slate-600 group-hover:text-primary" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{formatDate(s.created_at)}</span>
                                        <span className="text-[10px] font-bold text-primary uppercase">{s.resultado?.length || 0} Vagas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <ParkingEditModal 
                isOpen={isAddEditOpen} 
                onClose={closeAddEdit} 
                editingVaga={editingVaga} 
                numero={numero} setNumero={setNumero} 
                subsolo={subsolo} setSubsolo={setSubsolo} 
                unidadeDona={unidadeDona} setUnidadeDona={setUnidadeDona} 
                unidadeAlugou={unidadeAlugou} setUnidadeAlugou={setUnidadeAlugou} 
                onSubmit={handleAddEdit} formSaving={formSaving} 
            />

            <ParkingSwapModal 
                isOpen={isSwapOpen} onClose={() => setIsSwapOpen(false)} 
                vagas={vagas} 
                swapVaga1={swapVaga1} setSwapVaga1={setSwapVaga1} 
                swapVaga2={swapVaga2} setSwapVaga2={setSwapVaga2} 
                onSubmit={handleSwap} formSaving={formSaving} 
            />

            <ParkingLotteryModal 
                isOpen={isLoterriaOpen} onClose={() => setIsLoterriaOpen(false)} 
                lotteryTitle={lotteryTitle} setLotteryTitle={setLotteryTitle} 
                onSubmit={runLottery} loading={lotteryLoading} 
            />

            <ParkingLotteryDetailsModal 
                sorteio={selectedSorteio} onClose={() => setSelectedSorteio(null)} 
                onPrint={printAta} 
            />
        </div>
    );
}
