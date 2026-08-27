import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Save, Loader2, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MaintenanceForm({ areas, estoqueItens, onSubmit, saving }) {
    const [areaNome, setAreaNome] = useState('');
    const [responsavelTecnico, setResponsavelTecnico] = useState('');
    const [descricao, setDescricao] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [antesFiles, setAntesFiles] = useState([]);
    const [depoisFiles, setDepoisFiles] = useState([]);
    const [antesPreviews, setAntesPreviews] = useState([]);
    const [depoisPreviews, setDepoisPreviews] = useState([]);

    const [usarEstoque, setUsarEstoque] = useState(false);
    const [itensUsados, setItensUsados] = useState([]);

    const fileInputAntes = useRef();
    const fileInputDepois = useRef();

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

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

        if (!areaNome) return toast.error('Por favor, informe a Área ou Local.');
        if (!responsavelTecnico) return toast.error('Por favor, informe o Responsável Técnico.');
        if (!descricao) return toast.error('Por favor, descreva o que foi feito.');
        if (usarEstoque && itensUsados.length === 0) return toast.error('Adicione ao menos um item do estoque.');

        const payload = {
            areaNome,
            responsavelTecnico,
            descricao,
            observacoes,
            antesFiles,
            depoisFiles,
            itensUsados: usarEstoque ? itensUsados : []
        };

        try {
            await onSubmit(payload);
            resetForm();
        } catch (error) {
            // Error is handled by parent or hook
        }
    };

    const resetForm = () => {
        setAreaNome('');
        setResponsavelTecnico('');
        setDescricao('');
        setObservacoes('');
        setAntesFiles([]);
        setDepoisFiles([]);
        setAntesPreviews([]);
        setDepoisPreviews([]);
        setUsarEstoque(false);
        setItensUsados([]);
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
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Área / Local</label>
                            <input
                                required
                                list="areas-sugeridas"
                                value={areaNome}
                                onChange={(e) => setAreaNome(e.target.value)}
                                placeholder="Ex: Elevador Social, Piscina, Portão Sul"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700"
                            />
                            <datalist id="areas-sugeridas">
                                {areas.map(a => (
                                    <option key={a.id} value={a.nome} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Responsável Técnico / Acompanhante</label>
                            <input
                                required
                                type="text"
                                value={responsavelTecnico}
                                onChange={(e) => setResponsavelTecnico(e.target.value)}
                                placeholder="Nome da pessoa ou empresa"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">O que foi feito?</label>
                            <input
                                required
                                type="text"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Ex: Troca de placa eletrônica ou Limpeza de filtros"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Observações Adicionais (Opcional)</label>
                            <textarea
                                rows={4}
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                placeholder="Detalhes técnicos ou pendências..."
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-medium resize-none"
                            />
                        </div>
                        
                        {/* Integração com Estoque */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Utilizou itens do estoque?</label>
                                <button 
                                    type="button"
                                    onClick={() => setUsarEstoque(!usarEstoque)}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${usarEstoque ? 'bg-primary' : 'bg-slate-300'}`}
                                >
                                    <span className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${usarEstoque ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {usarEstoque && (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <select 
                                            id="select-estoque"
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Selecione um item...</option>
                                            {estoqueItens.filter(ei => ei.quantidade_atual > 0).map(ei => (
                                                <option key={ei.id} value={ei.id}>{ei.nome} (Disp: {ei.quantidade_atual} {ei.unidade_medida})</option>
                                            ))}
                                        </select>
                                        <input 
                                            id="qtd-estoque"
                                            type="number" 
                                            min="1" 
                                            placeholder="Qtd" 
                                            className="w-20 px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                const select = document.getElementById('select-estoque');
                                                const qtd = document.getElementById('qtd-estoque');
                                                if(!select.value || !qtd.value) return toast.error('Selecione um item e a quantidade');
                                                const itemE = estoqueItens.find(e => e.id === select.value);
                                                const qtdToAdd = parseInt(qtd.value);
                                                
                                                const alreadyAdded = itensUsados.find(i => i.item_id === itemE.id)?.quantidade || 0;
                                                
                                                if (alreadyAdded + qtdToAdd > itemE.quantidade_atual) {
                                                    return toast.error('Quantidade excede o saldo disponível!');
                                                }
                                                
                                                setItensUsados(prev => {
                                                    const existing = prev.find(i => i.item_id === itemE.id);
                                                    if (existing) {
                                                        return prev.map(i => i.item_id === itemE.id ? { ...i, quantidade: i.quantidade + qtdToAdd } : i);
                                                    }
                                                    return [...prev, {
                                                        item_id: itemE.id,
                                                        nome: itemE.nome,
                                                        quantidade: qtdToAdd,
                                                        unidade_medida: itemE.unidade_medida
                                                    }];
                                                });
                                                select.value = '';
                                                qtd.value = '';
                                            }}
                                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 text-xs uppercase tracking-widest"
                                        >
                                            <Plus size={16} /> Adicionar
                                        </button>
                                    </div>
                                    
                                    {itensUsados.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {itensUsados.map((iu, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                                                    <span className="font-semibold text-slate-700">{iu.nome}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-slate-600">{iu.quantidade} {iu.unidade_medida}</span>
                                                        <button type="button" onClick={() => setItensUsados(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Upload Antes */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Fotos: Antes do Serviço</label>
                            <div className="flex flex-wrap gap-3">
                                {antesPreviews.map((pre, idx) => (
                                    <div key={idx} className="w-24 h-24 rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                                        <img src={pre} alt="Antes" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx, 'antes')}
                                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputAntes.current.click()}
                                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50"
                                >
                                    <Camera size={24} />
                                    <span className="text-[9px] font-bold uppercase mt-1">Anexar</span>
                                </button>
                            </div>
                            <input type="file" hidden multiple accept="image/*" ref={fileInputAntes} onChange={(e) => handleFileChange(e, 'antes')} />
                        </div>

                        {/* Upload Depois */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Fotos: Depois do Serviço</label>
                            <div className="flex flex-wrap gap-3">
                                {depoisPreviews.map((pre, idx) => (
                                    <div key={idx} className="w-24 h-24 rounded-2xl bg-slate-100 relative group overflow-hidden border border-slate-200">
                                        <img src={pre} alt="Depois" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx, 'depois')}
                                            className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => fileInputDepois.current.click()}
                                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all bg-slate-50"
                                >
                                    <Camera size={24} />
                                    <span className="text-[9px] font-bold uppercase mt-1">Anexar</span>
                                </button>
                            </div>
                            <input type="file" hidden multiple accept="image/*" ref={fileInputDepois} onChange={(e) => handleFileChange(e, 'depois')} />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 text-white font-bold px-12 py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} className="text-primary" />}
                        Finalizar Registro
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
