import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    ArrowLeft,
    CheckCircle,
    Loader2,
    Trophy,
    Info,
    X,
    Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function VolleyballBooking() {
    const [unidade, setUnidade] = useState('');
    const [nome, setNome] = useState('');
    const [data, setData] = useState('');
    const [showRules, setShowRules] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [booked, setBooked] = useState(false);
    const navigate = useNavigate();

    // Regra: Disponível um dia sim, um dia não, a partir de 09/04/2026
    function isDateAllowed(dateString) {
        if (!dateString) return false;
        const selectedDate = new Date(dateString + 'T00:00:00');
        const referenceDate = new Date('2026-04-09T00:00:00');
        
        // Diferença em dias
        const diffTime = selectedDate.getTime() - referenceDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
        
        return diffDays % 2 === 0;
    }

    async function handleBook(e) {
        e.preventDefault();
        setShowRules(true);
    }

    async function confirmBooking() {
        setSubmitting(true);
        const { error } = await supabase
            .from('reservas_volei')
            .insert([{ unidade, nome, data }]);

        if (!error) {
            setBooked(true);
            setShowRules(false);
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
                            <Trophy className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none mb-2 uppercase">Rede de Vôlei</h1>
                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Reserva de Equipamento</p>
                    </div>

                    <div className="p-10">

                    {!booked ? (
                        <form onSubmit={handleBook} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Número da Unidade</label>
                                    <input
                                        type="text" required
                                        value={unidade} onChange={(e) => setUnidade(e.target.value)}
                                        placeholder="Ex: 101"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Responsável</label>
                                    <input
                                        type="text" required
                                        value={nome} onChange={(e) => setNome(e.target.value)}
                                        placeholder="Nome do Responsável"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none font-bold text-slate-900 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex justify-between items-center">
                                    Data da Reserva
                                    <span className="text-[9px] text-primary font-bold tracking-widest bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                                        Estatus: Dia Sim/Não
                                    </span>
                                </label>
                                <div className="relative group/date">
                                    <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/date:text-primary transition-colors z-10" size={18} />
                                    <input
                                        type="date" required
                                        value={data} onChange={(e) => setData(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl focus:ring-4 outline-none font-bold transition-all relative z-0 ${
                                            data && !isDateAllowed(data) 
                                            ? 'border-rose-500 text-rose-500 bg-rose-50 focus:ring-rose-50' 
                                            : 'border-slate-100 text-slate-900 focus:ring-primary/5 focus:border-primary/20'
                                        }`}
                                    />
                                </div>
                                {data && !isDateAllowed(data) && (
                                    <p className="mt-4 text-[11px] font-bold text-rose-500 px-1 flex items-center gap-2 animate-pulse">
                                        <X size={14} className="shrink-0" /> Este dia não está disponível conforme a regra operacional.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!data || !isDateAllowed(data)}
                                className={`w-full font-bold py-5 rounded-3xl transition-all flex justify-center items-center gap-4 text-sm uppercase tracking-widest ${
                                    !data || !isDateAllowed(data)
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                    : 'bg-primary text-white hover:bg-blue-600 shadow-xl shadow-primary/20'
                                }`}
                            >
                                Confirmar Agendamento <CheckCircle size={18} />
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                                <CheckCircle className="text-primary w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Agendamento Realizado!</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                                Sua solicitação foi enviada. Confirme agora com a gestão via WhatsApp para garantir a entrega.
                            </p>
                            <div className="flex flex-col gap-5 max-w-sm mx-auto">
                                <a
                                    href={`https://wa.me/5511943233132?text=${encodeURIComponent(`Olá, gostaria de informar o agendamento da rede de vôlei. Unidade: ${unidade}, Nome: ${nome}.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-emerald-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-widest border border-white/10"
                                >
                                    Confirmar via WhatsApp
                                    <ArrowLeft size={16} className="rotate-180" />
                                </a>
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
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
                                        <h3 className="text-xl font-bold tracking-tight leading-none uppercase">Regras de Uso</h3>
                                        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Materiais Esportivos</span>
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
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Retirada e Devolução</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">A rede deve ser retirada na portaria e devolvida no mesmo dia.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">02</div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Zelo pelo Material</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">A unidade é responsável financeiramente por danos ao equipamento.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="w-8 h-8 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">03</div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Local de Uso</p>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Uso exclusivo na quadra oficial do MaxClub Itaim.</p>
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
                                        onClick={confirmBooking}
                                        disabled={submitting}
                                        className="flex-[2] bg-primary text-white font-bold text-[10px] uppercase tracking-widest py-5 rounded-2xl shadow-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        {submitting ? <Loader2 className="animate-spin text-white" /> : 'Confirmar Reserva'}
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

export default VolleyballBooking;
