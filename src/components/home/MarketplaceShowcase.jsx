import React, { useRef } from 'react';
import { Store, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function MarketplaceShowcase({ classificados }) {
    const navigate = useNavigate();
    const container = useRef(null);

    useGSAP(() => {
        if (document.querySelectorAll('.marketplace-card').length > 0) {
            gsap.fromTo('.marketplace-card',
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: container.current,
                        start: 'top 85%',
                    }
                }
            );
        }
    }, { scope: container });

    return (
        <section ref={container} className="mb-24">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-4 tracking-tight">
                    <Store className="text-primary" /> Vitrine do Condomínio
                </h2>
                <button 
                    onClick={() => navigate('/classificados')}
                    className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                    Ver todos <ArrowRight size={16} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {classificados.length > 0 ? classificados.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate('/classificados')}
                        className="marketplace-card bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group cursor-pointer hover:-translate-y-2"
                    >
                        <div className="h-48 bg-slate-50 relative overflow-hidden">
                            {item.imagem_url ? (
                                <img src={item.imagem_url} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Store size={48} className="opacity-50" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/50 shadow-sm">
                                <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{item.categoria}</span>
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight">{item.titulo}</h3>
                            <p className="font-black text-slate-900 text-xl mt-auto">
                                {item.preco > 0 ? `R$ ${Number(item.preco).toFixed(2)}` : <span className="text-emerald-500">Grátis</span>}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <Store className="mx-auto text-slate-200 mb-4" size={40} />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Nenhum anúncio no momento.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-primary/10 text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/20 transition-all text-[10px] uppercase tracking-widest"
                        >
                            Anuncie o seu
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
