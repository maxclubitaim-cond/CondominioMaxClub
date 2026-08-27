import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Camera, Save, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PoolCleaningForm({ onSubmit, saving }) {
    const [ph, setPh] = useState('');
    const [cloro, setCloro] = useState('');
    const [alcalinidade, setAlcalinidade] = useState('');
    const [antesFiles, setAntesFiles] = useState([]);
    const [depoisFiles, setDepoisFiles] = useState([]);
    const [antesPreviews, setAntesPreviews] = useState([]);
    const [depoisPreviews, setDepoisPreviews] = useState([]);

    const fileInputAntes = useRef();
    const fileInputDepois = useRef();

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const currentCount = type === 'antes' ? antesFiles.length : depoisFiles.length;
        if (currentCount + files.length > 4) {
            toast.error('Você pode enviar no máximo 4 fotos por seção.');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));

        if (type === 'antes') {
            setAntesFiles(prev => [...prev, ...files]);
            setAntesPreviews(prev => [...prev, ...newPreviews]);
        } else {
            setDepoisFiles(prev => [...prev, ...files]);
            setDepoisPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeFile = (index, type) => {
        if (type === 'antes') {
            setAntesFiles(prev => prev.filter((_, i) => i !== index));
            setAntesPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            setDepoisFiles(prev => prev.filter((_, i) => i !== index));
            setDepoisPreviews(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!ph || !cloro || !alcalinidade) return toast.error('Por favor, informe todos os parâmetros químicos.');
        
        if (antesFiles.length === 0 || depoisFiles.length === 0) {
            return toast.error('É necessário enviar pelo menos uma foto do Antes e uma do Depois.');
        }

        try {
            await onSubmit({ ph, cloro, alcalinidade, antesFiles, depoisFiles });
            setPh('');
            setCloro('');
            setAlcalinidade('');
            setAntesFiles([]);
            setDepoisFiles([]);
            setAntesPreviews([]);
            setDepoisPreviews([]);
        } catch (error) {
            // error is handled by parent component
        }
    };

    return (
        <motion.div
            key="novo-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
        >
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 space-y-6">
                            <h3 className="text-amber-900 font-bold flex items-center gap-2">
                                <Droplet className="text-amber-500" size={20} />
                                Parâmetros Químicos
                            </h3>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Nível de pH (Ideal: 7.2 a 7.6)</label>
                                <input
                                    required type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="Ex: 7.4"
                                    className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Cloro Livre (Ideal: 1 a 3 ppm)</label>
                                <input
                                    required type="number" step="0.1" value={cloro} onChange={(e) => setCloro(e.target.value)} placeholder="Ex: 2.0"
                                    className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Alcalinidade (Ideal: 80 a 120 ppm)</label>
                                <input
                                    required type="number" step="1" value={alcalinidade} onChange={(e) => setAlcalinidade(e.target.value)} placeholder="Ex: 100"
                                    className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Upload Antes */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 flex justify-between">
                                <span>Fotos: Antes do Tratamento</span>
                                <span className="text-slate-300">{antesFiles.length}/4</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {antesPreviews.map((pre, idx) => (
                                    <div key={idx} className="w-24 h-24 rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                                        <img src={pre} alt="Antes" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile(idx, 'antes')} className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-secondary opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                    </div>
                                ))}
                                {antesFiles.length < 4 && (
                                    <button type="button" onClick={() => fileInputAntes.current.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all bg-slate-50">
                                        <Camera size={24} />
                                        <span className="text-[9px] font-bold uppercase mt-1">Anexar</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" hidden multiple accept="image/*" ref={fileInputAntes} onChange={(e) => handleFileChange(e, 'antes')} />
                        </div>

                        {/* Upload Depois */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 flex justify-between">
                                <span>Fotos: Depois do Tratamento</span>
                                <span className="text-slate-300">{depoisFiles.length}/4</span>
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {depoisPreviews.map((pre, idx) => (
                                    <div key={idx} className="w-24 h-24 rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                                        <img src={pre} alt="Depois" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile(idx, 'depois')} className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-secondary opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                    </div>
                                ))}
                                {depoisFiles.length < 4 && (
                                    <button type="button" onClick={() => fileInputDepois.current.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all bg-slate-50">
                                        <Camera size={24} />
                                        <span className="text-[9px] font-bold uppercase mt-1">Anexar</span>
                                    </button>
                                )}
                            </div>
                            <input type="file" hidden multiple accept="image/*" ref={fileInputDepois} onChange={(e) => handleFileChange(e, 'depois')} />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <button type="submit" disabled={saving} className="bg-amber-600 text-white font-bold px-12 py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Finalizar Registro
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
