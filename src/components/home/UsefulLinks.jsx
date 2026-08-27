import React from 'react';
import { ExternalLink, Smartphone } from 'lucide-react';

export default function UsefulLinks({ linksUteis, appLinks }) {
    return (
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
    );
}
