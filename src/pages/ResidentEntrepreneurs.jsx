import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Store, Plus, X, Loader2, Tag, User, MapPin, Camera, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { compressImage } from '../utils/imageCompression';
import { formatDate } from '../utils/dateUtils';

function ResidentEntrepreneurs() {
    const { morador } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        nome: '',
        tipo_servico: '',
        descricao: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Delete States
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (morador?.unidade) {
            fetchMeusServicos();
        }
    }, [morador]);

    async function fetchMeusServicos() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('empreendedores')
                .select('*')
                .eq('unidade', morador.unidade)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            toast.error('Erro ao carregar seus anúncios.');
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 4) {
            toast.error('Você pode enviar no máximo 4 fotos.');
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews([...previews, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        
        if (selectedFiles.length === 0) {
            toast.error('Adicione pelo menos uma foto.');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Publicando seu serviço...');

        try {
            const uploadedUrls = [];

            // Upload images to Supabase Storage
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const compressedFile = await compressImage(file);
                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `service-${Date.now()}-${i}-${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('empreendedores')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('empreendedores')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            // Save to database
            const { error: dbError } = await supabase
                .from('empreendedores')
                .insert([{
                    ...formData,
                    unidade: morador.unidade,
                    fotos: uploadedUrls
                }]);

            if (dbError) throw dbError;

            toast.success('Serviço publicado com sucesso!', { id: toastId });
            setIsAddModalOpen(false);
            resetForm();
            fetchMeusServicos();
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            toast.error('Erro ao publicar serviço. Tente novamente.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        const toastId = toast.loading('Excluindo anúncio...');

        try {
            const serviceToDelete = services.find(s => s.id === deletingId);
            
            if (serviceToDelete && serviceToDelete.fotos && serviceToDelete.fotos.length > 0) {
                const filePaths = serviceToDelete.fotos.map(url => {
                    const parts = url.split('/');
                    return parts[parts.length - 1];
                });

                await supabase.storage.from('empreendedores').remove(filePaths);
            }

            const { error } = await supabase
                .from('empreendedores')
                .delete()
                .eq('id', deletingId);

            if (error) throw error;

            toast.success('Anúncio e fotos removidos!', { id: toastId });
            fetchMeusServicos();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir anúncio.', { id: toastId });
        } finally {
            setIsDeleting(false);
            setDeletingId(null);
        }
    };

    const resetForm = () => {
        setFormData({ nome: '', tipo_servico: '', descricao: '' });
        setSelectedFiles([]);
        previews.forEach(p => URL.revokeObjectURL(p));
        setPreviews([]);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden pb-20 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/condomino')}
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="font-bold text-slate-900 text-lg md:text-xl tracking-tight leading-none mb-1 flex items-center gap-2">
                                Meus Serviços
                            </h1>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Unidade {morador?.unidade}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Novo Serviço</span>
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="animate-spin text-primary w-8 h-8 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando seus serviços...</p>
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative group">
                                <div className="h-48 bg-slate-50 relative overflow-hidden">
                                    {service.fotos && service.fotos.length > 0 ? (
                                        <img src={service.fotos[0]} alt={service.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Store size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{service.tipo_servico}</span>
                                    </div>
                                    {service.fotos && service.fotos.length > 1 && (
                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/20">
                                            +{service.fotos.length - 1} fotos
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">{service.nome}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{service.descricao}</p>
                                    
                                    <div className="flex items-center justify-between mb-4 border-t border-slate-50 pt-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Postado em {formatDate(service.created_at)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2 relative z-20">
                                        <button 
                                            onClick={() => handleDelete(service.id)}
                                            className="w-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} /> Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <Store className="mx-auto text-slate-200 w-16 h-16 mb-6" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Você ainda não divulgou nada</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Ofereça seus serviços profissionais para seus vizinhos na vitrine do condomínio.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                        >
                            Criar meu primeiro anúncio
                        </button>
                    </div>
                )}
            </main>

            {/* Modal Novo Serviço */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-100 my-auto flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-[2.5rem]">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Divulgar Serviço</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Preencha os dados abaixo para publicar na vitrine.</p>
                                </div>
                                <button 
                                    onClick={() => !isSubmitting && setIsAddModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddService} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Nome Comercial / Seu Nome *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={formData.nome}
                                                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold text-slate-900"
                                                placeholder="Ex: Maria Bolos ou João Pinturas"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="group/field">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Unidade</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={morador?.unidade || ''}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Tipo de Serviço / Categoria *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={formData.tipo_servico}
                                            onChange={(e) => setFormData({...formData, tipo_servico: e.target.value})}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold text-slate-900"
                                            placeholder="Ex: Gastronomia, Estética, Reformas..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group/field">
                                    <div className="flex justify-between items-center ml-2 mb-2">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição *</label>
                                        <span className={`text-[10px] font-bold ${formData.descricao.length > 500 ? 'text-rose-500' : 'text-slate-400'}`}>
                                            {formData.descricao.length}/500
                                        </span>
                                    </div>
                                    <textarea
                                        value={formData.descricao}
                                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-medium text-slate-900 resize-none"
                                        placeholder="Detalhes sobre o que você oferece, horários e contato..."
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fotos do Serviço (Até 4)</label>
                                        <span className="text-[10px] font-bold text-slate-400">{selectedFiles.length}/4 selecionadas</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-4">
                                        {previews.map((url, idx) => (
                                            <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group border border-slate-200">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {selectedFiles.length < 4 && (
                                            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer bg-slate-50">
                                                <Camera size={24} />
                                                <span className="text-[8px] font-bold uppercase mt-2">Adicionar</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Publicar Serviço'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Confirmação Exclusão */}
            <AnimatePresence>
                {deletingId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setDeletingId(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                                <Trash2 size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Serviço?</h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">
                                Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                    Confirmar Exclusão
                                </button>
                                <button
                                    onClick={() => setDeletingId(null)}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResidentEntrepreneurs;
