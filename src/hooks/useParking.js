import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function useParking() {
    const [vagas, setVagas] = useState([]);
    const [sorteios, setSorteios] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: dataVagas } = await supabase.from('vagas').select('*').order('numero');
            const { data: dataSorteios } = await supabase.from('sorteio_historico').select('*').order('created_at', { ascending: false });

            if (dataVagas) setVagas(dataVagas);
            if (dataSorteios) setSorteios(dataSorteios);
        } catch (error) {
            console.error('Erro ao buscar dados de vagas:', error);
            toast.error('Falha ao carregar os dados de vagas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addEditVaga = async (payload, editingVaga) => {
        let error;
        if (editingVaga) {
            const res = await supabase.from('vagas').update(payload).eq('id', editingVaga.id);
            error = res.error;
        } else {
            const res = await supabase.from('vagas').insert([payload]);
            error = res.error;
        }

        if (error) {
            toast.error(`Erro ao ${editingVaga ? 'atualizar' : 'cadastrar'}: ` + error.message);
            throw error;
        } else {
            toast.success(`Vaga ${editingVaga ? 'atualizada' : 'cadastrada'}!`);
            await fetchData();
        }
    };

    const removeVaga = async (id) => {
        const { error } = await supabase.from('vagas').delete().eq('id', id);
        if (error) {
            toast.error('Erro ao excluir: ' + error.message);
            throw error;
        } else {
            toast.success('Vaga excluída.');
            await fetchData();
        }
    };

    const swapVagas = async (swapVaga1, swapVaga2) => {
        const v1 = vagas.find(v => v.id === swapVaga1);
        const v2 = vagas.find(v => v.id === swapVaga2);

        if (!v1 || !v2) throw new Error('Vagas não encontradas.');

        const op1 = supabase.from('vagas').update({
            unidade_dona: v2.unidade_dona,
            unidade_alugou: v2.unidade_alugou
        }).eq('id', v1.id);

        const op2 = supabase.from('vagas').update({
            unidade_dona: v1.unidade_dona,
            unidade_alugou: v1.unidade_alugou
        }).eq('id', v2.id);

        await Promise.all([op1, op2]);
        await fetchData();
    };

    const generateLottery = async (title) => {
        if (!title) {
            toast.error('Dê um título ao sorteio');
            throw new Error('Título vazio');
        }

        const unidades = vagas.map(v => v.unidade_dona);
        const vagasDisponiveis = vagas.map(v => ({ numero: v.numero, subsolo: v.subsolo }));
        const shuffledUnidades = [...unidades].sort(() => Math.random() - 0.5);

        const resultado = vagasDisponiveis.map((vaga, idx) => ({
            vaga: vaga.numero,
            subsolo: vaga.subsolo,
            unidade: shuffledUnidades[idx]
        }));

        const { error } = await supabase.from('sorteio_historico').insert([{
            titulo: title,
            resultado: resultado
        }]);

        if (error) {
            toast.error('Erro ao realizar sorteio: ' + error.message);
            throw error;
        } else {
            toast.success('Sorteio realizado com sucesso!');
            await fetchData();
        }
    };

    return {
        vagas,
        sorteios,
        loading,
        addEditVaga,
        removeVaga,
        swapVagas,
        generateLottery,
        reload: fetchData
    };
}
