import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Trash2, Loader2, AlertTriangle, Inbox, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { formatarData, formatarMulta } from '../../hooks/useAdvertencias';

const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10';

export default function AdvertenciaConsulta({
    initialUnidade = '',
    unidades = [],
    onBuscar,
    onExportar,
    onExcluir,
    onImageClick,
}) {
    const [termo, setTermo] = useState(initialUnidade);
    const [resultados, setResultados] = useState(null); // null = ainda não buscou
    const [buscando, setBuscando] = useState(false);
    const [exportandoId, setExportandoId] = useState(null);
    const [excluirId, setExcluirId] = useState(null); // card com a área de exclusão aberta
    const [justificativa, setJustificativa] = useState('');
    const [excluindo, setExcluindo] = useState(false);

    const buscar = async (t = termo) => {
        if (!t.trim()) return toast.error('Informe a unidade para buscar.');
        setBuscando(true);
        setExcluirId(null);
        try {
            setResultados(await onBuscar(t));
        } catch (err) {
            console.error('Erro ao buscar:', err);
            toast.error('Erro ao buscar advertências.');
        } finally {
            setBuscando(false);
        }
    };

    // Vindo do registro: já busca a unidade recém-cadastrada
    useEffect(() => {
        if (initialUnidade) buscar(initialUnidade);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const exportar = async (adv) => {
        setExportandoId(adv.id);
        try {
            await onExportar(adv);
            toast.success('Download iniciado.');
        } catch (err) {
            console.error('Erro ao exportar:', err);
            toast.error('Erro ao gerar o ZIP.');
        } finally {
            setExportandoId(null);
        }
    };

    const abrirExclusao = (id) => {
        setExcluirId((atual) => (atual === id ? null : id));
        setJustificativa('');
    };

    const confirmarExclusao = async (adv) => {
        if (justificativa.trim().length < 5) {
            return toast.error('Informe a justificativa da exclusão (mín. 5 caracteres).');
        }
        setExcluindo(true);
        try {
            await onExcluir(adv.id, justificativa.trim());
            toast.success('Advertência excluída.');
            setResultados((prev) => prev.filter((r) => r.id !== adv.id));
            setExcluirId(null);
            setJustificativa('');
        } catch (err) {
            console.error('Erro ao excluir:', err);
            toast.error(err?.message || 'Erro ao excluir a advertência.');
        } finally {
            setExcluindo(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Busca */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <h2 className="text-lg font-bold text-slate-800">Consultar advertência</h2>
                <p className="text-sm text-slate-500 mb-5">Digite a unidade para ver as infrações registradas.</p>
                <form
                    onSubmit={(e) => { e.preventDefault(); buscar(); }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <input
                        list="adv-unidades-busca" className={inputCls} placeholder="Unidade (ex.: Bloco A - 101)"
                        autoComplete="off" value={termo} onChange={(e) => setTermo(e.target.value)}
                    />
                    <datalist id="adv-unidades-busca">
                        {unidades.map((u) => <option key={u} value={u} />)}
                    </datalist>
                    <button
                        type="submit" disabled={buscando}
                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition disabled:opacity-60 disabled:pointer-events-none"
                    >
                        {buscando ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        Buscar
                    </button>
                </form>
            </section>

            {/* Estados */}
            {buscando && (
                <div className="space-y-4">
                    {[1, 2].map((n) => <div key={n} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />)}
                </div>
            )}

            {!buscando && resultados && resultados.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                    <Inbox size={40} className="mx-auto mb-3 opacity-60" />
                    <p className="font-bold text-slate-600">Nenhuma advertência encontrada</p>
                    <p className="text-sm">Não há registros para “{termo}”.</p>
                </div>
            )}

            {/* Resultados */}
            {!buscando && resultados && resultados.length > 0 && (
                <>
                    <p className="text-sm font-medium text-slate-500 px-1">
                        {resultados.length} {resultados.length > 1 ? 'advertências encontradas' : 'advertência encontrada'}
                    </p>

                    <AnimatePresence>
                        {resultados.map((adv) => (
                            <motion.article
                                key={adv.id} layout
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                {/* Cabeçalho */}
                                <header className="flex flex-wrap items-center justify-between gap-3 px-6 md:px-8 py-5 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-800">{adv.unidade}</h3>
                                        <p className="text-xs text-slate-400">{adv.id}</p>
                                    </div>
                                    {adv.reincidente ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                                            <AlertTriangle size={14} /> Reincidente
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                                            Primeira ocorrência
                                        </span>
                                    )}
                                </header>

                                <div className="px-6 md:px-8 py-6 space-y-6">
                                    {/* Metadados */}
                                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            ['Data', formatarData(adv.data_infracao)],
                                            ['Hora', adv.hora_infracao.slice(0, 5)],
                                            ['Regimento Interno', adv.regimento],
                                            ...(adv.reincidente ? [['Multa', formatarMulta(adv.multa), true]] : []),
                                        ].map(([rotulo, valor, destaque]) => (
                                            <div key={rotulo} className="rounded-2xl bg-slate-50 px-4 py-3">
                                                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{rotulo}</dt>
                                                <dd className={`font-bold ${destaque ? 'text-red-600' : 'text-slate-800'}`}>{valor}</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {/* Infração */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Infração</h4>
                                        <p className="whitespace-pre-wrap text-slate-700">{adv.infracao}</p>
                                    </div>

                                    {/* Evidências */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Evidências ({adv.evidencias.length})
                                        </h4>
                                        {adv.urls.length > 0 ? (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                {adv.urls.map((url, i) => (
                                                    <button
                                                        key={url} type="button" onClick={() => onImageClick?.(url)}
                                                        className="aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:ring-4 hover:ring-amber-500/20 transition"
                                                    >
                                                        <img src={url} alt={`Evidência ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">Nenhuma evidência disponível.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Ações */}
                                <footer className="px-6 md:px-8 py-5 bg-slate-50/70 border-t border-slate-100">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            type="button" onClick={() => exportar(adv)} disabled={exportandoId === adv.id}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition disabled:opacity-60 disabled:pointer-events-none"
                                        >
                                            {exportandoId === adv.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                            {exportandoId === adv.id ? 'Gerando ZIP…' : 'Exportar (ZIP)'}
                                        </button>
                                        <button
                                            type="button" onClick={() => abrirExclusao(adv.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition"
                                        >
                                            <Trash2 size={18} /> Excluir
                                        </button>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {excluirId === adv.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 p-5 rounded-2xl bg-red-50 border border-red-100">
                                                    <label className="block text-xs font-bold uppercase tracking-wider text-red-500 mb-2" htmlFor={`just-${adv.id}`}>
                                                        Justificativa da exclusão
                                                    </label>
                                                    <textarea
                                                        id={`just-${adv.id}`} rows={3} autoFocus
                                                        className="w-full bg-white border border-red-100 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 resize-y"
                                                        placeholder="Explique o motivo da exclusão…"
                                                        value={justificativa} onChange={(e) => setJustificativa(e.target.value)}
                                                    />
                                                    <p className="text-xs text-red-400 mt-2">
                                                        A advertência sai da lista, mas uma cópia fica registrada com esta justificativa.
                                                    </p>
                                                    <div className="flex justify-end gap-3 mt-4">
                                                        <button
                                                            type="button" onClick={() => abrirExclusao(adv.id)} disabled={excluindo}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition"
                                                        >
                                                            <X size={16} /> Cancelar
                                                        </button>
                                                        <button
                                                            type="button" onClick={() => confirmarExclusao(adv)} disabled={excluindo}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition disabled:opacity-60 disabled:pointer-events-none"
                                                        >
                                                            {excluindo ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                            Confirmar exclusão
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </footer>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                </>
            )}
        </motion.div>
    );
}
