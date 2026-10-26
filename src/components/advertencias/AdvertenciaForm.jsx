import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, X, Save, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MAX_FOTOS = 10;

const inputCls =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10';
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2';

const agora = () => {
    const n = new Date();
    const p = (x) => String(x).padStart(2, '0');
    return {
        data: `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`,
        hora: `${p(n.getHours())}:${p(n.getMinutes())}`,
    };
};

export default function AdvertenciaForm({ onSubmit, saving, unidades = [] }) {
    const inicial = agora();
    const [unidade, setUnidade] = useState('');
    const [data, setData] = useState(inicial.data);
    const [hora, setHora] = useState(inicial.hora);
    const [infracao, setInfracao] = useState('');
    const [regimento, setRegimento] = useState('');
    const [reincidente, setReincidente] = useState(false);
    const [levouMulta, setLevouMulta] = useState(null); // null = ainda não respondeu
    const [obs, setObs] = useState('');
    const [fotos, setFotos] = useState([]); // [{ file, preview }]
    const [arrastando, setArrastando] = useState(false);

    const galeriaRef = useRef(null);
    const cameraRef = useRef(null);
    const fotosRef = useRef(fotos);
    fotosRef.current = fotos;

    // libera as URLs de preview ao desmontar
    useEffect(() => () => fotosRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

    const adicionarArquivos = (lista) => {
        const imagens = [...lista].filter((f) => f.type.startsWith('image/'));
        if (!imagens.length) return toast.error('Selecione arquivos de imagem.');
        setFotos((atual) => {
            const livres = MAX_FOTOS - atual.length;
            if (imagens.length > livres) toast.error(`Limite de ${MAX_FOTOS} imagens.`);
            const novas = imagens.slice(0, Math.max(livres, 0)).map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));
            return [...atual, ...novas];
        });
    };

    const removerFoto = (i) =>
        setFotos((atual) => {
            URL.revokeObjectURL(atual[i].preview);
            return atual.filter((_, idx) => idx !== i);
        });

    const limpar = () => {
        const a = agora();
        fotos.forEach((f) => URL.revokeObjectURL(f.preview));
        setUnidade(''); setData(a.data); setHora(a.hora);
        setInfracao(''); setRegimento('');
        setReincidente(false); setLevouMulta(null); setObs(''); setFotos([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!unidade.trim() || !data || !hora || !infracao.trim() || !regimento.trim()) {
            return toast.error('Preencha todos os campos obrigatórios.');
        }
        if (!fotos.length) return toast.error('Anexe ao menos uma evidência.');
        if (reincidente && levouMulta === null) return toast.error('Informe se levou multa ou não.');

        const ok = await onSubmit(
            { unidade, data, hora, infracao, regimento, reincidente, levouMulta: reincidente ? levouMulta : null, obs: reincidente ? obs.trim() : '' },
            fotos.map((f) => f.file)
        );
        if (ok) limpar();
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Dados da infração */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-5">
                <h2 className="text-lg font-bold text-slate-800">Dados da infração</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <label className={labelCls} htmlFor="adv-unidade">Unidade</label>
                        <input
                            id="adv-unidade" list="adv-unidades" className={inputCls}
                            placeholder="Ex.: Bloco A - 101" autoComplete="off"
                            value={unidade} onChange={(e) => setUnidade(e.target.value)}
                        />
                        <datalist id="adv-unidades">
                            {unidades.map((u) => <option key={u} value={u} />)}
                        </datalist>
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="adv-data">Data</label>
                        <input id="adv-data" type="date" className={inputCls} value={data} onChange={(e) => setData(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls} htmlFor="adv-hora">Hora</label>
                        <input id="adv-hora" type="time" className={inputCls} value={hora} onChange={(e) => setHora(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={labelCls} htmlFor="adv-infracao">Infração</label>
                    <textarea
                        id="adv-infracao" rows={4} className={`${inputCls} resize-y`}
                        placeholder="Descreva o que aconteceu…"
                        value={infracao} onChange={(e) => setInfracao(e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelCls} htmlFor="adv-regimento">Regimento Interno</label>
                    <input
                        id="adv-regimento" className={inputCls} placeholder="Ex.: Art. 15, inciso III"
                        value={regimento} onChange={(e) => setRegimento(e.target.value)}
                    />
                </div>
            </section>

            {/* Evidência */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Evidência</h2>
                    <p className="text-sm text-slate-500">Fotos da infração (até {MAX_FOTOS}). Elas são reduzidas automaticamente.</p>
                </div>

                <div
                    onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
                    onDragLeave={() => setArrastando(false)}
                    onDrop={(e) => { e.preventDefault(); setArrastando(false); adicionarArquivos(e.dataTransfer.files); }}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${arrastando ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}
                >
                    <p className="text-sm text-slate-500 mb-4">Arraste as imagens aqui ou use os botões</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button type="button" onClick={() => galeriaRef.current?.click()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition">
                            <ImageIcon size={18} /> Escolher fotos
                        </button>
                        <button type="button" onClick={() => cameraRef.current?.click()}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-100 transition">
                            <Camera size={18} /> Tirar foto
                        </button>
                    </div>
                    <input ref={galeriaRef} type="file" accept="image/*" multiple hidden
                        onChange={(e) => { adicionarArquivos(e.target.files); e.target.value = ''; }} />
                    <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
                        onChange={(e) => { adicionarArquivos(e.target.files); e.target.value = ''; }} />
                </div>

                {fotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {fotos.map((f, i) => (
                            <div key={f.preview} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200">
                                <img src={f.preview} alt={`Evidência ${i + 1}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removerFoto(i)} aria-label="Remover foto"
                                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white grid place-items-center hover:bg-black/80">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Reincidente + Multa */}
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Reincidente</h2>
                        <p className="text-sm text-slate-500">Ative se a unidade já foi advertida pela mesma infração.</p>
                    </div>
                    <button
                        type="button" role="switch" aria-checked={reincidente}
                        onClick={() => setReincidente((v) => !v)}
                        className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${reincidente ? 'bg-red-500' : 'bg-slate-200'}`}
                    >
                        <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${reincidente ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {reincidente && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-5 p-5 rounded-2xl bg-red-50 border border-red-100 space-y-5">
                                <div>
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 mb-3">
                                        <AlertTriangle size={14} /> Levou multa?
                                    </span>
                                    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Levou multa?">
                                        {[[true, 'Sim'], [false, 'Não']].map(([valor, rotulo]) => (
                                            <button
                                                key={rotulo} type="button" role="radio" aria-checked={levouMulta === valor}
                                                onClick={() => setLevouMulta(valor)}
                                                className={`py-3 rounded-xl font-bold border transition ${
                                                    levouMulta === valor
                                                        ? (valor ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 border-slate-800 text-white')
                                                        : 'bg-white border-red-100 text-slate-500 hover:bg-red-50'
                                                }`}
                                            >
                                                {rotulo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-red-500 mb-2" htmlFor="adv-obs">
                                        OBS <span className="normal-case tracking-normal font-medium text-slate-400">(opcional)</span>
                                    </label>
                                    <textarea
                                        id="adv-obs" rows={3}
                                        className="w-full bg-white border border-red-100 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 resize-y"
                                        placeholder="Observações, se houver…"
                                        value={obs} onChange={(e) => setObs(e.target.value)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <button
                type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 text-white font-bold text-base shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition disabled:opacity-60 disabled:pointer-events-none"
            >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {saving ? 'Salvando…' : 'Salvar advertência'}
            </button>
        </motion.form>
    );
}
