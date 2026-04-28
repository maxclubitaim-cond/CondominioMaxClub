import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench,
    Plus,
    History,
    Camera,
    Save,
    Loader2,
    CheckCircle,
    Trash2,
    Image as ImageIcon,
    X,
    Maximize2,
    Clock,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function ImageModal({ url, onClose }) {
    if (!url) return null;
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl w-full h-full flex items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <img src={url} alt="Visualização" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </motion.div>
        </motion.div>
    );
}

function AdminMaintenance() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('novo'); // 'novo' ou 'historico'
    const [areas, setAreas] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    // Form states
    const [areaNome, setAreaNome] = useState('');
    const [responsavelTecnico, setResponsavelTecnico] = useState('');
    const [descricao, setDescricao] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [antesFiles, setAntesFiles] = useState([]);
    const [depoisFiles, setDepoisFiles] = useState([]);
    const [antesPreviews, setAntesPreviews] = useState([]);
    const [depoisPreviews, setDepoisPreviews] = useState([]);

    const fileInputAntes = useRef();
    const fileInputDepois = useRef();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const { data: areasData } = await supabase.from('manutencao_areas').select('*').eq('ativo', true).order('nome');
        const { data: regsData } = await supabase
            .from('manutencao_registros')
            .select('*, manutencao_areas(nome), perfis(nome)')
            .order('data_manutencao', { ascending: false });

        if (areasData) setAreas(areasData);
        if (regsData) setRegistros(regsData);
        setLoading(false);
    }

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

    async function uploadImages(files) {
        const urls = [];
        for (const file of files) {
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('manutencao')
                .upload(fileName, file);

            if (error) throw error;

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('manutencao')
                    .getPublicUrl(fileName);
                urls.push(publicUrl);
            }
        }
        return urls;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Validação correta dos novos campos
        if (!areaNome) return toast.error('Por favor, informe a Área ou Local.');
        if (!responsavelTecnico) return toast.error('Por favor, informe o Responsável Técnico.');
        if (!descricao) return toast.error('Por favor, descreva o que foi feito.');

        setSaving(true);
        try {
            console.log('Iniciando upload de imagens...');
            const fotosAntesUrls = await uploadImages(antesFiles);
            const fotosDepoisUrls = await uploadImages(depoisFiles);

            console.log('Enviando dados para o Supabase...');
            const { data, error } = await supabase
                .from('manutencao_registros')
                .insert([{
                    area_nome: areaNome,
                    responsavel_tecnico: responsavelTecnico,
                    descricao,
                    observacoes: observacoes || '',
                    fotos_antes: fotosAntesUrls,
                    fotos_depois: fotosDepoisUrls,
                    realizado_por: profile?.id,
                    data_manutencao: new Date().toISOString()
                }])
                .select('*, perfis(nome)');

            if (error) {
                console.error('Erro Supabase:', error);
                throw error;
            }

            if (data && data.length > 0) {
                setRegistros(prev => [data[0], ...prev]);
                toast.success('Manutenção registrada com sucesso!');
                resetForm();
                setTimeout(() => {
                    setActiveTab('historico');
                }, 2000);
            }
        } catch (err) {
            console.error('Erro detalhado:', err);
            toast.error('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setAreaNome('');
        setResponsavelTecnico('');
        setDescricao('');
        setObservacoes('');
        setAntesFiles([]);
        setDepoisFiles([]);
        setAntesPreviews([]);
        setDepoisPreviews([]);
    }

    if (loading) return <div className="p-20 text-center text-slate-400">Carregando dados de manutenção...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Módulo de Manutenção</h1>
                    <p className="text-slate-500 font-medium">Controle de conservação e vistorias técnica.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('novo')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'novo' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Plus size={18} />
                        Novo Registro
                    </button>
                    <button
                        onClick={() => setActiveTab('historico')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'historico' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <History size={18} />
                        Histórico
                    </button>
                </div>
            </header>

            {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-bold flex items-center gap-3">
                    <CheckCircle size={20} /> {message}
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === 'novo' ? (
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
                ) : (
                    <motion.div
                        key="historico-list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {registros.length > 0 ? (
                            registros.map(reg => (
                                <MaintenanceRecordCard
                                    key={reg.id}
                                    record={reg}
                                    onImageClick={(url) => setSelectedImageUrl(url)}
                                />
                            ))
                        ) : (
                            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
                                <Wrench size={48} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">Nenhuma manutenção registrada ainda.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {selectedImageUrl && (
                    <ImageModal url={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function MaintenanceRecordCard({ record, onImageClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {record.area_nome}
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {new Date(record.data_manutencao).toLocaleString('pt-BR')}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800">{record.descricao}</h3>

                    {record.observacoes && (
                        <p className="text-slate-500 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                            "{record.observacoes}"
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-xs font-bold pt-2">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-primary" /> Responsável: {record.responsavel_tecnico}
                        </div>
                        <span className="hidden sm:inline text-slate-200">•</span>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-300" /> Registrado por: {record.perfis?.nome}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 self-center md:self-start">
                    {/* Resumo de fotos */}
                    <div className="flex -space-x-4">
                        {[...(record.fotos_antes || []), ...(record.fotos_depois || [])].slice(0, 3).map((url, i) => (
                            <div key={i} className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg overflow-hidden relative">
                                <img src={url} className="w-full h-full object-cover" />
                                {i === 2 && [...(record.fotos_antes || []), ...(record.fotos_depois || [])].length > 3 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                                        +{[...(record.fotos_antes || []), ...(record.fotos_depois || [])].length - 2}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 flex items-center justify-center transition-all"
                    >
                        {isExpanded ? <X size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 border-t border-slate-50 bg-slate-50/30"
                    >
                        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Bloco Antes */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Situação Anterior (Antes)
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {record.fotos_antes?.map((url, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => onImageClick(url)}
                                            className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                                        >
                                            <img src={url} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    {(!record.fotos_antes || record.fotos_antes.length === 0) && (
                                        <div className="col-span-full py-10 text-center text-slate-300 italic text-xs">Sem fotos do antes.</div>
                                    )}
                                </div>
                            </div>

                            {/* Bloco Depois */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Situação Final (Depois)
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {record.fotos_depois?.map((url, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => onImageClick(url)}
                                            className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                                        >
                                            <img src={url} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                    {(!record.fotos_depois || record.fotos_depois.length === 0) && (
                                        <div className="col-span-full py-10 text-center text-slate-300 italic text-xs">Sem fotos do depois.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminMaintenance;
