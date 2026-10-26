import { useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import { supabase } from '../lib/supabase'; // ⚠️ confirme este caminho olhando o topo do usePoolCleaning.js

const BUCKET = 'advertencias-evidencias';
const pad2 = (n) => String(n).padStart(2, '0');

export const formatarData = (iso) => {
    const [a, m, d] = String(iso).split('-');
    return `${d}/${m}/${a}`;
};

export const formatarMulta = (v) =>
    Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/** Texto de "levou multa". Linhas antigas (só com valor) continuam aparecendo. */
export const textoMulta = (a) => {
    if (!a.reincidente) return 'Não se aplica';
    if (a.levou_multa === true) return 'Sim';
    if (a.levou_multa === false) return 'Não';
    return a.multa ? formatarMulta(a.multa) : '—';
};

export function useAdvertencias() {
    /** Unidades já cadastradas (autocompletar). */
    const listarUnidades = useCallback(async () => {
        const { data, error } = await supabase
            .from('advertencias')
            .select('unidade')
            .limit(2000);
        if (error) throw error;
        return [...new Set(data.map((r) => r.unidade))].sort((a, b) =>
            a.localeCompare(b, 'pt-BR', { numeric: true })
        );
    }, []);

    /** Tela 1 — envia as fotos ao Storage e grava a advertência. */
    const registrarAdvertencia = useCallback(async (dados, arquivos) => {
        const pasta = crypto.randomUUID();
        const paths = [];

        for (let i = 0; i < arquivos.length; i++) {
            const img = await imageCompression(arquivos[i], {
                maxSizeMB: 0.6,
                maxWidthOrHeight: 1600,
                useWebWorker: true,
                fileType: 'image/jpeg',
            });
            const path = `${pasta}/evidencia-${pad2(i + 1)}.jpg`;
            const { error } = await supabase.storage
                .from(BUCKET)
                .upload(path, img, { contentType: 'image/jpeg' });
            if (error) throw error;
            paths.push(path);
        }

        const { error } = await supabase.from('advertencias').insert({
            unidade: dados.unidade.trim(),
            data_infracao: dados.data,
            hora_infracao: dados.hora,
            infracao: dados.infracao.trim(),
            regimento_interno: dados.regimento.trim(),
            reincidente: dados.reincidente,
            levou_multa: dados.reincidente ? dados.levouMulta : null,
            obs: dados.reincidente && dados.obs ? dados.obs.trim() : null,
            evidencias: paths,
        });
        if (error) throw error;
    }, []);

    /** Tela 2 — busca por unidade e já devolve URLs assinadas das fotos. */
    const buscarAdvertencias = useCallback(async (unidade) => {
        const termo = unidade.trim().replace(/[%_\\]/g, '\\$&');
        const { data, error } = await supabase
            .from('advertencias')
            .select('*')
            .ilike('unidade', `%${termo}%`)
            .order('data_infracao', { ascending: false })
            .order('hora_infracao', { ascending: false })
            .limit(50);
        if (error) throw error;

        return Promise.all(
            data.map(async (a) => {
                let urls = [];
                if (a.evidencias?.length) {
                    const { data: assinadas } = await supabase.storage
                        .from(BUCKET)
                        .createSignedUrls(a.evidencias, 3600);
                    urls = (assinadas ?? []).map((u) => u.signedUrl).filter(Boolean);
                }
                return { ...a, urls };
            })
        );
    }, []);

    /** Exclusão com justificativa (função atômica no banco). */
    const excluirAdvertencia = useCallback(async (id, justificativa) => {
        const { error } = await supabase.rpc('excluir_advertencia', {
            p_id: String(id),
            p_justificativa: justificativa,
        });
        if (error) throw error;
    }, []);

    /** Exporta ZIP: advertencia.txt + evidências. Nome: UNIDADE-DD-MM-AAAA-HH-MM.zip */
    const exportarZip = useCallback(async (a) => {
        const [ano, mes, dia] = a.data_infracao.split('-');
        const hora = a.hora_infracao.slice(0, 5);
        const nome = [
            a.unidade.trim().replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, '_'),
            `${dia}-${mes}-${ano}`,
            hora.replace(':', '-'),
        ].join('-');

        const txt = [
            `ADVERTÊNCIA — ${a.id}`,
            '='.repeat(50),
            `Unidade:            ${a.unidade}`,
            `Data da infração:   ${dia}/${mes}/${ano}`,
            `Hora da infração:   ${hora}`,
            `Regimento Interno:  ${a.regimento_interno || '—'}`,
            `Reincidente:        ${a.reincidente ? 'Sim' : 'Não'}`,
            `Levou multa:        ${textoMulta(a)}`,
            '',
            'INFRAÇÃO',
            '-'.repeat(50),
            a.infracao,
            ...(a.obs ? ['', 'OBSERVAÇÃO', '-'.repeat(50), a.obs] : []),
            '',
            `EVIDÊNCIAS (${a.evidencias.length})`,
            '-'.repeat(50),
            ...a.evidencias.map((p) => `- ${p.split('/').pop()}`),
        ].join('\r\n');

        const zip = new JSZip();
        zip.file('advertencia.txt', '\uFEFF' + txt); // BOM: acentos corretos no Bloco de Notas
        for (const p of a.evidencias) {
            const { data, error } = await supabase.storage.from(BUCKET).download(p);
            if (error) throw error;
            zip.file(p.split('/').pop(), data);
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement('a'), { href: url, download: `${nome}.zip` });
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, []);

    return { listarUnidades, registrarAdvertencia, buscarAdvertencias, excluirAdvertencia, exportarZip };
}
