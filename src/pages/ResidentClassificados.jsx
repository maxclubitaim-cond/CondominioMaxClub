import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { compressImage } from '../utils/imageCompression';
import { Store, Plus, X, Loader2, Tag, Phone, Image as ImageIcon, Search, ArrowLeft, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function ResidentClassificados() {
    const { morador } = useAuth();
    const navigate = useNavigate();
    const [classificados, setClassificados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    
    // Form States
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [categoria, setCategoria] = useState('VENDA'); // VENDA, DOACAO, TROCA
    const [contato, setContato] = useState('');
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        if (morador?.unidade) {
            fetchMeusClassificados();
        }
    }, [morador]);

    async function fetchMeusClassificados() {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('morador_listar_meus_classificados', {
                p_unidade: morador.unidade
            });

            if (error) throw error;
            setClassificados(data || []);
        } catch (error) {
            console.error('Erro ao buscar classificados:', error);
            toast.error('Erro ao carregar seus anúncios.');
        } finally {
            setLoading(false);
        }
    }

    const handleAddClassificado = async (e) => {
        e.preventDefault();
        if (!titulo || !descricao || !contato) {
            toast.error('Preencha os campos obrigatórios.');
            return;
        }

        const precoNum = preco ? parseFloat(preco.replace(',', '.')) : 0;

        setIsSubmitting(true);
        let uploadedUrl = null;

        try {
            if (fotoFile) {
                const compressedFile = await compressImage(fotoFile);
                const fileExt = compressedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${morador.unidade}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('classificados')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('classificados')
                    .getPublicUrl(filePath);

                uploadedUrl = publicUrl;
            }

            const { error } = await supabase.rpc('morador_criar_classificado', {
                p_unidade: morador.unidade,
                p_titulo: titulo,
                p_descricao: descricao,
                p_preco: precoNum,
                p_categoria: categoria,
                p_contato: contato,
                p_imagem_url: uploadedUrl
            });

            if (error) throw error;

            toast.success('Anúncio publicado com sucesso!');
            setIsAddModalOpen(false);
            resetForm();
            fetchMeusClassificados();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao publicar anúncio.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAlterarStatus = async (id, novoStatus) => {
        try {
            const { error } = await supabase.rpc('morador_alterar_status_classificado', {
                p_unidade: morador.unidade,
                p_classificado_id: id,
                p_novo_status: novoStatus
            });

            if (error) throw error;
            toast.success(`Anúncio marcado como ${novoStatus}.`);
            fetchMeusClassificados();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao alterar status.');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const id = itemToDelete;

        // Encontra o anúncio para pegar a URL da foto
        const item = classificados.find(c => c.id === id);

        try {
            // Se tiver imagem, exclui do bucket
            if (item && item.imagem_url) {
                const pathParts = item.imagem_url.split('/classificados/');
                if (pathParts.length > 1) {
                    const filePath = pathParts[1];
                    await supabase.storage.from('classificados').remove([filePath]);
                }
            }

            const { error } = await supabase.rpc('morador_excluir_classificado', {
                p_unidade: morador.unidade,
                p_classificado_id: id
            });

            if (error) throw error;
            toast.success('Anúncio excluído.');
            fetchMeusClassificados();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao excluir anúncio.');
        } finally {
            setItemToDelete(null);
        }
    };

    const resetForm = () => {
        setTitulo('');
        setDescricao('');
        setPreco('');
        setCategoria('VENDA');
        setContato('');
        setFotoFile(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden pb-20">
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
                                Meus Classificados
                            </h1>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Unidade {morador?.unidade}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Novo Anúncio</span>
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="animate-spin text-primary w-8 h-8 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando seus anúncios...</p>
                    </div>
                ) : classificados.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classificados.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative group">
                                {item.status !== 'ATIVO' && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                        <div className="bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl shadow-xl uppercase tracking-widest text-xs rotate-[-15deg]">
                                            {item.status}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="h-48 bg-slate-50 relative overflow-hidden">
                                    {item.imagem_url ? (
                                        <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{item.categoria}</span>
                                    </div>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">{item.titulo}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{item.descricao}</p>
                                    
                                    <div className="flex items-end justify-between mt-auto mb-6">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Preço</p>
                                            <p className="font-black text-emerald-600 text-xl">
                                                {item.preco > 0 ? `R$ ${Number(item.preco).toFixed(2)}` : 'Grátis'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 relative z-20">
                                        {item.status === 'ATIVO' && (
                                            <button 
                                                onClick={() => handleAlterarStatus(item.id, 'VENDIDO')}
                                                className="flex-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-emerald-100 transition-colors"
                                            >
                                                Marcar Vendido
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setItemToDelete(item.id)}
                                            className="flex-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-rose-100 transition-colors"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center">
                        <Store className="mx-auto text-slate-200 w-16 h-16 mb-6" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Você ainda não anunciou nada</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Venda, doe ou troque itens com seus vizinhos de forma fácil e segura.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                        >
                            Criar meu primeiro anúncio
                        </button>
                    </div>
                )}
            </main>

            {/* Modal Novo Classificado */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 my-auto"
                        >
                            <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-[2rem]">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Novo Anúncio</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">O anúncio ficará visível para todo o condomínio.</p>
                                </div>
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddClassificado} className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="group/field col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria *</label>
                                        <select
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer"
                                        >
                                            <option value="VENDA">Venda</option>
                                            <option value="DOACAO">Doação</option>
                                            <option value="TROCA">Troca</option>
                                        </select>
                                    </div>
                                    <div className="group/field col-span-2 sm:col-span-1">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preço (R$) {categoria !== 'VENDA' && '(Opcional)'}</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={preco}
                                            onChange={(e) => setPreco(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold text-slate-900"
                                            placeholder="Ex: 150.00"
                                            required={categoria === 'VENDA'}
                                        />
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Título do Anúncio *</label>
                                    <input
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold text-slate-900"
                                        placeholder="O que você está anunciando?"
                                        required
                                    />
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descrição *</label>
                                    <textarea
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-medium text-slate-900 resize-none"
                                        placeholder="Detalhes, estado de conservação, motivo da venda..."
                                        required
                                    />
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Contato (WhatsApp/Celular) *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={contato}
                                            onChange={(e) => setContato(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all text-sm font-bold text-slate-900"
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="group/field">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Foto do Produto (Opcional)</label>
                                    <div className="relative">
                                        <div className="flex items-center justify-center w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                                    <p className="mb-1 text-sm font-bold text-slate-500">
                                                        {fotoFile ? fotoFile.name : "Clique para anexar foto"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">PNG, JPG, JPEG (máx. 5MB)</p>
                                                </div>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setFotoFile(e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">A foto será otimizada automaticamente para economizar espaço.</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Publicar Anúncio'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Confirmação Exclusão */}
            <AnimatePresence>
                {itemToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setItemToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-8">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="text-red-500 w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Excluir Anúncio</h3>
                                <p className="text-slate-500 text-center font-medium mb-8">
                                    Tem certeza que deseja excluir este anúncio permanentemente? Esta ação não poderá ser desfeita.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmDelete}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20"
                                    >
                                        Confirmar Exclusão
                                    </button>
                                    <button
                                        onClick={() => setItemToDelete(null)}
                                        className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-4 rounded-xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResidentClassificados;
