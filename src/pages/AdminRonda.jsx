import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, XCircle, ArrowLeft, Camera, Loader2, ListChecks, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

function AdminRonda() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [locais, setLocais] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedLocal, setSelectedLocal] = useState('');
    const [statusOk, setStatusOk] = useState(null); // true = OK, false = Problema
    const [relato, setRelato] = useState('');
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDados();
    }, []);

    async function fetchDados() {
        setLoading(true);
        // Buscar locais
        const { data: locaisData } = await supabase
            .from('locais_ronda')
            .select('*')
            .eq('ativo', true)
            .order('ordem');
        
        if (locaisData) setLocais(locaisData);

        // Buscar histórico recente (últimos 10)
        const { data: registrosData } = await supabase
            .from('ronda_registros')
            .select(`
                *,
                locais_ronda (nome),
                perfis (nome)
            `)
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (registrosData) setRegistros(registrosData);
        setLoading(false);
    }

    const handleFotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                initialQuality: 0.7,
            };
            const compressedFile = await imageCompression(file, options);
            setFoto(compressedFile);
            setPreview(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error('Erro ao comprimir imagem', error);
            toast.error('Erro ao processar imagem.');
        }
    };

    const resetForm = () => {
        setSelectedLocal('');
        setStatusOk(null);
        setRelato('');
        setFoto(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLocal) return toast.error('Selecione um local.');
        if (statusOk === null) return toast.error('Marque o status do local (Tudo Certo ou Problema).');
        if (statusOk === false && !relato) return toast.error('Descreva o problema encontrado.');

        setSubmitting(true);
        let foto_url = null;

        // Upload da foto se houver
        if (foto && statusOk === false) {
            const fileExt = foto.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('rondas')
                .upload(filePath, foto);

            if (uploadError) {
                toast.error('Erro ao enviar foto. ' + uploadError.message);
                setSubmitting(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('rondas')
                .getPublicUrl(filePath);

            foto_url = publicUrl;
        }

        // Inserir registro
        const { error } = await supabase
            .from('ronda_registros')
            .insert([{
                local_ronda_id: selectedLocal,
                operador_id: user.id,
                status_ok: statusOk,
                relato: statusOk ? null : relato,
                foto_url
            }]);

        if (error) {
            toast.error('Erro ao registrar ponto: ' + error.message);
        } else {
            toast.success('Ponto registrado com sucesso!');
            resetForm();
            fetchDados();
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
            <div className="max-w-2xl w-full">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                >
                    <ArrowLeft size={16} /> Voltar ao Painel
                </button>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <ShieldAlert className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Ronda Predial</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Inspeção de Áreas</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Ponto de Verificação</label>
                            <select
                                value={selectedLocal}
                                onChange={(e) => setSelectedLocal(e.target.value)}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                disabled={submitting || loading}
                            >
                                <option value="">Selecione onde você está...</option>
                                {locais.map(l => (
                                    <option key={l.id} value={l.id}>{l.ordem}. {l.nome}</option>
                                ))}
                            </select>
                        </div>

                        {selectedLocal && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <label className="block text-sm font-bold text-slate-700 mb-2">Situação do Local</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStatusOk(true)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                            statusOk === true 
                                            ? 'border-green-500 bg-green-50 text-green-700' 
                                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                        }`}
                                    >
                                        <CheckCircle size={32} className="mb-2" />
                                        <span className="font-bold">Tudo Certo</span>
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setStatusOk(false)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                            statusOk === false 
                                            ? 'border-red-500 bg-red-50 text-red-700' 
                                            : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                        }`}
                                    >
                                        <XCircle size={32} className="mb-2" />
                                        <span className="font-bold">Problema</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {statusOk === false && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4 bg-red-50/50 p-4 rounded-2xl border border-red-100"
                                >
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Relato do Problema</label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={relato}
                                            onChange={(e) => setRelato(e.target.value)}
                                            placeholder="Descreva o que foi encontrado de errado..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Foto da Evidência (Opcional)</label>
                                        
                                        {!preview ? (
                                            <label className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-primary transition-all bg-white">
                                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                                <span className="text-sm font-medium text-slate-500">Tirar foto ou anexar imagem</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={handleFotoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-2xl overflow-hidden bg-slate-100">
                                                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => { setFoto(null); setPreview(null); }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-all"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={submitting || loading || !selectedLocal || statusOk === null}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 disabled:bg-slate-300 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : 'Registrar Ponto'}
                        </button>
                    </form>
                </div>

                {/* Histórico Recente */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <ListChecks className="text-primary w-5 h-5" />
                            <h2 className="text-lg font-bold text-slate-800">Últimos Registros</h2>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : registros.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-sm">Nenhuma ronda registrada ainda.</div>
                    ) : (
                        <div className="space-y-4">
                            {registros.map(r => (
                                <div key={r.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                    <div className="mt-1">
                                        {r.status_ok ? (
                                            <CheckCircle className="text-green-500 w-6 h-6" />
                                        ) : (
                                            <XCircle className="text-red-500 w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-slate-800">{r.locais_ronda?.nome}</h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-2">Por: {r.perfis?.nome}</div>
                                        
                                        {!r.status_ok && r.relato && (
                                            <div className="bg-white p-3 rounded-xl border border-red-100 text-sm text-slate-700 mt-2">
                                                {r.relato}
                                            </div>
                                        )}
                                        {r.foto_url && (
                                            <a href={r.foto_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-bold text-primary hover:underline">
                                                Ver foto anexada
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminRonda;
