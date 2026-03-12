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
    Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo.png';

function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [avisos, setAvisos] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [limpeza, setLimpeza] = useState([]);
    const [lostCount, setLostCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [logoError, setLogoError] = useState(false);
    const navigate = useNavigate();

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
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-sm border border-slate-100 relative group-hover:scale-105 transition-all">
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
                        <span className="text-2xl font-black tracking-tight text-slate-900">
                            MaxClub<span className="text-primary">Itaim</span>
                        </span>
                    </motion.div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/')} className="text-sm font-semibold text-primary">Início</button>
                        <a href="#avisos" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Avisos</a>
                        <button onClick={() => navigate('/agenda')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Agenda</button>
                        <button onClick={() => navigate('/login')} className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg hover:bg-slate-800 transition-all border border-slate-900">
                            Área Administrativa
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
            </header>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
                    >
                        <div className="p-4 flex flex-col gap-4">
                            <button onClick={() => { navigate('/'); setIsMenuOpen(false) }} className="text-left font-bold text-slate-600">Início</button>
                            <a href="#avisos" onClick={() => setIsMenuOpen(false)} className="text-left font-bold text-slate-600">Avisos</a>
                            <button onClick={() => { navigate('/agenda'); setIsMenuOpen(false); }} className="text-left font-bold text-slate-600">Agenda</button>
                            <button onClick={() => navigate('/login')} className="bg-primary text-white font-bold py-3 rounded-xl">Área Administrativa</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
                <section className="mb-20 text-center md:text-left md:flex lg:items-center md:justify-between gap-12">
                    <motion.div
                        className="md:max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                            Ambiente Seguro
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            O condomínio inteligente no <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Itaim Paulista</span>.
                        </h1>
                        <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
                            Acesse senhas das portas, consulte a agenda de eventos e tenha os avisos importantes na palma da mão.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <motion.button
                                whileHover={{ y: -2 }}
                                onClick={() => navigate('/acesso')}
                                className="bg-primary text-white font-bold px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                Controle de Acessos
                                <Key size={20} />
                            </motion.button>
                            <button
                                onClick={() => navigate('/sugestoes')}
                                className="bg-white border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={18} /> Sugestões
                            </button>
                        </div>
                    </motion.div>

                    {/* Status Sidebar (Desktop) */}
                    <motion.div
                        className="hidden lg:block w-full max-w-sm space-y-6"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="bg-white p-6 rounded-3xl shadow-premium border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                                Limpeza Recente
                                <Settings size={14} className="text-slate-300" />
                            </h4>
                            <div className="space-y-4">
                                {limpeza.length > 0 ? limpeza.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-700">{item.locais_limpeza?.nome}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(item.data_limpeza).toLocaleDateString()}</span>
                                            <span className="px-2 py-0.5 bg-highlight/10 text-highlight text-[10px] font-black rounded-md uppercase">OK</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-400 italic">Nenhum registro recente.</p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/limpeza')}
                                className="w-full mt-6 py-3 bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Ver histórico completo
                            </button>
                        </div>

                        <div id="agenda" className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
                                Próximos Eventos
                                <button onClick={() => navigate('/agenda')} className="text-primary hover:underline text-[10px] font-black uppercase tracking-widest ml-auto mr-2">Ver tudo</button>
                                <Calendar size={14} className="text-primary" />
                            </h4>
                            <div className="space-y-3">
                                {agenda.length > 0 ? agenda.map((evento) => (
                                    <div key={evento.id} className="flex gap-3">
                                        <div className="text-primary font-black text-xs pt-1">
                                            {new Date(evento.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold leading-tight">{evento.titulo}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{evento.hora.slice(0, 5)} - {evento.local}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-slate-500 italic">Sem eventos agendados.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Dynamic Avisos Section */}
                <section id="avisos" className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Bell className="text-primary" /> Painel de Avisos
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {avisos.length > 0 ? avisos.map((aviso) => (
                            <motion.div
                                key={aviso.id}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
                            >
                                {aviso.imagem_url && (
                                    <img src={aviso.imagem_url} alt={aviso.titulo} className="h-48 w-full object-cover" />
                                )}
                                <div className="p-8 flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-md tracking-wider">
                                            Importante
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                                            {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{aviso.titulo}</h3>
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">
                                        {aviso.descricao}
                                    </p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-16 text-center bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold italic">Nenhum aviso ativo no momento.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section className="mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => navigate('/achados')}
                        className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 shadow-sm cursor-pointer hover:bg-primary/10 transition-all text-center group relative"
                    >
                        {lostCount > 0 && (
                            <div className="absolute top-6 right-6 w-6 h-6 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                {lostCount}
                            </div>
                        )}
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-all">
                            <Info className="text-primary" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Achados & Perdidos</h3>
                        <p className="text-xs text-slate-500 font-medium">Confira os itens encontrados no prédio.</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => navigate('/volei')}
                        className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-all text-center group"
                    >
                        <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-all">
                            <Calendar className="text-secondary" />
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">Rede de Vôlei</h3>
                        <p className="text-xs text-slate-500 font-medium">Reserve a rede de vôlei para quadra.</p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        onClick={() => navigate('/manual-maxclub')}
                        className="bg-slate-900 p-8 rounded-[2rem] shadow-xl cursor-pointer hover:bg-slate-800 transition-all text-center group text-white"
                    >
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-all">
                            <BookOpen className="text-white" />
                        </div>
                        <h3 className="font-bold mb-2">Manual MaxClub</h3>
                        <p className="text-xs text-slate-400 font-medium">Tudo o que você precisa saber.</p>
                    </motion.div>
                </section>

                {/* Links Section */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <ExternalLink className="text-slate-400" /> Links Úteis
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {linksUteis.map((link, idx) => (
                                <a
                                    key={idx}
                                    href={link.url}
                                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:border-primary transition-all group"
                                >
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                        {link.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                            <Smartphone className="text-slate-400" /> Aplicativos do Prédio
                        </h3>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-premium divide-y divide-slate-100">
                            {appLinks.map((app, idx) => (
                                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                                    <span className="font-bold text-slate-800">{app.name}</span>
                                    <div className="flex gap-2">
                                        <a href={app.android} className="px-3 py-1.5 bg-slate-100 text-[10px] font-black rounded-lg hover:bg-primary/10 hover:text-primary transition-all uppercase">Android</a>
                                        <a href={app.ios} className="px-3 py-1.5 bg-slate-100 text-[10px] font-black rounded-lg hover:bg-primary/10 hover:text-primary transition-all uppercase">iOS</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">
                    2026 Todos os direitos reservados MaxClub Itaim.
                </p>
                <p className="text-[10px] text-slate-300 font-medium">
                    Premium Living Experience • Facilitando o dia a dia para você focar no que importa.
                </p>
            </footer>
        </div>
    );
}

export default Home;
