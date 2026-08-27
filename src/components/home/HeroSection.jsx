import React, { useRef } from 'react';
import { Key, Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function HeroSection() {
    const navigate = useNavigate();
    const { isSubscribed, subscribeUser, loading: pushLoading } = usePushNotifications();
    const container = useRef();

    useGSAP(() => {
        const tl = gsap.timeline();
        tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' })
          .from('.hero-title', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
          .from('.hero-text', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
          .from('.hero-btn', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.4')
          .from('.hero-card', { scale: 0.9, opacity: 0, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.2');
    }, { scope: container });

    return (
        <div ref={container} className="md:max-w-2xl">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-8 border border-primary/20">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Ambiente Digital Seguro
            </div>
            <h1 className="hero-title text-5xl md:text-7xl font-bold text-slate-900 leading-[1.05] mb-8 tracking-tighter">
                A nova era da sua <span className="text-primary">Experiência</span>.
            </h1>
            <p className="hero-text text-lg text-slate-500 mb-12 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium">
                Acesse senhas, agende eventos e receba avisos em tempo real com a tecnologia exclusiva do condomínio MaxClub.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                <button
                    onClick={() => navigate('/morador/login')}
                    className="hero-btn bg-primary text-white font-bold px-12 py-5 rounded-3xl shadow-xl shadow-primary/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest hover:-translate-y-1"
                >
                    Portal do Morador
                    <Key size={18} />
                </button>
                <button
                    onClick={() => navigate('/acesso')}
                    className="hero-btn bg-white border border-slate-200 text-slate-900 font-bold px-10 py-5 rounded-3xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                >
                    Acessos Rápidos
                </button>
            </div>

            {!isSubscribed && (
                <div className="hero-card mt-8 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
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
                </div>
            )}

            {isSubscribed && (
                <div className="hero-card mt-8 p-6 bg-highlight/5 border border-highlight/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-highlight/10 rounded-2xl flex items-center justify-center shadow-sm">
                            <CheckCircle className="text-highlight" size={24} />
                        </div>
                        <div>
                            <h4 className="text-slate-800 font-bold text-sm">Notificações Ativas</h4>
                            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Você receberá todos os avisos em tempo real.</p>
                        </div>
                    </div>
                    <button 
                        onClick={subscribeUser}
                        disabled={pushLoading}
                        className={`text-[9px] font-bold uppercase tracking-widest underline transition-colors ${pushLoading ? 'text-slate-300' : 'text-slate-400 hover:text-primary'}`}
                    >
                        {pushLoading ? 'Resetando...' : 'Não está recebendo? Resetar'}
                    </button>
                </div>
            )}
        </div>
    );
}
