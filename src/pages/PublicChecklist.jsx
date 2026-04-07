import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardCheck,
    Send,
    Camera,
    AlertCircle,
    CheckCircle2,
    Home,
    MessageSquare,
    Upload,
    X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const PublicChecklist = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [unidade, setUnidade] = useState('');
    const [dataEvento, setDataEvento] = useState('');
    const [respostas, setRespostas] = useState({
        '01. Limpeza da Churrasqueira': '',
        '02. Limpeza da Geladeira (Churrasqueira)': '',
        '03. Limpeza do Fogão (Salão de Festas)': '',
        '04. Limpeza Geladeira (Salão de Festas)': '',
        '05. Limpeza Mesas e Cadeiras (Salão de Festas)': '',
        '06. Limpeza Piso (Salão de Festas)': '',
        '07. Limpeza Piso (Salão de Festas)': ''
    });

    // Estrutura para ocorrências: { perguntaIndex: { relato: '', fotoFile: null, preview: '' } }
    const [ocorrencias, setOcorrencias] = useState({});

    const perguntas = Object.keys(respostas);

    const handleResposta = (pergunta, index, valor) => {
        setRespostas(prev => ({ ...prev, [pergunta]: valor }));

        // Se mudar para Ótimo ou Regular, limpa a ocorrência daquela pergunta
        if (valor !== 'Ruim') {
            const newOcorrencias = { ...ocorrencias };
            delete newOcorrencias[index];
            setOcorrencias(newOcorrencias);
        } else {
            // Se mudar para Ruim, inicializa o objeto se não existir
            if (!ocorrencias[index]) {
                setOcorrencias(prev => ({
                    ...prev,
                    [index]: { relato: '', fotoFile: null, preview: '' }
                }));
            }
        }
    };

    const handleOcorrenciaChange = (index, field, value) => {
        setOcorrencias(prev => ({
            ...prev,
            [index]: { ...prev[index], [field]: value }
        }));
    };

    const handleImageChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            handleOcorrenciaChange(index, 'fotoFile', file);
            handleOcorrenciaChange(index, 'preview', URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!unidade || !dataEvento || Object.values(respostas).some(v => v === '')) {
            alert('Por favor, preencha todos os campos e responda todas as perguntas.');
            return;
        }

        setLoading(true);

        try {
            const finalOcorrencias = {};

            // Processa cada ocorrência (Upload de fotos se houver)
            for (const [index, data] of Object.entries(ocorrencias)) {
                const pergunta = perguntas[index];
                let foto_url = null;

                if (data.fotoFile) {
                    const fileExt = data.fotoFile.name.split('.').pop();
                    const fileName = `${Date.now()}_${index}.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('salao-checklist')
                        .upload(fileName, data.fotoFile);

                    if (uploadError) {
                        console.error(`Erro no upload da foto ${index}:`, uploadError);
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('salao-checklist')
                            .getPublicUrl(fileName);
                        foto_url = publicUrl;
                    }
                }

                finalOcorrencias[pergunta] = {
                    relato: data.relato,
                    foto: foto_url
                };
            }

            // Calcula aderência
            const totalPerguntas = perguntas.length;
            const boasRegular = Object.values(respostas).filter(r => r === 'Ótimo' || r === 'Regular').length;
            const aderencia = (boasRegular / totalPerguntas) * 100;

            const { error } = await supabase.from('salao_checklist').insert({
                unidade,
                data_evento: dataEvento,
                respostas,
                aderencia,
                ocorrencias: finalOcorrencias
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (error) {
            console.error('Erro ao enviar checklist:', error);
            alert('Erro ao enviar checklist. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl text-center border border-slate-100"
                >
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Checklist Enviado!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Obrigado por ajudar na gestão do nosso Salão de Festas. Sua contribuição é fundamental para manter o espaço impecável.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={18} /> Voltar ao Início
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-4">
                        <ClipboardCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Checklist Salão de Festas</h1>
                    <p className="text-slate-500 mt-2 font-medium">Gestão e Melhoria Contínua - MaxClub Itaim</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados do Evento */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <AlertCircle size={20} className="text-primary" /> Dados do Evento
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Sua Unidade</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: 101"
                                    value={unidade}
                                    onChange={(e) => setUnidade(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Data do Evento</label>
                                <input
                                    type="date"
                                    required
                                    value={dataEvento}
                                    onChange={(e) => setDataEvento(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Perguntas */}
                    <div className="space-y-4">
                        {perguntas.map((pergunta, index) => (
                            <motion.div
                                key={pergunta}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white overflow-hidden rounded-[2rem] shadow-lg border border-slate-50"
                            >
                                <div className="p-6">
                                    <p className="text-slate-700 font-bold mb-4">{pergunta}</p>
                                    <div className="flex gap-2">
                                        {['Ótimo', 'Regular', 'Ruim'].map((opcao) => (
                                            <button
                                                key={opcao}
                                                type="button"
                                                onClick={() => handleResposta(pergunta, index, opcao)}
                                                className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${respostas[pergunta] === opcao
                                                    ? opcao === 'Ruim' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' :
                                                        opcao === 'Regular' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' :
                                                            'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {opcao}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sub-formulário para Ruim */}
                                <AnimatePresence>
                                    {respostas[pergunta] === 'Ruim' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-rose-50 border-t border-rose-100 p-6 space-y-4"
                                        >
                                            <div>
                                                <label className="block text-[10px] font-bold text-rose-500 uppercase flex items-center gap-2 mb-2">
                                                    <MessageSquare size={14} /> Relato da Ocorrência
                                                </label>
                                                <textarea
                                                    maxLength={300}
                                                    value={ocorrencias[index]?.relato || ''}
                                                    onChange={(e) => handleOcorrenciaChange(index, 'relato', e.target.value)}
                                                    placeholder="O que aconteceu de errado aqui? (max 300 chars)..."
                                                    className="w-full p-4 bg-white border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-rose-400 outline-none h-24 resize-none transition-all placeholder:text-rose-200 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-rose-500 uppercase flex items-center gap-2 mb-2">
                                                    <Camera size={14} /> Foto da Irregularidade
                                                </label>
                                                <div className="flex gap-4 items-center">
                                                    <div className="relative group">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            capture="environment"
                                                            onChange={(e) => handleImageChange(index, e)}
                                                            className="hidden"
                                                            id={`photo-u-${index}`}
                                                        />
                                                        <label
                                                            htmlFor={`photo-u-${index}`}
                                                            className="w-20 h-20 bg-white rounded-2xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center text-rose-300 cursor-pointer hover:bg-rose-100/50 hover:border-rose-400 hover:text-rose-500 transition-all overflow-hidden"
                                                        >
                                                            {ocorrencias[index]?.preview ? (
                                                                <img src={ocorrencias[index].preview} alt="Prev" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Upload size={20} />
                                                            )}
                                                        </label>
                                                    </div>
                                                    <p className="text-[10px] text-rose-400 font-medium leading-tight max-w-[150px]">
                                                        Registre o problema com uma foto do local.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Botão de Envio */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-[2rem] font-black text-white text-lg uppercase shadow-xl transition-all flex items-center justify-center gap-3 ${loading ? 'bg-slate-400' : 'bg-primary hover:brightness-110 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={20} /> Enviar Checklist
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-[10px] font-black text-slate-400 uppercase mt-12 tracking-widest leading-loose">
                    Gestão de Condomínios • MaxClub Itaim • 2026
                </p>
            </div>
        </div>
    );
};

export default PublicChecklist;
