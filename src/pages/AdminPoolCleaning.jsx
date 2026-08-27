import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplet,
    Plus,
    History,
    Camera,
    Save,
    Loader2,
    CheckCircle,
    Trash2,
    X,
    Maximize2,
    Clock,
    User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '../utils/dateUtils';
import Pagination from '../components/common/Pagination';
import { compressImage } from '../utils/imageCompression';

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

function AdminPoolCleaning() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('novo'); // 'novo' ou 'historico'
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Form states
    const [ph, setPh] = useState('');
    const [cloro, setCloro] = useState('');
    const [alcalinidade, setAlcalinidade] = useState('');
    
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
        const { data: regsData, error } = await supabase
            .from('limpeza_piscina')
            .select('*, perfis(nome)')
            .order('data_registro', { ascending: false });

        if (error) {
            console.error('Erro ao buscar registros:', error);
        }

        if (regsData) setRegistros(regsData);
        setLoading(false);
    }

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limitar a 4 fotos
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

    async function uploadImages(files) {
        const urls = [];
        for (const file of files) {
            const compressedFile = await compressImage(file);
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${compressedFile.name}`;
            const { data, error } = await supabase.storage
                .from('piscina')
                .upload(fileName, compressedFile);

            if (error) {
                console.error("Upload error:", error);
                throw error;
            }

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('piscina')
                    .getPublicUrl(fileName);
                urls.push(publicUrl);
            }
        }
        return urls;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!ph || !cloro || !alcalinidade) return toast.error('Por favor, informe todos os parâmetros químicos.');
        
        // Verificação opcional: obrigar pelo menos 1 foto.
        if (antesFiles.length === 0 || depoisFiles.length === 0) {
            return toast.error('É necessário enviar pelo menos uma foto do Antes e uma do Depois.');
        }

        setSaving(true);
        try {
            console.log('Iniciando upload de imagens para a piscina...');
            const fotosAntesUrls = await uploadImages(antesFiles);
            const fotosDepoisUrls = await uploadImages(depoisFiles);

            console.log('Enviando dados para o Supabase...');
            const { data, error } = await supabase
                .from('limpeza_piscina')
                .insert([{
                    ph: parseFloat(ph.replace(',', '.')),
                    cloro: parseFloat(cloro.replace(',', '.')),
                    alcalinidade: parseFloat(alcalinidade.replace(',', '.')),
                    fotos_antes: fotosAntesUrls,
                    fotos_depois: fotosDepoisUrls,
                    operador_id: profile?.id,
                    data_registro: new Date().toISOString()
                }])
                .select('*, perfis(nome)');

            if (error) {
                console.error('Erro Supabase:', error);
                throw error;
            }

            if (data && data.length > 0) {
                setRegistros(prev => [data[0], ...prev]);
                setCurrentPage(1);
                toast.success('Tratamento registrado com sucesso!');
                resetForm();
                setTimeout(() => {
                    setActiveTab('historico');
                }, 2000);
            }
        } catch (err) {
            console.error('Erro detalhado:', err);
            toast.error('Erro ao salvar. Verifique se o bucket "piscina" foi criado no Storage.');
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setPh('');
        setCloro('');
        setAlcalinidade('');
        setAntesFiles([]);
        setDepoisFiles([]);
        setAntesPreviews([]);
        setDepoisPreviews([]);
    }

    if (loading) return <div className="p-20 text-center text-slate-400">Carregando dados da piscina...</div>;

    const totalPages = Math.ceil(registros.length / ITEMS_PER_PAGE);
    const paginatedRegistros = registros.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Tratamento de Piscina</h1>
                    <p className="text-slate-500 font-medium">Controle químico e vistorias da água.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('novo')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'novo' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Plus size={18} />
                        Novo Registro
                    </button>
                    <button
                        onClick={() => setActiveTab('historico')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'historico' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
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
                                    <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 space-y-6">
                                        <h3 className="text-amber-900 font-bold flex items-center gap-2">
                                            <Droplet className="text-amber-500" size={20} />
                                            Parâmetros Químicos
                                        </h3>
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Nível de pH (Ideal: 7.2 a 7.6)</label>
                                            <input
                                                required
                                                type="number" step="0.1"
                                                value={ph}
                                                onChange={(e) => setPh(e.target.value)}
                                                placeholder="Ex: 7.4"
                                                className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Cloro Livre (Ideal: 1 a 3 ppm)</label>
                                            <input
                                                required
                                                type="number" step="0.1"
                                                value={cloro}
                                                onChange={(e) => setCloro(e.target.value)}
                                                placeholder="Ex: 2.0"
                                                className="w-full px-6 py-4 bg-white border border-amber-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 font-bold text-slate-700"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Alcalinidade (Ideal: 80 a 120 ppm)</label>
                                            <input
                                                required
                                                type="number" step="1"
                                                value={alcalinidade}
                                                onChange={(e) => setAlcalinidade(e.target.value)}
                                                placeholder="Ex: 100"
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
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(idx, 'antes')}
                                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {antesFiles.length < 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputAntes.current.click()}
                                                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all bg-slate-50"
                                                >
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
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(idx, 'depois')}
                                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {depoisFiles.length < 4 && (
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputDepois.current.click()}
                                                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all bg-slate-50"
                                                >
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
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-amber-600 text-white font-bold px-12 py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
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
                            <>
                                {paginatedRegistros.map(reg => (
                                    <PoolRecordCard
                                        key={reg.id}
                                        record={reg}
                                        onImageClick={(url) => setSelectedImageUrl(url)}
                                    />
                                ))}
                                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mt-6">
                                    <Pagination 
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        totalItems={registros.length}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
                                <Droplet size={48} className="text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold">Nenhum tratamento registrado ainda.</p>
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

function PoolRecordCard({ record, onImageClick }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5">
                            <Droplet size={12} /> Piscina
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <Clock size={12} /> {formatDateTime(record.data_registro)}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">pH</span>
                            <span className={`font-black text-lg ${record.ph >= 7.2 && record.ph <= 7.6 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.ph}
                            </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">Cloro</span>
                            <span className={`font-black text-lg ${record.cloro >= 1 && record.cloro <= 3 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.cloro} ppm
                            </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                            <span className="block text-[10px] font-bold uppercase text-slate-400">Alcalinidade</span>
                            <span className={`font-black text-lg ${record.alcalinidade >= 80 && record.alcalinidade <= 120 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.alcalinidade} ppm
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-xs font-bold pt-4">
                        <div className="flex items-center gap-1.5">
                            <User size={14} className="text-amber-400" /> Operador: {record.perfis?.nome || 'Desconhecido'}
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
                        className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 flex items-center justify-center transition-all"
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
                                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Antes do Tratamento
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
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
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Depois do Tratamento
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
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

export default AdminPoolCleaning;
