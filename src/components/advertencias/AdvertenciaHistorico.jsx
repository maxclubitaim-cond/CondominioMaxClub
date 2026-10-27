import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Download, Loader2, Inbox, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { formatarData, textoMulta } from '../../hooks/useAdvertencias';

const ITEMS_PER_PAGE = 10;

const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2';

const normalizar = (s) =>
    String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function AdvertenciaHistorico({ registros = [], onExportar, onCarregarEvidencias, onImageClick }) {
    const [busca, setBusca] = useState('');
    const [filtro, setFiltro] = useState('todas'); // 'todas' | 'reincidentes' | 'primeira'
    const [de, setDe] = useState('');
    const [ate, setAte] = useState('');
    const [pagina, setPagina] = useState(1);
    const [abertoId, setAbertoId] = useState(null);
    const [urlsPorId, setUrlsPorId] = useState({});
    const [carregandoId, setCarregandoId] = useState(null);
    const [exportandoId, setExportandoId] = useState(null);

    const filtrados = useMemo(() => {
        const q = normalizar(busca);
        return registros.filter((r) => {
            if (q && !normalizar(r.unidade).includes(q)) return false;
            if (filtro === 'reincidentes' && !r.reincidente) return false;
            if (filtro === 'primeira' && r.reincidente) return false;
            if (de && r.data_infracao < de) return false;
            if (ate && r.data_infracao > ate) return false;
            return true;
        });
    }, [registros, busca, filtro, de, ate]);

    // ao mudar um filtro, volta para a página 1 e fecha o item aberto
    useEffect(() => {
        setPagina(1);
        setAbertoId(null);
    }, [busca, filtro, de, ate]);

    const stats = useMemo(() => ({
        total: filtrados.length,
        unidades: new Set(filtrados.map((r) => r.unidade)).size,
        reincidentes: filtrados.filter((r) => r.reincidente).length,
        multas: filtrados.filter((r) => r.levou_multa === true).length,
    }), [filtrados]);

    const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
    const paginaAtual = Math.min(pagina, totalPaginas);
    const visiveis = filtrados.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);
    const temFiltro = busca || filtro !== 'todas' || de || ate;

    const limparFiltros = () => { setBusca(''); setFiltro('todas'); setDe(''); setAte(''); };

    const alternar = async (adv) => {
        if (abertoId === adv.id) { setAbertoId(null); return; }
        setAbertoId(adv.id);
        const paths = adv.evidencias || [];
        if (paths.length && !urlsPorId[adv.id]) {
            setCarregandoId(adv.id);
            try {
                const urls = await onCarregarEvidencias(paths);
                setUrlsPorId((atual) => ({ ...atual, [adv.id]: urls }));
            } catch (err) {
                console.error('Erro ao carregar evidências:', err);
                toast.error('Erro ao carregar as evidências.');
            } finally {
                setCarregandoId(null);
            }
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Estatísticas (refletem os filtros aplicados) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    ['Advertências', stats.total],
                    ['Unidades', stats.unidades],
                    ['Reincidentes', stats.reincidentes],
                    ['Com multa', stats.multas],
                ].map(([rotulo, valor]) => (
                    <div key={rotulo} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{rotulo}</p>
                        <p className="text-2xl font-extrabold text-slate-800">{valor}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className={labelCls} htmlFor="hist-busca">Unidade</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="hist-busca" className={`${inputCls} pl-11`} placeholder="Buscar por unidade…"
                                autoComplete="off" value={busca} onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="hist-de">De</label>
                        <input id="hist-de" type="date" className={inputCls} value={de} onChange={(e) => setDe(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="hist-ate">Até</label>
                        <input id="hist-ate" type="date" className={inputCls} value={ate} onChange={(e) => setAte(e.target.value)} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[['todas', 'Todas'], ['reincidentes', 'Reincidentes'], ['primeira', 'Primeira ocorrência']].map(([valor, rotulo]) => (
                            <button
                                key={valor} type="button" onClick={() => setFiltro(valor)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition ${filtro === valor ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {rotulo}
                            </button>
                        ))}
                    </div>
                    {temFiltro && (
                        <button type="button" onClick={limparFiltros}
                            className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-500 transition">
                            <X size={16} /> Limpar filtros
                        </button>
                    )}
                </div>
            </section>

            {/* Lista */}
            {filtrados.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                    <Inbox size={40} className="mx-auto mb-3 opacity-60" />
                    <p className="font-bold text-slate-600">
                        {registros.length === 0 ? 'Nenhuma advertência registrada ainda' : 'Nenhum resultado para os filtros'}
                    </p>
                </div>
            ) : (
                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                    {visiveis.map((adv) => {
                        const aberto = abertoId === adv.id;
                        const [ano, mes, dia] = adv.data_infracao.split('-');
                        const qtdFotos = (adv.evidencias || []).length;
                        const urls = urlsPorId[adv.id] || [];

                        return (
                            <div key={adv.id}>
                                <button
                                    type="button" onClick={() => alternar(adv)} aria-expanded={aberto}
                                    className="w-full flex items-center gap-4 p-4 md:p-5 text-left hover:bg-slate-50 transition"
                                >
                                    <div className="shrink-0 w-14 text-center rounded-2xl bg-slate-100 py-2">
                                        <div className="text-lg font-extrabold text-slate-800 leading-none">{dia}</div>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1">{mes}/{ano}</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-slate-800">{adv.unidade}</span>
                                            {adv.reincidente && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">Reincidente</span>
                                            )}
                                            {adv.levou_multa === true && (
                                                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-bold">Multa</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">{adv.infracao}</p>
                                    </div>
                                    <div className="hidden sm:block text-right text-xs text-slate-400 shrink-0">
                                        <div className="font-bold text-slate-500">{adv.hora_infracao.slice(0, 5)}</div>
                                        <div>{qtdFotos} {qtdFotos === 1 ? 'foto' : 'fotos'}</div>
                                    </div>
                                    <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {aberto && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden bg-slate-50/60"
                                        >
                                            <div className="px-4 md:px-5 pb-5 pt-1 space-y-5">
                                                <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {[
                                                        ['Data', formatarData(adv.data_infracao)],
                                                        ['Hora', adv.hora_infracao.slice(0, 5)],
                                                        ['Regimento Interno', adv.regimento_interno || '—'],
                                                        ...(adv.reincidente ? [['Levou multa', textoMulta(adv), adv.levou_multa === true]] : []),
                                                    ].map(([rotulo, valor, destaque]) => (
                                                        <div key={rotulo} className="rounded-2xl bg-white border border-slate-100 px-4 py-3">
                                                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{rotulo}</dt>
                                                            <dd className={`font-bold ${destaque ? 'text-red-600' : 'text-slate-800'}`}>{valor}</dd>
                                                        </div>
                                                    ))}
                                                </dl>

                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Infração</h4>
                                                    <p className="whitespace-pre-wrap text-slate-700">{adv.infracao}</p>
                                                </div>

                                                {adv.obs && (
                                                    <div>
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Observação</h4>
                                                        <p className="whitespace-pre-wrap text-slate-700">{adv.obs}</p>
                                                    </div>
                                                )}

                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                        Evidências ({qtdFotos})
                                                    </h4>
                                                    {qtdFotos === 0 ? (
                                                        <p className="text-sm text-slate-400">Nenhuma evidência anexada.</p>
                                                    ) : carregandoId === adv.id ? (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <Loader2 size={16} className="animate-spin" /> Carregando fotos…
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                            {urls.map((url, i) => (
                                                                <button
                                                                    key={url} type="button" onClick={() => onImageClick?.(url)}
                                                                    className="aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:ring-4 hover:ring-amber-500/20 transition"
                                                                >
                                                                    <img src={url} alt={`Evidência ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    type="button" onClick={() => exportar(adv)} disabled={exportandoId === adv.id}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition disabled:opacity-60 disabled:pointer-events-none"
                                                >
                                                    {exportandoId === adv.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                                    {exportandoId === adv.id ? 'Gerando ZIP…' : 'Exportar (ZIP)'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* Paginação */}
            {filtrados.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                        Página {paginaAtual} de {totalPaginas}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button" onClick={() => setPagina(paginaAtual - 1)} disabled={paginaAtual === 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronLeft size={16} /> Anterior
                        </button>
                        <button
                            type="button" onClick={() => setPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Próxima <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
