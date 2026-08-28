import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function AdminRondaQRCodes() {
    const navigate = useNavigate();
    const [locais, setLocais] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLocais();
    }, []);

    async function fetchLocais() {
        const { data, error } = await supabase
            .from('locais_ronda')
            .select('*')
            .eq('ativo', true)
            .order('ordem');

        if (error) {
            toast.error('Erro ao buscar locais: ' + error.message);
        } else {
            setLocais(data || []);
        }
        setLoading(false);
    }

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 print:bg-white print:py-0 print:px-0">
            <div className="max-w-4xl w-full">
                
                {/* Header escondido na impressão */}
                <div className="print:hidden">
                    <button
                        onClick={() => navigate('/dashboard/ronda')}
                        className="mb-8 flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-primary transition-all"
                    >
                        <ArrowLeft size={16} /> Voltar para Ronda
                    </button>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Gerador de QR Codes</h1>
                            <p className="text-slate-500 text-sm mt-1">Imprima as etiquetas para colar nos locais da ronda.</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="bg-primary text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all flex items-center gap-2"
                        >
                            <Printer size={20} />
                            Imprimir Todos
                        </button>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3 mb-8">
                        <Info size={18} className="text-primary shrink-0 mt-0.5" />
                        <p className="text-[12px] text-primary/80 font-bold leading-relaxed">
                            Dica de Impressão: Ao clicar em "Imprimir Todos", o navegador abrirá a tela de impressão. Recomendamos imprimir em formato A4 ou papel adesivo. O sistema oculta automaticamente os botões na hora da impressão.
                        </p>
                    </div>
                </div>

                {/* Grade de QR Codes (O que será impresso) */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4 print:break-inside-avoid">
                    {locais.map((local) => {
                        // O valor do QR Code será um JSON simples.
                        // O Scanner vai tentar dar parse nesse JSON.
                        const qrValue = JSON.stringify({
                            id: local.id,
                            nome: local.nome,
                            t: 'ronda'
                        });

                        return (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={local.id} 
                                className="bg-white border-2 border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center print:border-black print:rounded-none print:break-inside-avoid"
                            >
                                <div className="mb-4 bg-white p-2">
                                    <QRCodeSVG 
                                        value={qrValue}
                                        size={180}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg uppercase tracking-wider">{local.nome}</h3>
                                <p className="text-slate-400 text-xs mt-1 font-mono">Ponto #{local.ordem}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {locais.length === 0 && !loading && (
                    <div className="text-center text-slate-500 py-12">
                        Nenhum local de ronda cadastrado ou ativo.
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminRondaQRCodes;
