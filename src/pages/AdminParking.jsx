import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Shuffle,
    FileText,
    Plus,
    Trash2,
    Edit2,
    CheckCircle,
    Loader2,
    Info,
    X,
    ArrowLeftRight,
    TrendingDown,
    TrendingUp,
    MapPin,
    Save,
    Building
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function AdminParking() {
    const [vagas, setVagas] = useState([]);
    const [sorteios, setSorteios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSorteio, setSelectedSorteio] = useState(null);

    // Modais
    const [isLoterriaOpen, setIsLoterriaOpen] = useState(false);
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isSwapOpen, setIsSwapOpen] = useState(false);

    // States para Formulários
    const [editingVaga, setEditingVaga] = useState(null);
    const [numero, setNumero] = useState('');
    const [subsolo, setSubsolo] = useState(1);
    const [unidadeDona, setUnidadeDona] = useState('');
    const [unidadeAlugou, setUnidadeAlugou] = useState('');

    // State para Troca
    const [swapVaga1, setSwapVaga1] = useState('');
    const [swapVaga2, setSwapVaga2] = useState('');

    const [lotteryLoading, setLotteryLoading] = useState(false);
    const [lotteryTitle, setLotteryTitle] = useState('');
    const [formSaving, setFormSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        const { data: dataVagas } = await supabase.from('vagas').select('*').order('numero');
        const { data: dataSorteios } = await supabase.from('sorteio_historico').select('*').order('created_at', { ascending: false });

        if (dataVagas) setVagas(dataVagas);
        if (dataSorteios) setSorteios(dataSorteios);
        setLoading(false);
    }

    async function handleAddEdit(e) {
        e.preventDefault();
        setFormSaving(true);

        const payload = {
            numero,
            subsolo: parseInt(subsolo),
            unidade_dona: unidadeDona,
            unidade_alugou: unidadeAlugou || null
        };

        if (editingVaga) {
            const { error } = await supabase.from('vagas').update(payload).eq('id', editingVaga.id);
            if (error) {
                toast.error('Erro ao atualizar: ' + error.message);
            } else {
                toast.success('Vaga atualizada!');
            }
        } else {
            const { error } = await supabase.from('vagas').insert([payload]);
            if (error) {
                toast.error('Erro ao cadastrar: ' + error.message);
            } else {
                toast.success('Vaga cadastrada!');
            }
        }

        fetchData();
        closeAddEdit();
        setFormSaving(false);
    }

    const closeAddEdit = () => {
        setIsAddEditOpen(false);
        setEditingVaga(null);
        setNumero('');
        setSubsolo(1);
        setUnidadeDona('');
        setUnidadeAlugou('');
    };

    const openEdit = (vaga) => {
        setEditingVaga(vaga);
        setNumero(vaga.numero);
        setSubsolo(vaga.subsolo);
        setUnidadeDona(vaga.unidade_dona);
        setUnidadeAlugou(vaga.unidade_alugou || '');
        setIsAddEditOpen(true);
    };

    async function deleteVaga(id) {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-slate-900">Excluir esta vaga?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const { error } = await supabase.from('vagas').delete().eq('id', id);
                            if (error) {
                                toast.error('Erro ao excluir: ' + error.message);
                            } else {
                                toast.success('Vaga excluída.');
                                fetchData();
                            }
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
    }

    async function handleSwap(e) {
        e.preventDefault();
        setFormSaving(true);

        const v1 = vagas.find(v => v.id === swapVaga1);
        const v2 = vagas.find(v => v.id === swapVaga2);

        if (!v1 || !v2) return;

        // Trocar unidades entre as duas vagas
        const op1 = supabase.from('vagas').update({
            unidade_dona: v2.unidade_dona,
            unidade_alugou: v2.unidade_alugou
        }).eq('id', v1.id);

        const op2 = supabase.from('vagas').update({
            unidade_dona: v1.unidade_dona,
            unidade_alugou: v1.unidade_alugou
        }).eq('id', v2.id);

        await Promise.all([op1, op2]);
        fetchData();
        setIsSwapOpen(false);
        setSwapVaga1('');
        setSwapVaga2('');
        setFormSaving(false);
    }

    async function runLottery() {
        if (!lotteryTitle) return toast.error('Dê um título ao sorteio');
        setLotteryLoading(true);

        const unidades = vagas.map(v => v.unidade_dona);
        const vagasDisponiveis = vagas.map(v => ({ numero: v.numero, subsolo: v.subsolo }));

        const shuffledUnidades = [...unidades].sort(() => Math.random() - 0.5);

        const resultado = vagasDisponiveis.map((vaga, idx) => ({
            vaga: vaga.numero,
            subsolo: vaga.subsolo,
            unidade: shuffledUnidades[idx]
        }));

        const { error } = await supabase.from('sorteio_historico').insert([{
            titulo: lotteryTitle,
            resultado: resultado
        }]);

        if (!error) {
            toast.success('Sorteio realizado com sucesso!');
            fetchData();
            setIsLoterriaOpen(false);
            setLotteryTitle('');
        } else {
            toast.error('Erro ao realizar sorteio: ' + error.message);
        }
        setLotteryLoading(false);
    }

    const printAta = (sorteio) => {
        const printWindow = window.open('', '_blank');
        const dataFormatada = new Date(sorteio.created_at).toLocaleDateString('pt-BR');

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
    }

    if (loading) return <div className="p-8">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">Gestão de Vagas</h1>
                    <p className="text-slate-500 text-xs md:sm font-medium">Controle de subsolos, proprietários e trocas internas.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    <button
                        onClick={() => setIsSwapOpen(true)}
                        className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 font-bold px-3 md:px-6 py-2.5 md:py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                        <ArrowLeftRight size={16} className="text-primary" /> Trocar
                    </button>
                    <button
                        onClick={() => setIsAddEditOpen(true)}
                        className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 font-bold px-3 md:px-6 py-2.5 md:py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
                        <Plus size={16} className="text-primary" /> Nova
                    </button>
                    <button
                        onClick={() => setIsLoterriaOpen(true)}
                        className="flex-1 md:flex-none bg-primary text-white font-bold px-3 md:px-6 py-2.5 md:py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-xs md:text-sm"
                    >
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
                                    {vagas.map(v => (
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
                                                    <button onClick={() => deleteVaga(v.id)} className="p-2 text-slate-400 hover:text-secondary transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(s.created_at).toLocaleDateString()}</span>
                                        <span className="text-[10px] font-bold text-primary uppercase">{s.resultado?.length || 0} Vagas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal Adicionar/Editar */}
            <AnimatePresence>
                {isAddEditOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAddEdit} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-3xl shadow-xl relative z-10 overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-xl font-bold text-slate-800">{editingVaga ? 'Editar Vaga' : 'Nova Vaga'}</h2>
                                <button onClick={closeAddEdit} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleAddEdit} className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Número da Vaga</label>
                                        <input type="text" required value={numero} onChange={(e) => setNumero(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-2 outline-none font-bold text-lg" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Subsolo</label>
                                        <select value={subsolo} onChange={(e) => setSubsolo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl mt-2 outline-none font-bold">
                                            <option value={1}>Subsolo 1</option>
                                            <option value={2}>Subsolo 2</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px) font-bold uppercase text-slate-400">Unidade Proprietária (Dona)</label>
                                    <div className="relative mt-2">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                                        <input type="text" required value={unidadeDona} onChange={(e) => setUnidadeDona(e.target.value)} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Ex: 307 Bloco A" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Unidade Alugou (Opcional)</label>
                                    <input type="text" value={unidadeAlugou} onChange={(e) => setUnidadeAlugou(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl mt-2 outline-none font-bold" placeholder="Deixe em branco se livre" />
                                </div>
                                <button type="submit" disabled={formSaving} className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-lg">
                                    {formSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} {editingVaga ? 'Atualizar' : 'Cadastrar'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Troca/Remanejamento */}
            <AnimatePresence>
                {isSwapOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSwapOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-lg rounded-3xl shadow-xl relative z-10 overflow-hidden p-10">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Remanejamento</h2>
                            <p className="text-slate-500 text-sm mb-10 leading-relaxed">Troque as unidades entre duas vagas de forma segura e rápida.</p>

                            <form onSubmit={handleSwap} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Vaga Origem</label>
                                        <select required value={swapVaga1} onChange={(e) => setSwapVaga1(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl mt-2 outline-none font-bold">
                                            <option value="">Selecione...</option>
                                            {vagas.map(v => <option key={v.id} value={v.id}>Vaga #{v.numero} (Unid. {v.unidade_dona})</option>)}
                                        </select>
                                    </div>
                                    <div className="pt-6 text-primary"><ArrowLeftRight size={24} /></div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400">Vaga Destino</label>
                                        <select required value={swapVaga2} onChange={(e) => setSwapVaga2(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl mt-2 outline-none font-bold">
                                            <option value="">Selecione...</option>
                                            {vagas.map(v => <option key={v.id} value={v.id}>Vaga #{v.numero} (Unid. {v.unidade_dona})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsSwapOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Cancelar</button>
                                    <button type="submit" disabled={formSaving || !swapVaga1 || !swapVaga2} className="flex-2 bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                                        {formSaving ? <Loader2 className="animate-spin" /> : <TrendingDown size={18} />} Confirmar Troca
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Sorteio */}
            <AnimatePresence>
                {isLoterriaOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoterriaOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-md rounded-3xl shadow-xl relative z-10 overflow-hidden p-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <Shuffle size={32} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Motor de Sorteio</h2>
                            <p className="text-slate-500 text-sm mb-10 leading-relaxed">As unidades serão embaralhadas entre as vagas cadastradas nos subsolos 1 e 2.</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Título do Sorteio</label>
                                    <input
                                        type="text" value={lotteryTitle} onChange={(e) => setLotteryTitle(e.target.value)}
                                        placeholder="Ex: Sorteio Bienal 2026/2027"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl mt-2 outline-none font-bold text-slate-700"
                                    />
                                </div>

                                <div className="p-5 bg-primary/5 rounded-[1.5rem] border border-primary/10 flex gap-4">
                                    <Info className="text-primary shrink-0" size={20} />
                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                        O resultado será salvo permanentemente no histórico e ficará disponível para consulta dos moradores na visualização de vagas.
                                    </p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setIsLoterriaOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Cancelar</button>
                                    <button
                                        onClick={runLottery}
                                        disabled={lotteryLoading || !lotteryTitle}
                                        className="flex-2 bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 text-lg"
                                    >
                                        {lotteryLoading ? <Loader2 className="animate-spin" /> : <Shuffle size={20} />} Sortear Agora
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Detalhes do Sorteio */}
            <AnimatePresence>
                {selectedSorteio && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSorteio(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-2xl rounded-3xl shadow-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedSorteio.titulo}</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                                        Sorteado em: {new Date(selectedSorteio.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => printAta(selectedSorteio)}
                                        className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <FileText size={18} /> Imprimir Ata PDF
                                    </button>
                                    <button onClick={() => setSelectedSorteio(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedSorteio.resultado.map((res, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unidade</span>
                                                <span className="font-bold text-slate-700">{res.unidade}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vaga</span>
                                                <span className={`font-bold ${res.subsolo === 1 ? 'text-primary' : 'text-secondary'}`}>#{res.vaga} (S{res.subsolo})</span>
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

export default AdminParking;
