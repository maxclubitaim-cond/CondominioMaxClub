import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Loader2, Save, Trash2, Calendar, Image as ImageIcon, X, Camera, Upload } from 'lucide-react';
import { sendPushNotification } from '../services/pushService';
import { formatDate } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';

function AdminAvisos() {
    const [avisos, setAvisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [notifying, setNotifying] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [dataFim, setDataFim] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAvisos();
    }, []);

    async function fetchAvisos() {
        const { data } = await supabase
            .from('avisos')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setAvisos(data);
        setLoading(false);
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    async function uploadImage(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avisos')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avisos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        let notifyMessage = '';

        try {
            let publicUrl = null;
            if (imageFile) {
                publicUrl = await uploadImage(imageFile);
            }

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('avisos')
                .insert([{
                    titulo,
                    descricao,
                    imagem_url: publicUrl,
                    data_fim: dataFim || null,
                    criado_por: user?.id
                }]);


            if (!error) {
                toast.success('Aviso criado com sucesso!');
                fetchAvisos();
                setTitulo('');
                setDescricao('');
                setImageFile(null);
                setImagePreview(null);
                setDataFim('');
            } else {
                toast.error('Erro ao salvar aviso: ' + error.message);
            }
        } catch (err) {
            toast.error('Erro no upload: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteAviso(id, imageUrl) {
        // Substituído o confirm() feio por uma verificação direta para o MVP, 
        // ou podemos usar o toast para confirmar. Vou usar o toast.
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-slate-900">Deseja excluir este aviso?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            // Deletar do storage se houver imagem
                            if (imageUrl) {
                                const fileName = imageUrl.split('/').pop();
                                await supabase.storage.from('avisos').remove([fileName]);
                            }
                            await supabase.from('avisos').delete().eq('id', id);
                            fetchAvisos();
                            toast.success('Aviso excluído.');
                        }}
                        className="bg-secondary text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Sim, excluir
                    </button>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    }

    async function handleManualPush(aviso) {
        setNotifying(aviso.id);
        try {
            const pushResult = await sendPushNotification({
                title: aviso.titulo,
                body: 'Aviso MaxClub Itaim 📢',
                url: '/'
            });

            if (pushResult.success) {
                toast.success(`Notificação enviada para ${pushResult.count} dispositivos!`);
            } else {
                toast.error('Erro ao enviar notificação: ' + pushResult.error);
            }
        } catch (err) {
            toast.error('Erro inesperado: ' + err.message);
        } finally {
            setNotifying(null);
        }
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <header>
                <h1 className="text-2xl font-bold text-slate-800">Painel de Avisos</h1>
                <p className="text-slate-500 text-sm font-medium">Gerencie o que os moradores visualizam na tela inicial.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form */}
                <section className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-primary" /> Criar Novo Aviso
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Título</label>
                            <input
                                type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Descrição (max 300)</label>
                            <textarea
                                required maxLength={300} value={descricao} onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" rows={3}
                            />
                        </div>

                        {/* Image Upload Area */}
                        <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Imagem do Aviso</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 bg-slate-900/50 text-white p-1.5 rounded-full hover:bg-slate-900"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Camera size={32} />
                                        <span className="text-xs font-bold">Câmera ou Galeria</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Data de Expiração (opcional)</label>
                            <input
                                type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            />
                        </div>

                        <button
                            type="submit" disabled={saving}
                            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-slate-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Publicar Aviso
                        </button>
                    </form>
                </section>

                {/* List */}
                <section className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 px-2">
                        <Bell size={20} className="text-slate-400" /> Avisos Ativos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {avisos.map(aviso => (
                            <div key={aviso.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden flex flex-col">
                                <button onClick={() => deleteAviso(aviso.id, aviso.imagem_url)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-slate-300 hover:text-secondary opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm border border-slate-100">
                                    <Trash2 size={16} />
                                </button>
                                {aviso.imagem_url && (
                                    <div className="h-40 overflow-hidden">
                                        <img src={aviso.imagem_url} alt={aviso.titulo} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="font-bold text-slate-800 mb-2">{aviso.titulo}</h3>
                                    <p className="text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed">{aviso.descricao}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-4">
                                        <div className="flex flex-col text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>{new Date(aviso.created_at).toLocaleDateString('pt-BR')}</span>
                                            {aviso.data_fim && <span className="text-secondary">Expira: {formatDate(aviso.data_fim)}</span>}
                                        </div>
                                        <button
                                            onClick={() => handleManualPush(aviso)}
                                            disabled={notifying === aviso.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {notifying === aviso.id ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                                            Disparar Push
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {avisos.length === 0 && (
                            <div className="col-span-full py-20 text-center bg-slate-100/30 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold italic">Nenhum aviso publicado.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminAvisos;
