import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, Plus, Save, Trash2, Clock, MapPin, Info, Loader2 } from 'lucide-react';
import { sendPushNotification } from '../services/pushService';
import { formatDate, getMonthName, getDayOfMonth } from '../utils/dateUtils';

function AdminAgenda() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [local, setLocal] = useState('');
    const [observacao, setObservacao] = useState('');
    const [notifying, setNotifying] = useState(null);

    useEffect(() => {
        fetchEventos();
    }, []);

    async function fetchEventos() {
        const { data } = await supabase
            .from('agenda')
            .select('*')
            .order('data', { ascending: true });
        if (data) setEventos(data);
        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        let notifyMessage = '';

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('agenda')
            .insert([{
                titulo,
                data,
                hora,
                local,
                observacao,
                criado_por: user?.id
            }]);


        if (!error) {
            alert('Evento salvo com sucesso!');
            fetchEventos();
            setTitulo('');
            setData('');
            setHora('');
            setLocal('');
            setObservacao('');
        } else {
            alert('Erro ao salvar: ' + error.message);
        }
        setSaving(false);
    }

    async function deleteEvento(id) {
        if (!confirm('Excluir este evento?')) return;
        await supabase.from('agenda').delete().eq('id', id);
        fetchEventos();
    }

    async function handleManualPush(evento) {
        setNotifying(evento.id);
        try {
            const pushResult = await sendPushNotification({
                title: 'Novo Evento na Agenda! 📅',
                body: `${evento.titulo} - ${formatDate(evento.data)} às ${evento.hora.slice(0, 5)}`,
                url: '/agenda'
            });

            if (pushResult.success) {
                alert(`Notificação enviada com sucesso para ${pushResult.count} dispositivos!`);
            } else {
                alert('Erro ao enviar notificação: ' + pushResult.error);
            }
        } catch (err) {
            alert('Erro inesperado: ' + err.message);
        } finally {
            setNotifying(null);
        }
    }

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <header>
                <h1 className="text-2xl font-black text-slate-800">Agenda do Prédio</h1>
                <p className="text-slate-500 text-sm">Gerencie os eventos e comunicados de calendário.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <section className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                    <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="text-primary" /> Novo Evento
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Título</label>
                            <input type="text" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400">Data</label>
                                <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400">Hora</label>
                                <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Local</label>
                            <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Ex: Salão de Festas" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400">Observação</label>
                            <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" rows={3} />
                        </div>
                        <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Salvar Evento
                        </button>
                    </form>
                </section>

                <section className="lg:col-span-2 space-y-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2 px-2">
                        <Calendar size={20} className="text-slate-400" /> Eventos Agendados
                    </h2>
                    <div className="space-y-3">
                        {eventos.map(ev => (
                            <div key={ev.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="text-center bg-primary/10 p-3 rounded-xl min-w-[70px]">
                                        <p className="text-[10px] font-black text-primary uppercase">{getMonthName(ev.data)}</p>
                                        <p className="text-xl font-black text-primary leading-none">{getDayOfMonth(ev.data)}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{ev.titulo}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><Clock size={12} /> {ev.hora.slice(0, 5)}</span>
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase"><MapPin size={12} /> {ev.local}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleManualPush(ev)}
                                        disabled={notifying === ev.id}
                                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"
                                    >
                                        {notifying === ev.id ? <Loader2 size={10} className="animate-spin" /> : <Calendar size={10} />}
                                        Notificar
                                    </button>
                                    <button onClick={() => deleteEvento(ev.id)} className="text-slate-300 hover:text-secondary opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminAgenda;
