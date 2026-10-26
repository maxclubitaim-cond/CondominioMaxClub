import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAdvertencias } from '../hooks/useAdvertencias';
import AdvertenciaForm from '../components/advertencias/AdvertenciaForm';
import AdvertenciaConsulta from '../components/advertencias/AdvertenciaConsulta';
import ImagePreviewModal from '../components/common/ImagePreviewModal';

export default function AdminAdvertencias() {
    const [activeTab, setActiveTab] = useState('registrar'); // 'registrar' ou 'consultar'
    const [saving, setSaving] = useState(false);
    const [unidades, setUnidades] = useState([]);
    const [unidadeBusca, setUnidadeBusca] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);

    const {
        listarUnidades,
        registrarAdvertencia,
        buscarAdvertencias,
        excluirAdvertencia,
        exportarZip,
    } = useAdvertencias();

    const carregarUnidades = useCallback(() => {
        listarUnidades().then(setUnidades).catch((err) => console.error('Erro ao listar unidades:', err));
    }, [listarUnidades]);

    useEffect(() => {
        carregarUnidades();
    }, [carregarUnidades]);

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
            toast.error('Erro ao salvar. Verifique suas permissões e se o bucket "advertencias-evidencias" existe.');
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
        `flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === aba ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
        }`;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Advertências</h1>
                    <p className="text-slate-500 font-medium">Registro, consulta e exportação de infrações.</p>
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
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === 'registrar' ? (
                    <AdvertenciaForm
                        key="registrar"
                        onSubmit={handleRegistrar}
                        saving={saving}
                        unidades={unidades}
                    />
                ) : (
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
            </AnimatePresence>

            <AnimatePresence>
                {selectedImageUrl && (
                    <ImagePreviewModal url={selectedImageUrl} onClose={() => setSelectedImageUrl(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
