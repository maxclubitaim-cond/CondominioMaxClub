import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Settings, MessageSquare, Users, Mail, BookOpen, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useHomeData } from '../hooks/useHomeData';
import logo from '../assets/logo.png';

import HeroSection from '../components/home/HeroSection';
import OperationalStatus from '../components/home/OperationalStatus';
import NoticeBoard from '../components/home/NoticeBoard';
import QuickActions from '../components/home/QuickActions';
import MarketplaceShowcase from '../components/home/MarketplaceShowcase';
import EntrepreneursShowcase from '../components/home/EntrepreneursShowcase';
import UsefulLinks from '../components/home/UsefulLinks';

function Home() {
    const { avisos, agenda, limpeza, classificados, empreendedores, lostCount, loading } = useHomeData();
    const [logoError, setLogoError] = useState(false);
    const navigate = useNavigate();

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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-400">Carregando portal...</div>;
    }

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
                        <div className="flex flex-col text-left">
                            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                                MaxClub<span className="text-primary">Itaim</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ambiente Seguro</span>
                        </div>
                    </motion.div>

                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => navigate('/')} className="text-[10px] font-bold uppercase tracking-widest text-primary border-b-2 border-primary pb-1 transition-all">Início</button>
                        <button onClick={() => document.getElementById('avisos')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Avisos</button>
                        <button onClick={() => navigate('/classificados')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Classificados</button>
                        <button onClick={() => navigate('/agenda')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Agenda</button>
                        <button onClick={() => navigate('/empreendedores')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Empreendedores</button>
                        <button onClick={() => navigate('/login')} className="ml-4 px-6 py-2.5 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all shadow-sm">Gestor</button>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
                <section className="mb-24 text-center md:text-left md:flex lg:items-center md:justify-between gap-16 relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
                    <HeroSection />
                    <OperationalStatus limpeza={limpeza} agenda={agenda} />
                </section>

                <NoticeBoard avisos={avisos} />
                <QuickActions lostCount={lostCount} />
                <MarketplaceShowcase classificados={classificados} />
                <EntrepreneursShowcase empreendedores={empreendedores} />
                <UsefulLinks linksUteis={linksUteis} appLinks={appLinks} />
            </main>

            <footer className="py-20 bg-slate-900 text-center border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] mb-4 opacity-80">
                        © 2026 MaxClub Itaim • Excelência em Gestão
                    </p>
                    <div className="h-px w-20 bg-white/10 mx-auto mb-8" />
                    <button 
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors border border-slate-800 px-4 py-2 rounded-lg hover:border-primary hover:bg-primary/10"
                    >
                        <Settings size={12} />
                        Área Restrita
                    </button>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed mt-8">
                        Sistema Inteligente para Moradores e Gestores. <br/>
                        Segurança e agilidade em um clique.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
