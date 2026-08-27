import React, { useRef } from 'react';
import { Info, Trophy, Ticket, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function QuickActions({ lostCount }) {
    const navigate = useNavigate();
    const container = useRef(null);

    useGSAP(() => {
        if (document.querySelectorAll('.quick-card').length > 0) {
            gsap.from('.quick-card', {
                y: 30,
                opacity: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: container.current,
                    start: 'top 80%',
                }
            });
        }
    }, { scope: container });

    return (
        <section ref={container} className="mb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
                onClick={() => navigate('/achados')}
                className="quick-card bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-center group relative overflow-hidden hover:-translate-y-2"
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
            </div>

            <div
                onClick={() => navigate('/volei')}
                className="quick-card bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-center group relative overflow-hidden hover:-translate-y-2"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-primary/5 transition-colors" />
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                    <Trophy className="text-slate-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest relative z-10">Rede de Vôlei</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Agendar Quadra</p>
            </div>

            <div
                onClick={() => navigate('/pulseiras')}
                className="quick-card bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-primary/30 transition-all text-center group relative overflow-hidden hover:-translate-y-2"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-primary/5 transition-colors" />
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                    <Ticket className="text-slate-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest relative z-10">Pulseiras Piscina</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Convites Visitantes</p>
            </div>

            <div
                onClick={() => navigate('/manual-maxclub')}
                className="quick-card bg-slate-900 p-10 rounded-[2.5rem] shadow-xl cursor-pointer hover:bg-black transition-all text-center group text-white relative overflow-hidden hover:-translate-y-2"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
                    <BookOpen className="text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-bold mb-2 uppercase text-xs tracking-widest relative z-10">Guia MaxClub</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest relative z-10">Normas e Manuais</p>
            </div>
        </section>
    );
}
