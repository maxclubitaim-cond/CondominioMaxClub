import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Calendar,
    Bell,
    CheckCircle,
    ChevronRight,
    Info,
    Menu,
    X,
    ArrowRight,
    Settings,
    Package,
    Key,
    ExternalLink,
    MessageSquare,
    Mail,
    Smartphone,
    BookOpen,
    Users,
    Building,
    Ticket,
    Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePushNotifications } from '../hooks/usePushNotifications';
import logo from '../assets/logo.png';
import { formatDate } from '../utils/dateUtils';

function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avisos, setAvisos] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [limpeza, setLimpeza] = useState([]);
    const [lostCount, setLostCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [logoError, setLogoError] = useState(false);
    const navigate = useNavigate();
    const { isSubscribed, subscribeUser, loading: pushLoading } = usePushNotifications();

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = element.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    const scrollToTop = () => {
        setIsMenuOpen(false);
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 100);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        const now = new Date().toISOString();

        // Fetch Avisos (que não expiraram)
        const { data: dataAvisos } = await supabase
            .from('avisos')
            .select('*')
            .or(`data_fim.gt.${now},data_fim.is.null`)
            .order('created_at', { ascending: false });

        // Fetch Agenda (eventos futuros)
        const { data: dataAgenda } = await supabase
            .from('agenda')
            .select('*')
            .gte('data', now.split('T')[0])
            .order('data', { ascending: true })
            .limit(5);

        // Fetch 3 últimos registros de limpeza
        const { data: dataLimpeza } = await supabase
            .from('limpeza_registros')
            .select('*, locais_limpeza(nome)')
            .order('data_limpeza', { ascending: false })
            .limit(3);

        // Fetch quantidade de achados e perdidos (não retirados)
        const { count } = await supabase
            .from('achados_perdidos')
            .select('*', { count: 'exact', head: true })
            .eq('retirado', false);

        if (dataAvisos) setAvisos(dataAvisos);
        if (dataAgenda) setAgenda(dataAgenda);
        if (dataLimpeza) setLimpeza(dataLimpeza);
        if (count !== null) setLostCount(count);
        setLoading(false);
    }

    const linksUteis = [
        { label: 'WhatsApp Gestão', icon: <MessageSquare size={18} />, url: 'https://wa.me/5511943233132' },
        { label: 'Grupo de Avisos', icon: <Users size={18} />, url: 'https://chat.whatsapp.com/DDfx2JO6npZ9kOalFNQtIK' },
        { label: 'E-mail da Gestão', icon: <Mail size={18} />, url: 'mailto:maxclubitaim@gmail.com' },
        { label: 'Manual da Unidade', icon: <BookOpen size={18} />, url: 'https://www.manual1.com.br/manuais/lot3/MF7/MaxClubItaim' },
        { label: 'Villa Nova - ASSUNTOS GERAIS', icon: <Building size={18} />, url: 'https://wa.me/5511943402075' },
        { label: 'Villa Nova - NEGOCIAÇÕES', icon: <Building size={18} />, url: 'https://wa.me/5511989860456' },
    ];

    const appLinks = [
        { name: 'Gruvi', android: 'https://play.google.com/store/apps/details?id=app.gruvi', ios: 'https://apps.apple.com/br/app/gruvi/id1561610983' },
        { name: 'Atende', android: 'https://play.google.com/store/apps/details?id=br.com.center.atendePortaria', ios: 'https://apps.apple.com/br/app/atende-portaria-mobile/id1504320653' },
        { name: 'DLock-XP', android: 'https://play.google.com/store/apps/details?id=com.dlock.smart', ios: 'https://apps.apple.com/br/app/dlock-xp/id1610441487' },
        { name: 'OMO Lavanderia', android: 'https://play.google.com/store/apps/details?id=br.com.taqtile.omolavanderia&hl=pt_BR', ios: 'https://apps.apple.com/br/app/omo-lavanderia/id1462393030' },
        { name: 'Market4You', android: 'https://play.google.com/store/apps/details?id=br.com.mobile.market4u&hl=pt_BR', ios: 'https://apps.apple.com/br/app/market4u/id1497298079' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
            {/* Header / Navbar */}
            <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-1.5 shadow-sm border border-slate-100 group-hover:scale-110 transition-all duration-500">
                            {!logoError ? (
                                <img
                                    src={logo}
                                    alt="MaxClub Itaim"
                                    className="w-full h-full object-contain"
                                    onError={() => setLogoError(true)}
                                />
                            ) : (
                                <Shield className="text-primary w-8 h-8" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                                MaxClub<span className="text-primary">Itaim</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ambiente Seguro</span>
                        </div>
                    </motion.div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={scrollToTop} className="text-xs font-bold uppercase tracking-widest text-primary border-b-2 border-primary pb-1">Início</button>
                        <button 
                            onClick={() => scrollToSection('avisos')} 
                            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                        >
                            Avisos
                        </button>
                        <button onClick={() => navigate('/agenda')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Agenda</button>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="bg-slate-50 text-slate-900 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                        >
                            Gestor
                        </button>
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                        >
                            <div className="p-4 flex flex-col gap-4">
                                <button onClick={scrollToTop} className="text-left font-bold text-slate-600">Início</button>
                                <button onClick={() => scrollToSection('avisos')} className="text-left font-bold text-slate-600">Avisos</button>
                                <button onClick={() => { navigate('/agenda'); setIsMenuOpen(false); }} className="text-left font-bold text-slate-600">Agenda</button>
                                <button onClick={() => navigate('/login')} className="bg-primary text-white font-bold py-3 rounded-xl">Área Administrativa</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
                <section className="mb-24 text-center md:text-left md:flex lg:items-center md:justify-between gap-16 relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
                    <motion.div
                        className="md:max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-8 border border-primary/20">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            Ambiente Digital Seguro
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                            A nova era da sua <span className="text-primary">Experiência</span>.
                        </h1>
                        <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
                            Acesse senhas, agende eventos e receba avisos em tempo real com a tecnologia exclusiva do condomínio MaxClub.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                            <motion.button
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/acesso')}
                                className="bg-primary text-white font-bold px-12 py-5 rounded-3xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest"
                            >
                                Acessos Rápidos
                                <Key size={18} />
                            </motion.button>
                            <button
                                onClick={() => navigate('/sugestoes')}
                                className="bg-white border border-slate-200 text-slate-900 font-bold px-10 py-5 rounded-3xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                            >
                                <MessageSquare size={18} className="text-primary" /> Sugestões
                            </button>
                        </div>

                        {/* Banner de Notificações PWA */}
                        {!isSubscribed && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-8 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Bell className="text-primary animate-ring" />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-slate-900 font-bold mb-1">Deseja receber avisos?</h4>
                                        <p className="text-slate-500 text-xs font-medium">Fique por dentro de eventos, manutenções e mais.</p>
                                    </div>
                                    <button
                                        onClick={subscribeUser}
                                        disabled={pushLoading}
                                        className="w-full md:w-auto px-6 py-3 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                                    >
                                        {pushLoading ? 'Ativando...' : 'Ativar Notificações'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Estado: Já Inscrito */}
                        {isSubscribed && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-6 bg-highlight/5 border border-highlight/20 rounded-3xl flex items-center gap-4 group"
                            >
                                <div className="w-12 h-12 bg-highlight/10 rounded-2xl flex items-center justify-center shadow-sm">
                                    <CheckCircle className="text-highlight" size={24} />
                                </div>
                                <div>
                                    <h4 className="text-slate-800 font-bold text-sm">Notificações Ativas</h4>
                                    <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Você receberá todos os avisos em tempo real.</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Status Sidebar (Desktop) */}
                    <motion.div
                        className="w-full lg:max-w-sm space-y-8 mt-12 lg:mt-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center justify-between relative z-10">
                                Status Operacional
                                <div className="w-2 h-2 bg-highlight rounded-full animate-pulse" />
                            </h4>
                            <div className="space-y-5 relative z-10">
                                {limpeza.length > 0 ? limpeza.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group/item text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">{item.locais_limpeza?.nome}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(item.data_limpeza).toLocaleDateString()}</span>
                                        </div>
                                        <span className="px-3 py-1 bg-highlight/10 text-highlight text-[9px] font-bold rounded-lg uppercase border border-highlight/20">Finalizado</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-400 font-bold italic">Aguardando registros...</p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/limpeza')}
                                className="w-full mt-8 py-4 bg-primary text-white font-bold text-[9px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-primary/10"
                            >
                                Painel de Higienização
                            </button>
                        </div>

                        <div id="agenda" className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-6 flex items-center justify-between relative z-10">
                                Próximos Eventos
                                <Calendar size={14} className="text-primary" />
                            </h4>
                            <div className="space-y-4 relative z-10">
                                {agenda.length > 0 ? agenda.map((evento) => (
                                    <div key={evento.id} className="flex gap-4 group/ev pointer-events-none">
                                        <div className="text-primary font-bold text-xs pt-1 flex flex-col items-center">
                                            <span>{new Date(evento.data).getDate()}</span>
                                            <span className="text-[8px] uppercase">{new Date(evento.data).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                                        </div>
                                        <div className="flex-1 border-l border-white/10 pl-4 py-1">
                                            <p className="text-[11px] font-bold leading-tight uppercase tracking-wide group-hover/ev:text-primary transition-colors">{evento.titulo}</p>
                                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{evento.hora.slice(0, 5)} • {evento.local}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-500 font-bold italic">Nenhum evento agendado.</p>
                                )}
                            </div>
                            <button 
                                onClick={() => navigate('/agenda')}
                                className="w-full mt-8 text-primary hover:text-white text-[9px] font-bold uppercase tracking-widest text-center transition-colors hover:underline"
                            >
                                Acessar Agenda Completa
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Dynamic Avisos Section */}
                <section id="avisos" className="mb-24">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-4 tracking-tight">
                            <Bell className="text-primary" /> Comunicados
                        </h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atualizado em tempo real</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {avisos.length > 0 ? avisos.map((aviso) => (
                            <motion.div
                                key={aviso.id}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group relative"
                            >
                                <div className="absolute top-6 right-6 z-10">
                                    <span className="px-3 py-1 bg-primary text-white text-[9px] font-bold uppercase rounded-full tracking-widest shadow-lg">
                                        Novo
                                    </span>
                                </div>
                                {aviso.imagem_url ? (
                                    <div className="h-56 w-full overflow-hidden">
                                        <img src={aviso.imagem_url} alt={aviso.titulo} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                ) : (
                                    <div className="h-56 w-full bg-slate-50 flex items-center justify-center">
                                        <Info size={40} className="text-slate-200" />
                                    </div>
                                )}
                                <div className="p-10 flex-1">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={12} className="text-primary" />
                                            {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-primary transition-colors leading-tight">{aviso.titulo}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                        {aviso.descricao}
                                    </p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                                <Info className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum aviso ativo no momento.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section className="mb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <motion.div
                        whileHover={{ y: -8 }}
                        onClick={() => navigate('/achados')}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-center group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-primary/5 transition-colors" />
                        {lostCount > 0 && (
                            <div className="absolute top-8 right-8 w-6 h-6 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-bounce z-10">
                                {lostCount}
                            </div>
                        )}
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                            <Info className="text-slate-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest relative z-10">Achados & Perdidos</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Itens sob custódia</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -8 }}
                        onClick={() => navigate('/volei')}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-center group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-primary/5 transition-colors" />
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                            <Trophy className="text-slate-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest relative z-10">Rede de Vôlei</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Agendar Quadra</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -8 }}
                        onClick={() => navigate('/pulseiras')}
                        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-center group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-primary/5 transition-colors" />
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                            <Ticket className="text-slate-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                        </div>
                        <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest relative z-10">Pulseiras Piscina</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Convites Visitantes</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -8 }}
                        onClick={() => navigate('/manual-maxclub')}
                        className="bg-slate-900 p-10 rounded-[2.5rem] shadow-xl cursor-pointer hover:bg-black transition-all text-center group text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                            <BookOpen className="text-white group-hover:scale-110 transition-transform" />
                        </div>
                        <h3 className="font-bold mb-2 uppercase text-xs tracking-widest relative z-10">Guia MaxClub</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Normas e Manuais</p>
                    </motion.div>
                </section>

                {/* Links Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-4 tracking-tight">
                            <ExternalLink size={24} className="text-primary" /> Canais Úteis
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {linksUteis.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-primary hover:shadow-xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                        {link.icon}
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-4 tracking-tight">
                            <Smartphone size={24} className="text-primary" /> Ecossistema App
                        </h3>
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-white/5 divide-y divide-white/5">
                            {appLinks.map((app, idx) => (
                                <div key={idx} className="py-5 first:pt-0 last:pb-0 flex items-center justify-between group/app">
                                    <span className="font-bold text-white text-xs uppercase tracking-widest group-hover/app:text-primary transition-colors">{app.name}</span>
                                    <div className="flex gap-3">
                                        <a href={app.android} className="px-4 py-2 bg-white/5 text-white text-[8px] font-bold rounded-xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest border border-white/10">Android</a>
                                        <a href={app.ios} className="px-4 py-2 bg-white/5 text-white text-[8px] font-bold rounded-xl hover:bg-primary hover:text-white transition-all uppercase tracking-widest border border-white/10">iOS</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 bg-slate-900 text-center border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] mb-4 opacity-80">
                        © 2026 MaxClub Itaim • Excelência em Gestão
                    </p>
                    <div className="h-px w-20 bg-white/10 mx-auto mb-4" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                        Sistema Inteligente para Moradores e Gestores. <br/>
                        Segurança e agilidade em um clique.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
