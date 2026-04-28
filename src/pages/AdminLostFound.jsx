import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { sendPushNotification } from '../services/pushService';
import { toast } from 'react-hot-toast';

function AdminLostFound() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [itemNome, setItemNome] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [notifying, setNotifying] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        const { data } = await supabase
            .from('achados_perdidos')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setItems(data);
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
            .from('achados_perdidos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('achados_perdidos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async function handleAdd(e) {
        e.preventDefault();
        setSaving(true);
        let notifyMessage = '';

        try {
            let publicUrl = null;
            if (imageFile) {
                publicUrl = await uploadImage(imageFile);
            }

            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('achados_perdidos').insert([{
                item: itemNome,
                imagem_url: publicUrl,
                registrado_por: user?.id
            }]);

            toast.success('Item registrado com sucesso!');
            setItemNome('');
            setImageFile(null);
            setImagePreview(null);
            fetchItems();
        } catch (err) {
            toast.error('Erro ao registrar item: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function toggleRetirado(id, currentStatus) {
        await supabase.from('achados_perdidos').update({ retirado: !currentStatus }).eq('id', id);
        fetchItems();
    }

    async function deleteItem(id, imageUrl) {
        toast((t) => (
            <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-slate-800">Deseja excluir este item?</p>
                <div className="flex gap-2">
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            if (imageUrl) {
                                const fileName = imageUrl.split('/').pop();
                                await supabase.storage.from('achados_perdidos').remove([fileName]);
                            }
                            await supabase.from('achados_perdidos').delete().eq('id', id);
                            fetchItems();
                            toast.success('Item excluído.');
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

    async function handleManualPush(item) {
        setNotifying(item.id);
        try {
            const pushResult = await sendPushNotification({
                title: item.item,
                body: 'Novo item nos Achados e Perdidos 📦',
                url: '/achados'
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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Achados e Perdidos</h1>
                    <p className="text-slate-500 text-sm">Gerencie o inventário de itens encontrados no condomínio.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <section className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-fit">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus size={20} className="text-primary" /> Novo Registro
                    </h2>
                    <form onSubmit={handleAdd} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Nome do Item</label>
                            <input
                                type="text" required value={itemNome} onChange={(e) => setItemNome(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder="Ex: Chave de carro"
                            />
                        </div>

                        {/* Camera/Upload Area */}
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Foto do Item</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative h-56 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                                            className="absolute top-2 right-2 bg-slate-900/50 text-white p-1.5 rounded-full"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Camera size={40} />
                                        <span className="text-xs font-bold font-display uppercase tracking-widest">Foto ou Galeria</span>
                                    </div>
                                )}
                                <input
                                    type="file" ref={fileInputRef} onChange={handleImageChange}
                                    accept="image/*" className="hidden"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={saving || !itemNome}
                            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-slate-800 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Registrar Item
                        </button>
                    </form>
                </section>

                <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div key={item.id} className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group relative transition-all ${item.retirado ? 'opacity-50 grayscale' : 'hover:shadow-md'}`}>
                            <button
                                onClick={() => deleteItem(item.id, item.imagem_url)}
                                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-slate-300 hover:text-secondary opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="h-48 bg-slate-50 flex items-center justify-center overflow-hidden">
                                {item.imagem_url ? (
                                    <img src={item.imagem_url} alt={item.item} className="w-full h-full object-cover" />
                                ) : (
                                    <Package size={56} className="text-slate-200" />
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.item}</h3>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => toggleRetirado(item.id, item.retirado)}
                                        className={`w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${item.retirado ? 'bg-slate-100 text-slate-400' : 'bg-highlight/10 text-highlight hover:bg-highlight/20 shadow-sm shadow-highlight/10'}`}
                                    >
                                        {item.retirado ? <><CheckCircle size={14} /> Entregue ao Morador</> : 'Marcar como Retirado'}
                                    </button>
                                    {!item.retirado && (
                                        <button
                                            onClick={() => handleManualPush(item)}
                                            disabled={notifying === item.id}
                                            className="w-full py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            {notifying === item.id ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                                            Notificar Moradores
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-full py-40 text-center bg-slate-100/30 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center gap-4">
                            <Search size={48} className="text-slate-200" />
                            <p className="text-slate-400 font-bold italic">Nenhum item em estoque.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default AdminLostFound;
