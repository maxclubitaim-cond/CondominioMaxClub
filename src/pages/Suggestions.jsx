import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MessageSquare, ArrowLeft, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Suggestions() {
    const [unidade, setUnidade] = useState('');
    const [texto, setTexto] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        const { error } = await supabase
            .from('sugestoes')
            .insert([{ unidade, texto }]);

        if (!error) {
            setSent(true);
        }
        setSubmitting(false);
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full"
            >
                <button
                    onClick={() => navigate('/')}
                    className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                >
                    <ArrowLeft size={16} /> Voltar
                </button>

                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <MessageSquare className="text-primary w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Sugestões</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Melhorias no MaxClub</p>
                        </div>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 px-1">Sua Unidade</label>
                                    <input
                                        type="text" required
                                        value={unidade} onChange={(e) => setUnidade(e.target.value)}
                                        placeholder="Ex: 101"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                    />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3 px-1 flex justify-between">
                                    Mensagem
                                    <span className="text-[10px] text-slate-400">{texto.length}/300</span>
                                </label>
                                <textarea
                                    required
                                    maxLength={300}
                                    value={texto} onChange={(e) => setTexto(e.target.value)}
                                    rows={5}
                                    placeholder="Conte-nos como podemos melhorar o condomínio..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white font-bold py-5 rounded-3xl shadow-lg shadow-primary/20 hover:bg-blue-600 disabled:bg-slate-300 transition-all flex justify-center items-center gap-2 text-lg"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Enviar Sugestão</>}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 bg-highlight/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle className="text-highlight w-12 h-12" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Obrigado pela sua sugestão!</h2>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                                Nossa equipe de gestão irá analisar sua mensagem com carinho para melhorar nosso dia a dia.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-primary text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all"
                            >
                                Voltar ao Início
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default Suggestions;
