import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, CheckCircle, XCircle, ArrowLeft, Camera, Loader2, ListChecks, QrCode, RefreshCw, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { get, set, update, del } from 'idb-keyval';

// Key for offline records in IndexedDB
const OFFLINE_SYNC_KEY = 'ronda_offline_records';

function AdminRonda() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [locais, setLocais] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [offlineCount, setOfflineCount] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    // Scanner State
    const [scanning, setScanning] = useState(false);
    const scannerRef = useRef(null);

    // Form State
    const [selectedLocal, setSelectedLocal] = useState('');
    const [selectedLocalNome, setSelectedLocalNome] = useState('');
    const [statusOk, setStatusOk] = useState(null); // true = OK, false = Problema
    const [relato, setRelato] = useState('');
    const [foto, setFoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Monitor online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        fetchDados();
        checkOfflineRecords();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    // Auto sync when coming back online
    useEffect(() => {
        if (isOnline && offlineCount > 0 && !syncing) {
            syncOfflineRecords();
        }
    }, [isOnline, offlineCount]);

    async function checkOfflineRecords() {
        const records = await get(OFFLINE_SYNC_KEY);
        setOfflineCount(records ? records.length : 0);
    }

    async function fetchDados() {
        setLoading(true);
        try {
            // Se estiver online, busca dados do Supabase
            if (navigator.onLine) {
                const { data: locaisData } = await supabase
                    .from('locais_ronda')
                    .select('*')
                    .eq('ativo', true)
                    .order('ordem');
                
                if (locaisData) {
                    setLocais(locaisData);
                    // Cache locais offline
                    await set('ronda_locais_cache', locaisData);
                }

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
            } else {
                // Se offline, tenta pegar locais do cache
                const cachedLocais = await get('ronda_locais_cache');
                if (cachedLocais) setLocais(cachedLocais);
            }
        } catch (err) {
            console.error('Erro ao buscar dados', err);
        }
        setLoading(false);
    }

    // Convert File/Blob to Base64 for offline storage
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Convert Base64 back to Blob/File for Supabase upload
    const base64ToFile = (base64String, filename) => {
        const arr = base64String.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    };

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
        setSelectedLocalNome('');
        setStatusOk(null);
        setRelato('');
        setFoto(null);
        setPreview(null);
    };

    const startScanner = () => {
        setScanning(true);
        setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { 
                    fps: 10, 
                    qrbox: {width: 250, height: 250},
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                },
                /* verbose= */ false
            );
            
            scannerRef.current = scanner;

            scanner.render(
                (decodedText) => {
                    try {
                        const data = JSON.parse(decodedText);
                        if (data && data.t === 'ronda' && data.id) {
                            setSelectedLocal(data.id);
                            setSelectedLocalNome(data.nome || 'Local Identificado');
                            scanner.clear();
                            setScanning(false);
                            toast.success(`Local: ${data.nome}`);
                        } else {
                            toast.error('QR Code inválido para a Ronda.');
                        }
                    } catch (e) {
                        toast.error('Formato de QR Code desconhecido.');
                    }
                },
                (error) => {
                    // Ignore background scan errors
                }
            );
        }, 100);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
        }
        setScanning(false);
    };

    const saveOffline = async (record) => {
        try {
            await update(OFFLINE_SYNC_KEY, (val) => {
                const current = val || [];
                return [...current, record];
            });
            toast.success('Sem conexão! Registro salvo localmente para envio posterior.', { icon: '📶' });
            checkOfflineRecords();
        } catch (e) {
            console.error('Erro ao salvar offline', e);
            toast.error('Falha crítica ao salvar offline.');
        }
    };

    const syncOfflineRecords = async () => {
        if (syncing || !navigator.onLine) return;
        
        const records = await get(OFFLINE_SYNC_KEY);
        if (!records || records.length === 0) return;

        setSyncing(true);
        const toastId = toast.loading(`Sincronizando ${records.length} registros offline...`);
        let sucessos = 0;
        let pendingRecords = [...records];

        for (const record of records) {
            try {
                let foto_url = null;

                // 1. Upload photo if exists
                if (record.fotoBase64) {
                    const fileExt = 'jpeg'; // browser compression usually outputs jpeg
                    const fileName = `${record.operador_id}_${record.timestamp}.${fileExt}`;
                    const file = base64ToFile(record.fotoBase64, fileName);

                    const { error: uploadError } = await supabase.storage
                        .from('rondas')
                        .upload(fileName, file);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('rondas')
                            .getPublicUrl(fileName);
                        foto_url = publicUrl;
                    }
                }

                // 2. Insert record
                const { error: insertError } = await supabase
                    .from('ronda_registros')
                    .insert([{
                        local_ronda_id: record.local_ronda_id,
                        operador_id: record.operador_id,
                        status_ok: record.status_ok,
                        relato: record.relato,
                        foto_url: foto_url,
                        created_at: new Date(record.timestamp).toISOString() // Força a data original do scan
                    }]);

                if (!insertError) {
                    sucessos++;
                    // Remove current from pending
                    pendingRecords = pendingRecords.filter(r => r.timestamp !== record.timestamp);
                }

            } catch (err) {
                console.error('Erro ao sincronizar registro', err);
            }
        }

        // Update IDB with remaining (failed) records
        await set(OFFLINE_SYNC_KEY, pendingRecords);
        checkOfflineRecords();
        fetchDados();
        setSyncing(false);
        
        if (pendingRecords.length === 0) {
            toast.success(`Sincronização concluída! ${sucessos} enviados.`, { id: toastId });
        } else {
            toast.error(`Falha ao sincronizar alguns registros. Restam ${pendingRecords.length}.`, { id: toastId });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedLocal) return toast.error('Leia o QR Code do local primeiro.');
        if (statusOk === null) return toast.error('Marque o status do local (Tudo Certo ou Problema).');
        if (statusOk === false && !relato) return toast.error('Descreva o problema encontrado.');

        setSubmitting(true);
        const timestamp = Date.now();

        // MODO OFFLINE (Se não tem internet ou falha forçada)
        if (!navigator.onLine) {
            let fotoBase64 = null;
            if (foto) {
                fotoBase64 = await fileToBase64(foto);
            }
            
            const offlineRecord = {
                timestamp,
                local_ronda_id: selectedLocal,
                operador_id: user.id,
                status_ok: statusOk,
                relato: statusOk ? null : relato,
                fotoBase64
            };

            await saveOffline(offlineRecord);
            resetForm();
            setSubmitting(false);
            return;
        }

        // MODO ONLINE
        let foto_url = null;
        if (foto && statusOk === false) {
            const fileExt = foto.name.split('.').pop();
            const fileName = `${user.id}_${timestamp}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('rondas')
                .upload(filePath, foto);

            if (uploadError) {
                toast.error('Erro ao enviar foto. Salvando offline para tentar depois.');
                // Fallback para offline se upload falhar (ex: internet caiu no meio)
                let fotoBase64 = await fileToBase64(foto);
                await saveOffline({
                    timestamp, local_ronda_id: selectedLocal, operador_id: user.id,
                    status_ok: statusOk, relato: statusOk ? null : relato, fotoBase64
                });
                resetForm();
                setSubmitting(false);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('rondas')
                .getPublicUrl(filePath);
            foto_url = publicUrl;
        }

        const { error } = await supabase
            .from('ronda_registros')
            .insert([{
                local_ronda_id: selectedLocal,
                operador_id: user.id,
                status_ok: statusOk,
                relato: statusOk ? null : relato,
                foto_url,
                created_at: new Date(timestamp).toISOString()
            }]);

        if (error) {
            toast.error('Erro de conexão. Salvando offline.');
            let fotoBase64 = foto ? await fileToBase64(foto) : null;
            await saveOffline({
                timestamp, local_ronda_id: selectedLocal, operador_id: user.id,
                status_ok: statusOk, relato: statusOk ? null : relato, fotoBase64
            });
        } else {
            toast.success('Ponto registrado com sucesso!');
            fetchDados();
        }
        
        resetForm();
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
            <div className="max-w-2xl w-full">
                
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                    
                    {/* Botão de QR Codes apenas para Gestores/ADM */}
                    {(profile?.perfil === 'GESTOR' || profile?.perfil === 'ADM') && (
                        <button
                            onClick={() => navigate('/dashboard/ronda/qr-codes')}
                            className="flex items-center gap-2 bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-slate-300 transition-all"
                        >
                            <Printer size={14} /> Imprimir QRs
                        </button>
                    )}
                </div>

                {/* Banner Offline / Sync */}
                <AnimatePresence>
                    {!isOnline && (
                        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                            className="bg-orange-100 text-orange-800 p-3 rounded-xl mb-4 font-medium text-sm flex items-center justify-center gap-2"
                        >
                            ⚠️ Sem conexão com a internet. Modo Offline ativado.
                        </motion.div>
                    )}
                    {offlineCount > 0 && isOnline && (
                        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                            className="bg-primary text-white p-4 rounded-2xl mb-6 shadow-lg flex items-center justify-between"
                        >
                            <div>
                                <h4 className="font-bold">Sincronização Pendente</h4>
                                <p className="text-xs opacity-90">{offlineCount} registros aguardando envio.</p>
                            </div>
                            <button
                                onClick={syncOfflineRecords}
                                disabled={syncing}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all"
                            >
                                <RefreshCw className={syncing ? 'animate-spin' : ''} size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <ShieldAlert className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Ronda Predial</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Inspeção por QR Code</p>
                        </div>
                    </div>

                    {!selectedLocal ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            {!scanning ? (
                                <button
                                    onClick={startScanner}
                                    className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col items-center gap-3 hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
                                >
                                    <QrCode size={48} />
                                    <span className="font-bold text-lg">Ler QR Code do Local</span>
                                </button>
                            ) : (
                                <div className="w-full max-w-sm flex flex-col items-center">
                                    <div id="reader" className="w-full overflow-hidden rounded-3xl shadow-lg border-4 border-slate-200"></div>
                                    <button 
                                        onClick={stopScanner}
                                        className="mt-6 text-slate-500 font-bold hover:text-slate-700"
                                    >
                                        Cancelar Leitura
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Local Identificado</p>
                                    <h3 className="font-bold text-slate-800 text-lg">{selectedLocalNome}</h3>
                                </div>
                                <button type="button" onClick={resetForm} className="text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20">
                                    Trocar
                                </button>
                            </div>

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
                                disabled={submitting || statusOk === null}
                                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 disabled:bg-slate-300 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Registrar Ponto'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Histórico Recente (Apenas quando Online) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 opacity-90">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <ListChecks className="text-primary w-5 h-5" />
                            <h2 className="text-lg font-bold text-slate-800">Últimos Registros (Nuvem)</h2>
                        </div>
                    </div>
                    
                    {!navigator.onLine ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Disponível apenas online.</div>
                    ) : loading ? (
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
