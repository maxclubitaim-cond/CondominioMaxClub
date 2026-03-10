import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
    Bell,
    MessageSquare,
    Package,
    Calendar,
    Trophy,
    ChevronRight,
    TrendingUp,
    Inbox,
    Clock,
    Wrench,
    Shield,
    ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminOverview() {
    const [stats, setStats] = useState({
        avisos: 0,
        sugestoesTotal: 0,
        sugestoesNaoLidas: 0,
        achados: 0,
        eficienciaLimpeza: 0,
        manutencoesMes: 0,
        totalAcessos: 0
    });
    const [proximosEventos, setProximosEventos] = useState([]);
    const [voleiPendente, setVoleiPendente] = useState([]);
    const [limpezaCritica, setLimpezaCritica] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setLoading(true);
        try {
            // 1. Avisos Ativos
            const { count: countAvisos } = await supabase
                .from('avisos')
                .select('*', { count: 'exact', head: true });

            // 2. Sugestões
            const { data: dataSugestoes } = await supabase
                .from('sugestoes')
                .select('lido');

            const totalSugestoes = dataSugestoes?.length || 0;
            const naoLidas = dataSugestoes?.filter(s => !s.lido).length || 0;

            // 3. Achados e Perdidos (Não retirados)
            const { count: countAchados } = await supabase
                .from('achados_perdidos')
                .select('*', { count: 'exact', head: true })
                .eq('retirado', false);

            // 4. Próximos Eventos (Agenda)
            const hoy = new Date().toISOString().split('T')[0];
            const { data: dataAgenda } = await supabase
                .from('agenda')
                .select('*')
                .gte('data', hoy)
                .order('data')
                .order('hora')
                .limit(5);

            // 5. Reservas de Vôlei Pendentes
            const { data: dataVolei } = await supabase
                .from('reservas_volei')
                .select('*')
                .eq('entregue', false)
                .order('data');

            // 6. Eficiência de Limpeza (Últimos 7 dias)
            // Meta: 2 limpezas por local (a cada 3 dias)
            const seteDiasAtras = new Date();
            seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

            const { data: todosLocaisLimpeza } = await supabase.from('locais_limpeza').select('*').eq('ativo', true);
            const { data: registrosRecentes } = await supabase
                .from('limpeza_registros')
                .select('local_id')
                .gte('data_limpeza', seteDiasAtras.toISOString());

            const contagemPorLocal = (registrosRecentes || []).reduce((acc, reg) => {
                acc[reg.local_id] = (acc[reg.local_id] || 0) + 1;
                return acc;
            }, {});

            let locaisOK = 0;
            const criticos = [];

            (todosLocaisLimpeza || []).forEach(local => {
                const qtd = contagemPorLocal[local.id] || 0;
                if (qtd >= 2) {
                    locaisOK++;
                } else {
                    criticos.push({ ...local, qtd });
                }
            });

            const percentualEficiencia = todosLocaisLimpeza?.length > 0
                ? Math.round((locaisOK / todosLocaisLimpeza.length) * 100)
                : 100;

            // 7. Manutenções no Mês
            const inicioMes = new Date();
            inicioMes.setDate(1);
            inicioMes.setHours(0, 0, 0, 0);

            const { count: countManutencoes } = await supabase
                .from('manutencao_registros')
                .select('*', { count: 'exact', head: true })
                .gte('data_manutencao', inicioMes.toISOString());

            // 8. Total de Acessos (Opcional, se existir a tabela)
            let countAcessos = 0;
            try {
                const { count } = await supabase.from('registros_acesso').select('*', { count: 'exact', head: true });
                countAcessos = count || 0;
            } catch (e) {
                console.warn('Tabela registros_acesso não encontrada');
            }

            // 9. Checklist Salão
            const { data: dataChecklist } = await supabase
                .from('salao_checklist')
                .select('aderencia');

            const totalChecklists = dataChecklist?.length || 0;
            const somaAderencia = dataChecklist?.reduce((acc, c) => acc + c.aderencia, 0) || 0;
            const aderenciaMedia = totalChecklists > 0 ? Math.round(somaAderencia / totalChecklists) : 0;

            setStats({
                avisos: countAvisos || 0,
                sugestoesTotal: totalSugestoes,
                sugestoesNaoLidas: naoLidas,
                achados: countAchados || 0,
                eficienciaLimpeza: percentualEficiencia,
                manutencoesMes: countManutencoes || 0,
                totalAcessos: countAcessos,
                totalChecklist: totalChecklists,
                aderenciaChecklist: aderenciaMedia
            });
            setProximosEventos(dataAgenda || []);
            setVoleiPendente(dataVolei || []);
            setLimpezaCritica(criticos);
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
        >
            <motion.header variants={itemVariants}>
                <h1 className="text-3xl font-black text-slate-800">Olá, Gestor!</h1>
                <p className="text-slate-500 font-medium">Aqui está o que está acontecendo no MaxClub Itaim hoje.</p>
            </motion.header>

            {/* Grid de KPIs */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    icon={<Bell className="text-blue-500" />}
                    label="Avisos Ativos"
                    value={stats.avisos}
                    color="bg-blue-500"
                    onClick={() => navigate('/dashboard/avisos')}
                />
                <KPICard
                    icon={<MessageSquare className="text-amber-500" />}
                    label="Sugestões"
                    value={stats.sugestoesTotal}
                    subValue={`${stats.sugestoesNaoLidas} não lidas`}
                    color="bg-amber-500"
                    onClick={() => navigate('/dashboard/sugestoes')}
                />
                <KPICard
                    icon={<Package className="text-emerald-500" />}
                    label="Achados"
                    value={stats.achados}
                    color="bg-emerald-500"
                    onClick={() => navigate('/dashboard/achados')}
                />
                <KPICard
                    icon={<TrendingUp className="text-indigo-500" />}
                    label="Eficiência Limpeza"
                    value={`${stats.eficienciaLimpeza}%`}
                    subValue="Últimos 7 dias"
                    color="bg-indigo-500"
                    onClick={() => navigate('/dashboard/limpeza')}
                />
                <KPICard
                    icon={<Wrench className="text-slate-500" />}
                    label="Manutenções"
                    value={stats.manutencoesMes}
                    subValue="Neste mês"
                    color="bg-slate-500"
                    onClick={() => navigate('/dashboard/manutencao')}
                />
                <KPICard
                    icon={<Shield className="text-rose-500" />}
                    label="Acessos Senha"
                    value={stats.totalAcessos}
                    subValue="Total Geral"
                    color="bg-rose-500"
                    onClick={() => navigate('/dashboard/acessos')}
                />
                <KPICard
                    icon={<ClipboardCheck className="text-emerald-600" />}
                    label="Checklists Salão"
                    value={stats.totalChecklist}
                    subValue={`${stats.aderenciaChecklist}% Aderência`}
                    color="bg-emerald-600"
                    onClick={() => navigate('/dashboard/checklist-salao')}
                />
            </motion.div>

            {/* Alerta de Limpeza Crítica */}
            {limpezaCritica.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="p-6 bg-secondary/5 border border-secondary/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-secondary shrink-0">
                            <Clock size={24} />
                        </div>
                        <div>
                            <h4 className="text-secondary font-black text-lg">Atenção na Limpeza!</h4>
                            <p className="text-slate-500 text-sm font-medium">
                                Os locais abaixo tiveram menos de 2 limpezas nos últimos 7 dias:
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {limpezaCritica.map(l => (
                            <span key={l.id} className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-sm">
                                {l.nome} ({l.qtd}/2)
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/limpeza')}
                        className="bg-secondary text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all whitespace-nowrap"
                    >
                        Corrigir Agora
                    </button>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Próximos Eventos */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Spoiler da Agenda</h2>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/agenda')}
                            className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
                        >
                            Ver Tudo
                        </button>
                    </div>
                    <div className="p-4 flex-1">
                        {proximosEventos.length > 0 ? (
                            <div className="space-y-2">
                                {proximosEventos.map(evento => (
                                    <div key={evento.id} className="group p-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-between border border-transparent hover:border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center min-w-[50px]">
                                                <p className="text-[10px] font-black uppercase text-slate-400">
                                                    {new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}
                                                </p>
                                                <p className="text-lg font-black text-slate-700">
                                                    {new Date(evento.data).getDate()}
                                                </p>
                                            </div>
                                            <div className="h-8 w-[2px] bg-slate-100 group-hover:bg-primary/20 transition-colors" />
                                            <div>
                                                <p className="font-bold text-slate-800">{evento.titulo}</p>
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                    <Clock size={12} /> {evento.hora.substring(0, 5)} • {evento.local}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-3">
                                <Inbox className="mx-auto text-slate-200" size={40} />
                                <p className="text-slate-400 font-bold">Nenhum evento próximo.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Reservas de Vôlei Pendentes */}
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                <Trophy size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800">Rede de Vôlei</h2>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase">
                            Pendentes: {voleiPendente.length}
                        </span>
                    </div>
                    <div className="p-8 flex-1">
                        {voleiPendente.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                                            <th className="pb-4">Unidade</th>
                                            <th className="pb-4">Morador</th>
                                            <th className="pb-4">Data</th>
                                            <th className="pb-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {voleiPendente.map(reserva => (
                                            <tr key={reserva.id} className="group hover:bg-slate-50 transition-all">
                                                <td className="py-4 font-black text-slate-800">{reserva.unidade}</td>
                                                <td className="py-4 text-sm text-slate-600 font-medium">{reserva.nome}</td>
                                                <td className="py-4 text-sm text-slate-500">
                                                    {new Date(reserva.data).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse mr-2" />
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase">Com Morador</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-3">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                    <Trophy size={32} />
                                </div>
                                <p className="text-slate-400 font-bold">Todo equipamento está guardado.</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/dashboard/volei')}
                            className="w-full mt-6 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all text-sm"
                        >
                            Gerenciar Entregas
                        </button>
                    </div>
                </section>
            </motion.div>
        </motion.div>
    );
}

function KPICard({ icon, label, value, subValue, color, onClick }) {
    return (
        <motion.button
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-left group transition-all hover:shadow-xl w-full flex flex-col justify-between ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                {onClick && <ChevronRight size={16} className="text-slate-200 group-hover:text-primary transition-all" />}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black text-slate-800">{value}</h3>
                    {subValue && <span className="text-[10px] font-bold text-slate-400 uppercase">{subValue}</span>}
                </div>
            </div>
            <div className={`mt-6 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden`}>
                <div className={`h-full ${color} w-2/3 opacity-20`} />
            </div>
        </motion.button>
    );
}

export default AdminOverview;
