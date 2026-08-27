import React, { useRef } from 'react';
import { Store, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function EntrepreneursShowcase({ empreendedores }) {
    const navigate = useNavigate();
    const container = useRef(null);

    useGSAP(() => {
        gsap.from('.entrepreneur-card', {
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
    }, { scope: container });

    return (
        <section ref={container} className="mb-24">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-4 tracking-tight">
                    <Store className="text-primary" /> Comunidade Empreendedora
                </h2>
                <button 
                    onClick={() => navigate('/empreendedores')}
                    className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                    Ver todos <ArrowRight size={16} />
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {empreendedores.length > 0 ? empreendedores.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate('/empreendedores')}
                        className="entrepreneur-card bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group cursor-pointer p-8 hover:-translate-y-2"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner overflow-hidden flex items-center justify-center flex-shrink-0">
                                {item.foto_url ? (
                                    <img src={item.foto_url} alt={item.titulo_servico} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <Store className="text-slate-300 w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg leading-tight">{item.titulo_servico}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {item.nome_morador} • Unidade {item.unidade}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed flex-1">
                            {item.descricao}
                        </p>
                    </div>
                )) : (
                    <div className="col-span-full py-16 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <Store className="mx-auto text-slate-200 mb-4" size={40} />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Nenhum serviço cadastrado.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-primary/10 text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/20 transition-all text-[10px] uppercase tracking-widest"
                        >
                            Divulgue o seu
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
