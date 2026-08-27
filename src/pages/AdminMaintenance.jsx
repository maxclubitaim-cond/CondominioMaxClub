import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, History, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceForm from '../components/maintenance/MaintenanceForm';
import MaintenanceHistory from '../components/maintenance/MaintenanceHistory';
import ImagePreviewModal from '../components/common/ImagePreviewModal';

export default function AdminMaintenance() {
    const [activeTab, setActiveTab] = useState('novo'); // 'novo' ou 'historico'
    const [message, setMessage] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [saving, setSaving] = useState(false);
    
    const ITEMS_PER_PAGE = 10;
    const { areas, registros, estoqueItens, loading, registerMaintenance, reload } = useMaintenance();

    const handleFormSubmit = async (payload) => {
        setSaving(true);
        try {
            await registerMaintenance(payload);
            toast.success('Manutenção registrada com sucesso!');
            setMessage('Registro concluído com sucesso!');
            setTimeout(() => {
                setMessage('');
                setActiveTab('historico');
            }, 2000);
        } catch (err) {
            console.error('Erro detalhado:', err);
            toast.error('Erro ao salvar: ' + (err.message || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };

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
                    <MaintenanceForm 
                        areas={areas} 
                        estoqueItens={estoqueItens} 
                        onSubmit={handleFormSubmit}
                        saving={saving}
                    />
                ) : (
                    <MaintenanceHistory 
                        registros={registros} 
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                        onImageClick={(url) => setSelectedImageUrl(url)}
                    />
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {selectedImageUrl && (
                    <ImagePreviewModal url={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
