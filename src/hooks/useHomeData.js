import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useHomeData() {
    const [avisos, setAvisos] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [limpeza, setLimpeza] = useState([]);
    const [classificados, setClassificados] = useState([]);
    const [empreendedores, setEmpreendedores] = useState([]);
    const [lostCount, setLostCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const today = new Date().toLocaleDateString('en-CA');

            // Buscar avisos
            const { data: dataAvisos } = await supabase
                .from('avisos')
                .select('*')
                .or(`data_fim.gte.${today},data_fim.is.null`)
                .order('created_at', { ascending: false });
            if (dataAvisos) setAvisos(dataAvisos);

            // Fetch Agenda
            const { data: dataAgenda } = await supabase
                .from('agenda')
                .select('*')
                .gte('data', today)
                .order('data', { ascending: true })
                .limit(5);
            if (dataAgenda) setAgenda(dataAgenda);

            // Fetch Limpeza
            const { data: dataLimpeza } = await supabase
                .from('limpeza_registros')
                .select('*, locais_limpeza(nome)')
                .order('data_limpeza', { ascending: false })
                .limit(3);
            if (dataLimpeza) setLimpeza(dataLimpeza);

            // Fetch Classificados
            const { data: dataClassificados } = await supabase
                .from('classificados')
                .select('*')
                .eq('status', 'ATIVO')
                .order('created_at', { ascending: false })
                .limit(3);
            if (dataClassificados) setClassificados(dataClassificados);

            // Fetch Empreendedores
            const { data: dataEmpreendedores } = await supabase
                .from('empreendedores')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(3);
            if (dataEmpreendedores) setEmpreendedores(dataEmpreendedores);

            // Fetch Achados e Perdidos
            const { count } = await supabase
                .from('achados_perdidos')
                .select('*', { count: 'exact', head: true })
                .eq('retirado', false);
            if (count !== null) setLostCount(count);

        } catch (error) {
            console.error('Erro ao buscar dados da Home:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        avisos,
        agenda,
        limpeza,
        classificados,
        empreendedores,
        lostCount,
        loading
    };
}
