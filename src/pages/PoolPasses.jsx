import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle,
    Loader2,
    Ticket,
    Info,
    X,
    Users,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function PoolPasses() {
    const [unidade, setUnidade] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [dataUso, setDataUso] = useState('');
    const [nomeVisitante, setNomeVisitante] = useState('');
    const [showRules, setShowRules] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [booked, setBooked] = useState(false);
    const navigate = useNavigate();

    async function handleRequest(e) {
        e.preventDefault();
        setShowRules(true);
    }

    async function confirmRequest() {
        setSubmitting(true);
        const { error } = await supabase
            .from('solicitacoes_pulseiras')
            .insert([{ 
                unidade, 
                quantidade: parseInt(quantidade), 
                data_uso: dataUso,
                nome_visitante: nomeVisitante,
                status: 'PENDENTE'
            }]);

        if (!error) {
            setBooked(true);
            setShowRules(false);
        } else {
            alert('Erro ao solicitar: ' + error.message);
        }
        setSubmitting(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden relative group">
                    <div className="bg-primary p-10 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500">
                            <Ticket className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none mb-2">Piscina MaxClub</h1>
                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Solicitação de Pulseiras</p>
                    </div>

                    <div className="p-10">

                    {!booked ? (
                        <form onSubmit={handleRequest} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Número da Unidade</label>
                                    <input
                                        type="text" required
                                        value={unidade} onChange={(e) => setUnidade(e.target.value)}
                                        placeholder="Ex: 82 Bloco C"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex justify-between">
                                        Qtd Pulseiras
                                        <span className="text-[9px] text-rose-500 font-bold uppercase">Máximo 2</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2].map(num => (
                                            <button
                                                key={num} type="button"
                                                onClick={() => setQuantidade(num)}
                                                className={`py-4 rounded-xl font-bold text-xs transition-all border-2 ${
                                                    parseInt(quantidade) === num
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                                                }`}
                                            >
                                                {num} {num === 1 ? 'Pulseira' : 'Pulseiras'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Nome do Visitante (Opcional)</label>
                                <div className="relative group/input">
                                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        value={nomeVisitante} onChange={(e) => setNomeVisitante(e.target.value)}
                                        placeholder="Nome do convidado principal"
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex justify-between items-center">
                                    Data de Uso
                                    <span className="text-[9px] text-rose-500 font-bold tracking-widest bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/50">
                                        Exceto Domingos
                                    </span>
                                </label>
                                <input
                                    type="date" required
                                    value={dataUso} onChange={(e) => setDataUso(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 outline-none font-bold transition-all ${
                                        dataUso && new Date(dataUso + 'T00:00:00').getDay() === 0
                                        ? 'border-rose-500 text-rose-500 bg-rose-50 focus:ring-rose-50'
                                        : 'border-slate-100 text-slate-900 focus:ring-primary/5 focus:border-primary/20'
                                    }`}
                                />
                                {dataUso && new Date(dataUso + 'T00:00:00').getDay() === 0 && (
                                    <p className="mt-4 text-[11px] font-bold text-rose-500 px-1 flex items-center gap-2 animate-pulse">
                                        <X size={14} className="shrink-0" /> Não é permitida a reserva para domingos.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!dataUso || new Date(dataUso + 'T00:00:00').getDay() === 0}
                                className={`w-full font-bold py-5 rounded-3xl shadow-2xl transition-all flex justify-center items-center gap-3 text-sm uppercase tracking-[0.2em] ${
                                    !dataUso || new Date(dataUso + 'T00:00:00').getDay() === 0
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-navy text-white hover:bg-slate-800 shadow-navy/20'
                                }`}
                            >
                                Gerar Solicitação <ArrowLeft size={18} className="rotate-180 text-primary" />
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-highlight/20">
                                <CheckCircle className="text-highlight w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Solicitado com Sucesso!</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                                Retire suas pulseiras na portaria apresentando o número da sua unidade e um documento.
                            </p>
                            <div className="flex flex-col gap-4 max-w-xs mx-auto">
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-primary text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Voltar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>

            {/* Rules Modal */}
            <AnimatePresence>
                {showRules && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRules(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-primary text-white relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                        <Info className="text-white" size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-bold tracking-tight leading-none">Regras Piscina</h3>
                                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Visitantes</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowRules(false)} className="text-white/60 hover:text-white transition-colors relative z-10">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-10 space-y-8 bg-slate-50/50">
                                <ul className="space-y-5">
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">01</div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Limite Diário</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Máximo de 2 pulseiras por unidade por dia.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">02</div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Retirada Física</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">As pulseiras devem ser retiradas na portaria pelo morador.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">03</div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Responsabilidade</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">O morador é responsável pela conduta de seus convidados.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowRules(false)}
                                        className="flex-1 bg-white text-slate-400 font-bold text-[10px] uppercase tracking-widest py-5 rounded-2xl hover:text-primary hover:bg-slate-50 transition-all border border-slate-100"
                                    >
                                        Revisar
                                    </button>
                                    <button
                                        onClick={confirmRequest}
                                        disabled={submitting}
                                        className="flex-[2] bg-primary text-white font-bold text-[10px] uppercase tracking-widest py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        {submitting ? <Loader2 className="animate-spin text-white" /> : 'Confirmar Solicitação'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default PoolPasses;
