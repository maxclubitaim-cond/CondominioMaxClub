import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../utils/imageCompression';

export function useMaintenance() {
    const [areas, setAreas] = useState([]);
    const [registros, setRegistros] = useState([]);
    const [estoqueItens, setEstoqueItens] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [areasRes, regsRes, estoqueRes] = await Promise.all([
                supabase.from('manutencao_areas').select('*').eq('ativo', true).order('nome'),
                supabase.from('manutencao_registros').select('*, perfis(nome)').order('data_manutencao', { ascending: false }),
                supabase.from('estoque_itens').select('*').order('nome')
            ]);

            if (areasRes.data) setAreas(areasRes.data);
            if (regsRes.data) setRegistros(regsRes.data);
            if (estoqueRes.data) setEstoqueItens(estoqueRes.data);
        } catch (error) {
            console.error('Erro ao buscar dados de manutenção:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const uploadImages = async (files) => {
        const urls = [];
        for (const file of files) {
            const compressedFile = await compressImage(file);
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${compressedFile.name}`;
            const { data, error } = await supabase.storage
                .from('manutencao')
                .upload(fileName, compressedFile);

            if (error) throw error;

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('manutencao')
                    .getPublicUrl(fileName);
                urls.push(publicUrl);
            }
        }
        return urls;
    };

    const registerMaintenance = async (payload) => {
        const {
            areaNome, responsavelTecnico, descricao,
            antesFiles, depoisFiles, observacoes,
            itensUsados
        } = payload;

        const fotosAntesUrls = await uploadImages(antesFiles);
        const fotosDepoisUrls = await uploadImages(depoisFiles);

        const itensFormatados = itensUsados.length > 0 ? itensUsados.map(i => ({
            item_id: i.item_id,
            quantidade: i.quantidade,
            nome: i.nome,
            unidade_medida: i.unidade_medida
        })) : [];

        const { data, error } = await supabase.rpc('registrar_manutencao_com_estoque', {
            p_area_nome: areaNome,
            p_responsavel_tecnico: responsavelTecnico,
            p_descricao: descricao,
            p_fotos_antes: fotosAntesUrls,
            p_fotos_depois: fotosDepoisUrls,
            p_observacoes: observacoes || '',
            p_itens_estoque: itensFormatados
        });

        if (error) throw error;
        
        await fetchData(); // Atualiza a lista após inserir
        return data;
    };

    return {
        areas,
        registros,
        estoqueItens,
        loading,
        registerMaintenance,
        reload: fetchData
    };
}
