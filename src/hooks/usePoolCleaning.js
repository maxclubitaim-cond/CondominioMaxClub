import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { compressImage } from '../utils/imageCompression';
import { toast } from 'react-hot-toast';

export function usePoolCleaning() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('limpeza_piscina')
                .select('*, perfis(nome)')
                .order('data_registro', { ascending: false });

            if (error) throw error;
            if (data) setRegistros(data);
        } catch (error) {
            console.error('Erro ao buscar registros de piscina:', error);
            toast.error('Erro ao carregar histórico da piscina.');
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
                .from('piscina')
                .upload(fileName, compressedFile);

            if (error) throw error;

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('piscina')
                    .getPublicUrl(fileName);
                urls.push(publicUrl);
            }
        }
        return urls;
    };

    const registerTreatment = async (payload, profileId) => {
        const { ph, cloro, alcalinidade, antesFiles, depoisFiles } = payload;

        const fotosAntesUrls = await uploadImages(antesFiles);
        const fotosDepoisUrls = await uploadImages(depoisFiles);

        const { data, error } = await supabase
            .from('limpeza_piscina')
            .insert([{
                ph: parseFloat(ph.replace(',', '.')),
                cloro: parseFloat(cloro.replace(',', '.')),
                alcalinidade: parseFloat(alcalinidade.replace(',', '.')),
                fotos_antes: fotosAntesUrls,
                fotos_depois: fotosDepoisUrls,
                operador_id: profileId,
                data_registro: new Date().toISOString()
            }])
            .select('*, perfis(nome)');

        if (error) throw error;
        
        if (data && data.length > 0) {
            setRegistros(prev => [data[0], ...prev]);
        }
        return data;
    };

    return {
        registros,
        loading,
        registerTreatment,
        reload: fetchData
    };
}
