import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeftRight, TrendingDown, Loader2, Shuffle, Info, FileText, Building, Save } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { formatDate } from '../../utils/dateUtils';

export function ParkingEditModal({ isOpen, onClose, editingVaga, numero, setNumero, subsolo, setSubsolo, unidadeDona, setUnidadeDona, unidadeAlugou, setUnidadeAlugou, onSubmit, formSaving }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-3xl shadow-xl relative z-10 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{editingVaga ? 'Editar Vaga' : 'Nova Vaga'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>
                <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6">
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
    );
}

export function ParkingSwapModal({ isOpen, onClose, vagas, swapVaga1, setSwapVaga1, swapVaga2, setSwapVaga2, onSubmit, formSaving }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-lg rounded-3xl shadow-xl relative z-10 overflow-hidden p-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Remanejamento</h2>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed">Troque as unidades entre duas vagas de forma segura e rápida.</p>

                <form onSubmit={onSubmit} className="space-y-8">
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
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Cancelar</button>
                        <button type="submit" disabled={formSaving || !swapVaga1 || !swapVaga2} className="flex-2 bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                            {formSaving ? <Loader2 className="animate-spin" /> : <TrendingDown size={18} />} Confirmar Troca
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export function ParkingLotteryModal({ isOpen, onClose, lotteryTitle, setLotteryTitle, onSubmit, loading }) {
    const container = useRef(null);

    useGSAP(() => {
        if (isOpen && container.current) {
            const tl = gsap.timeline();
            tl.from('.modal-bg', { opacity: 0, duration: 0.3 })
              .from('.modal-content', { opacity: 0, scale: 0.5, y: 50, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.1')
              .from('.modal-icon', { rotate: -180, opacity: 0, scale: 0, duration: 0.6, ease: 'back.out(2)' }, '-=0.2')
              .from('.modal-text', { opacity: 0, x: -20, stagger: 0.1, duration: 0.4 }, '-=0.4');
        }
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div ref={container} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={onClose} className="modal-bg absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <div className="modal-content bg-white w-full max-w-md rounded-3xl shadow-xl relative z-10 overflow-hidden p-10">
                <div className="modal-icon w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Shuffle size={32} className="text-primary" />
                </div>
                <h2 className="modal-text text-2xl font-bold text-slate-800 mb-2">Motor de Sorteio</h2>
                <p className="modal-text text-slate-500 text-sm mb-10 leading-relaxed">As unidades serão embaralhadas entre as vagas cadastradas nos subsolos 1 e 2.</p>

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
                        <button onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Cancelar</button>
                        <button
                            onClick={onSubmit}
                            disabled={loading || !lotteryTitle}
                            className="flex-2 bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 text-lg"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Shuffle size={20} />} Sortear Agora
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ParkingLotteryDetailsModal({ sorteio, onClose, onPrint }) {
    const container = useRef(null);

    useGSAP(() => {
        if (sorteio && container.current) {
            gsap.from('.modal-bg-details', { opacity: 0, duration: 0.3 });
            gsap.from('.modal-content-details', { opacity: 0, scale: 0.9, y: 30, duration: 0.4, ease: 'power2.out' });
            gsap.from('.result-item', { 
                opacity: 0, 
                x: -30, 
                stagger: 0.05, 
                duration: 0.4, 
                ease: 'power2.out',
                delay: 0.2 
            });
        }
    }, [sorteio]);

    if (!sorteio) return null;
    return (
        <div ref={container} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div onClick={onClose} className="modal-bg-details absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <div className="modal-content-details bg-white w-full max-w-2xl rounded-3xl shadow-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{sorteio.titulo}</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                            Sorteado em: {formatDate(sorteio.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onPrint(sorteio)}
                            className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                            <FileText size={18} /> Imprimir Ata PDF
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sorteio.resultado.map((res, i) => (
                            <div key={i} className="result-item flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
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
            </div>
        </div>
    );
}
