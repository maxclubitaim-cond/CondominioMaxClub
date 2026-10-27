import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, History as HistoryIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAdvertencias } from '../hooks/useAdvertencias';
import AdvertenciaForm from '../components/advertencias/AdvertenciaForm';
import AdvertenciaConsulta from '../components/advertencias/AdvertenciaConsulta';
import AdvertenciaHistorico from '../components/advertencias/AdvertenciaHistorico';
import ImagePreviewModal from '../components/common/ImagePreviewModal';

export default function AdminAdvertencias() {
    const [activeTab, setActiveTab] = useState('registrar'); // 'registrar' | 'consultar' | 'historico'
    const [saving, setSaving] = useState(false);
    const [unidades, setUnidades] = useState([]);
    const [unidadeBusca, setUnidadeBusca] = useState('');
    const [registros, setRegistros] = useState([]);
    const [loadingHist, setLoadingHist] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    const {
        listarUnidades,
        registrarAdvertencia,
        buscarAdvertencias,
        excluirAdvertencia,
        exportarZip,
        listarHistorico,
        assinarEvidencias,
    } = useAdvertencias();

    const carregarUnidades = useCallback(() => {
        listarUnidades().then(setUnidades).catch((err) => console.error('Erro ao listar unidades:', err));
    }, [listarUnidades]);

    useEffect(() => {
        carregarUnidades();
    }, [carregarUnidades]);

    // O histórico é recarregado toda vez que a aba é aberta (sempre atualizado)
    const carregarHistorico = useCallback(async () => {
        setLoadingHist(true);
        try {
            setRegistros(await listarHistorico());
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
            toast.error(`Erro ao carregar o histórico: ${err?.message || 'verifique suas permissões'}`);
        } finally {
            setLoadingHist(false);
        }
    }, [listarHistorico]);

    useEffect(() => {
        if (activeTab === 'historico') carregarHistorico();
    }, [activeTab, carregarHistorico]);

    const handleRegistrar = async (dados, arquivos) => {
        setSaving(true);
        try {
            await registrarAdvertencia(dados, arquivos);
            toast.success('Advertência registrada com sucesso!');
            carregarUnidades();
            setUnidadeBusca(dados.unidade.trim()); // abre a consulta já filtrada na unidade
            setActiveTab('consultar');
            return true;
        } catch (err) {
            console.error('Erro detalhado:', err);
            toast.error(`Erro ao salvar: ${err?.message || 'verifique permissões e o bucket "advertencias-evidencias"'}`);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const abrirAba = (aba) => {
        if (aba === 'consultar') setUnidadeBusca(''); // abertura manual: sem busca automática
        setActiveTab(aba);
    };

    const tabCls = (aba) =>
        `flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === aba ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
        }`;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Advertências</h1>
                    <p className="text-slate-500 font-medium">Registro, consulta, histórico e exportação de infrações.</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
                    <button onClick={() => abrirAba('registrar')} className={tabCls('registrar')}>
                        <Plus size={18} />
                        Registrar
                    </button>
                    <button onClick={() => abrirAba('consultar')} className={tabCls('consultar')}>
                        <Search size={18} />
                        Consultar
                    </button>
                    <button onClick={() => abrirAba('historico')} className={tabCls('historico')}>
                        <HistoryIcon size={18} />
                        Histórico
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'registrar' && (
                    <AdvertenciaForm
                        key="registrar"
                        onSubmit={handleRegistrar}
                        saving={saving}
                        unidades={unidades}
                    />
                )}

                {activeTab === 'consultar' && (
                    <AdvertenciaConsulta
                        key="consultar"
                        initialUnidade={unidadeBusca}
                        unidades={unidades}
                        onBuscar={buscarAdvertencias}
                        onExportar={exportarZip}
                        onExcluir={async (id, justificativa) => {
                            await excluirAdvertencia(id, justificativa);
                            carregarUnidades();
                        }}
                        onImageClick={(url) => setSelectedImageUrl(url)}
                    />
                )}

                {activeTab === 'historico' && (
                    <motion.div
                        key="historico"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {loadingHist && registros.length === 0 ? (
                            <div className="p-20 text-center text-slate-400">Carregando histórico de advertências...</div>
                        ) : (
                            <AdvertenciaHistorico
                                registros={registros}
                                onExportar={exportarZip}
                                onCarregarEvidencias={assinarEvidencias}
                                onImageClick={(url) => setSelectedImageUrl(url)}
                            />
                        )}
                    </motion.div>
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
