import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, CheckCircle, Clock, Trash2, User, Building } from 'lucide-react';

function AdminVolleyball() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservas();
    }, []);

    async function fetchReservas() {
        const { data } = await supabase
            .from('reservas_volei')
            .select('*')
            .order('data', { ascending: true });
        if (data) setReservas(data);
        setLoading(false);
    }

    async function toggleStatus(id, currentStatus) {
        await supabase.from('reservas_volei').update({ entregue: !currentStatus }).eq('id', id);
        fetchReservas();
    }

    async function deleteReserva(id) {
        if (!confirm('Excluir reserva?')) return;
        await supabase.from('reservas_volei').delete().eq('id', id);
        fetchReservas();
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-black text-slate-800">Controle de Vôlei</h1>
                <p className="text-slate-500 text-sm">Gerencie as retiradas e devoluções da rede de vôlei.</p>
            </header>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <th className="px-4 md:px-6 py-4">Morador</th>
                            <th className="px-4 md:px-6 py-4">Data</th>
                            <th className="px-4 md:px-6 py-4">Status</th>
                            <th className="px-4 md:px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reservas.map(res => (
                            <tr key={res.id} className="text-sm">
                                <td className="px-4 md:px-6 py-4">
                                    <p className="font-bold text-slate-800 text-xs md:text-sm">{res.nome}</p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Unid: {res.unidade}</p>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-slate-500 font-medium text-xs md:text-sm">
                                    {new Date(res.data).toLocaleDateString()}
                                </td>
                                <td className="px-4 md:px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(res.id, res.entregue)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase flex items-center gap-2 transition-all ${res.entregue ? 'bg-highlight/10 text-highlight' : 'bg-secondary/10 text-secondary'}`}
                                    >
                                        {res.entregue ? <><CheckCircle size={12} /> ENTREGUE</> : <><Clock size={12} /> PENDENTE</>}
                                    </button>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right">
                                    <button onClick={() => deleteReserva(res.id)} className="text-slate-200 hover:text-secondary p-1">
                                        <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminVolleyball;
