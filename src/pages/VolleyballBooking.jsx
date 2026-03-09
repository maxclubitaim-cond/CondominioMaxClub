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
                    <ArrowLeft size={16} /> Voltar para Início
                </button>

                <div className="bg-white p-10 rounded-[3rem] shadow-premium border border-slate-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-highlight/10 rounded-2xl flex items-center justify-center">
                            <Trophy className="text-highlight w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800">Rede de Vôlei</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Reserva de Equipamento</p>
                        </div>
                    </div>

                    {!booked ? (
                        <form onSubmit={handleBook} className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">Sua Unidade</label>
                                <input
                                    type="text" required
                                    value={unidade} onChange={(e) => setUnidade(e.target.value)}
                                    placeholder="Ex: 82 Bloco C"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">Nome Completo</label>
                                <input
                                    type="text" required
                                    value={nome} onChange={(e) => setNome(e.target.value)}
                                    placeholder="Quem irá retirar a rede"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">Data da Reserva</label>
                                <input
                                    type="date" required
                                    value={data} onChange={(e) => setData(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-slate-900 text-white font-bold py-5 rounded-3xl shadow-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2 text-lg"
                            >
                                Solicitar Reserva
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle className="text-highlight w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-4">Reserva Solicitada!</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                                Sua solicitação foi enviada. Envie uma mensagem para a gestão informando do seu agendamento.
                            </p>
                            <div className="flex flex-col gap-4">
                                <a
                                    href={`https://wa.me/5511943233132?text=${encodeURIComponent(`Olá, gostaria de informar o agendamento da rede de vôlei. Unidade: ${unidade}, Nome: ${nome}.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-green-600 text-white font-bold px-10 py-5 rounded-2xl shadow-lg border-b-4 border-green-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    Enviar WhatsApp Gestão
                                </a>
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                                >
                                    Voltar para o Início
                                </button>
                            </div>
                        </motion.div>
                    )}
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
                            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-primary/5">
                                <div className="flex items-center gap-3">
                                    <Info className="text-primary" />
                                    <h3 className="text-2xl font-black text-slate-800">Regras de Uso</h3>
                                </div>
                                <button onClick={() => setShowRules(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={28} />
                                </button>
                            </div>
                            <div className="p-10 space-y-6">
                                <ul className="space-y-4 text-slate-600 font-medium">
                                    <li className="flex gap-3 text-sm">
                                        <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                        A rede deve ser retirada na portaria com a Gestão e devolvida no guarda volume no mesmo dia.
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                        Qualquer dano ao material é de responsabilidade da unidade solicitante.
                                    </li>
                                    <li className="flex gap-3 text-sm">
                                        <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                                        O uso é restrito apenas à quadra do condomínio.
                                    </li>
                                </ul>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setShowRules(false)}
                                        className="flex-1 bg-slate-100 text-slate-600 font-bold py-5 rounded-3xl hover:bg-slate-200 transition-all"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={confirmBooking}
                                        disabled={submitting}
                                        className="flex-2 bg-highlight text-white font-bold py-5 px-12 rounded-3xl shadow-xl shadow-highlight/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
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
