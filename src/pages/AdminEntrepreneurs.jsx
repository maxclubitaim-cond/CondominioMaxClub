import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trash2, 
    Edit2, 
    Search, 
    Store, 
    Loader2, 
    X, 
    AlertCircle,
    CheckCircle2,
    Save,
    Plus,
    Camera,
    Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

function AdminEntrepreneurs() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingService, setEditingService] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [newPhotos, setNewPhotos] = useState([]);
    const [photosToRemove, setPhotosToRemove] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    async function fetchServices() {
        try {
            const { data, error } = await supabase
                .from('empreendedores')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            toast.error('Erro ao carregar serviços.');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        const toastId = toast.loading('Excluindo anúncio...');

        try {
            console.log('Iniciando exclusão completa do anúncio ID:', deletingId);
            
            // 1. Buscar o anúncio para pegar as URLs das fotos
            const serviceToDelete = services.find(s => s.id === deletingId);
            
            if (serviceToDelete && serviceToDelete.fotos && serviceToDelete.fotos.length > 0) {
                console.log('Limpando fotos do storage...', serviceToDelete.fotos);
                
                // Extrair os caminhos dos arquivos das URLs públicas
                // URL padrão: https://.../storage/v1/object/public/empreendedores/arquivo.jpg
                const filePaths = serviceToDelete.fotos.map(url => {
                    const parts = url.split('/');
                    return parts[parts.length - 1];
                });

                const { error: storageError } = await supabase.storage
                    .from('empreendedores')
                    .remove(filePaths);

                if (storageError) {
                    console.warn('Erro ao remover fotos (prosseguindo com a exclusão do registro):', storageError);
                } else {
                    console.log('Fotos removidas com sucesso do storage.');
                }
            }

            // 2. Excluir o registro do banco
            const { error } = await supabase
                .from('empreendedores')
                .delete()
                .eq('id', deletingId);

            if (error) {
                console.error('Erro detalhado do Supabase ao excluir registro:', error);
                throw error;
            }

            toast.success('Anúncio e fotos removidos!', { id: toastId });
            setDeletingId(null);
            fetchServices();
        } catch (error) {
            console.error('Erro na função handleDelete:', error);
            toast.error(`Falha ao excluir: ${error.message || 'Erro desconhecido'}`, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const totalPhotos = (editingService.fotos.length - photosToRemove.length) + newPhotos.length + files.length;
        
        if (totalPhotos > 4) {
            toast.error('O limite máximo é de 4 fotos.');
            return;
        }

        setNewPhotos([...newPhotos, ...files]);
    };

    const removeExistingPhoto = (url) => {
        setPhotosToRemove([...photosToRemove, url]);
    };

    const removeNewPhoto = (index) => {
        const updated = [...newPhotos];
        updated.splice(index, 1);
        setNewPhotos(updated);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Salvando alterações...');

        try {
            let finalPhotos = editingService.fotos.filter(url => !photosToRemove.url?.includes(url));
            // Filter out by content since we might have issues with full URLs
            finalPhotos = editingService.fotos.filter(url => !photosToRemove.includes(url));

            // Upload new photos if any
            const uploadedUrls = [];
            for (let i = 0; i < newPhotos.length; i++) {
                const file = newPhotos[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('empreendedores')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('empreendedores')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            const { error } = await supabase
                .from('empreendedores')
                .update({
                    nome: editingService.nome,
                    unidade: editingService.unidade,
                    tipo_servico: editingService.tipo_servico,
                    descricao: editingService.descricao,
                    fotos: [...finalPhotos, ...uploadedUrls]
                })
                .eq('id', editingService.id);

            if (error) throw error;

            toast.success('Anúncio atualizado!', { id: toastId });
            setEditingService(null);
            setNewPhotos([]);
            setPhotosToRemove([]);
            fetchServices();
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            toast.error(`Erro ao atualizar: ${error.message}`, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredServices = services.filter(s => 
        s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tipo_servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.unidade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Stats & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, unidade ou tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
                    />
                </div>
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Store size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Total de Anúncios</p>
                            <p className="text-xl font-bold text-slate-900 leading-none">{services.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="text-primary animate-spin" size={32} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando catálogo...</p>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Morador/Serviço</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Unidade</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Categoria</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Data</th>
                                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                                    <img src={service.fotos[0]} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-900">{service.nome}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase">
                                                {service.unidade}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                                {service.tipo_servico}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-slate-400 font-medium">
                                            {new Date(service.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingService(service)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(service.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredServices.length === 0 && (
                        <div className="py-20 text-center">
                            <AlertCircle className="mx-auto text-slate-200 mb-4" size={40} />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum anúncio encontrado.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {editingService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isSaving && setEditingService(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Editar Anúncio</h3>
                                    <p className="text-xs font-medium text-slate-500">Modificando informações do morador.</p>
                                </div>
                                <button
                                    onClick={() => setEditingService(null)}
                                    disabled={isSaving}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="p-8 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Nome</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
                                            value={editingService.nome}
                                            onChange={(e) => setEditingService({...editingService, nome: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Unidade</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
                                            value={editingService.unidade}
                                            onChange={(e) => setEditingService({...editingService, unidade: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Categoria</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
                                        value={editingService.tipo_servico}
                                        onChange={(e) => setEditingService({...editingService, tipo_servico: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição</label>
                                        <span className="text-[10px] font-bold text-slate-400">{editingService.descricao.length}/500</span>
                                    </div>
                                    <textarea
                                        required
                                        maxLength={500}
                                        rows={4}
                                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm resize-none"
                                        value={editingService.descricao}
                                        onChange={(e) => setEditingService({...editingService, descricao: e.target.value})}
                                    />
                                </div>

                                {/* Manage Photos */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Gerenciar Fotos (Máx 4)</label>
                                    <div className="grid grid-cols-4 gap-4">
                                        {/* Current Photos */}
                                        {editingService.fotos.filter(url => !photosToRemove.includes(url)).map((url, idx) => (
                                            <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                                <img src={url} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingPhoto(url)}
                                                    className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        {/* New Photos Preview */}
                                        {newPhotos.map((file, idx) => (
                                            <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-primary/30 group">
                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewPhoto(idx)}
                                                    className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                                >
                                                    <X size={20} />
                                                </button>
                                                <div className="absolute bottom-1 right-1 bg-primary text-white text-[8px] px-1 rounded font-bold uppercase">Novo</div>
                                            </div>
                                        ))}

                                        {/* Add Button */}
                                        {(editingService.fotos.length - photosToRemove.length + newPhotos.length) < 4 && (
                                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all cursor-pointer bg-slate-50">
                                                <Plus size={20} />
                                                <span className="text-[8px] font-bold uppercase">Adicionar</span>
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

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Premium Delete Confirmation Modal */}
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
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Anúncio?</h3>
                            <p className="text-sm text-slate-500 mb-8 font-medium">
                                Esta ação não pode ser desfeita. O anúncio será removido permanentemente do catálogo.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
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

export default AdminEntrepreneurs;
