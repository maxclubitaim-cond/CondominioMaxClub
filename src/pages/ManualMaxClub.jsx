import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Home,
    CreditCard,
    Clock,
    Zap,
    Hammer,
    Users,
    ShieldCheck,
    Smartphone,
    Phone,
    Building,
    MapPin,
    Droplets,
    Wind,
    Utensils,
    Dumbbell,
    Coffee,
    Baby,
    Scissors,
    Car,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ManualMaxClub() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('geral');

    const sections = [
        { id: 'geral', label: 'Geral', icon: <Home size={18} /> },
        { id: 'financas', label: 'Finanças', icon: <CreditCard size={18} /> },
        { id: 'lazer', label: 'Lazer & Áreas', icon: <Droplets size={18} /> },
        { id: 'regras', label: 'Mudanças & Obras', icon: <Hammer size={18} /> },
        { id: 'infra', label: 'Infraestrutura', icon: <Zap size={18} /> },
    ];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary transition-all font-bold text-sm"
                    >
                        <ChevronLeft size={20} />
                        Voltar
                    </button>
                    <h1 className="text-lg font-black text-slate-900 absolute left-1/2 -translate-x-1/2">Manual MaxClub</h1>
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary hidden sm:flex">
                        <ShieldCheck size={20} />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="mb-12">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Guia do Morador</h2>
                    <p className="text-slate-500 font-medium">Informações essenciais para o seu bem-estar no MaxClub Itaim.</p>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-10 pb-2 no-scrollbar">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setActiveTab(s.id)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm ${activeTab === s.id
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                                }`}
                        >
                            {s.icon}
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-8"
                    >
                        {activeTab === 'geral' && (
                            <>
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">Endereço Oficial</h3>
                                            <p className="text-sm text-slate-500 font-medium">Rua Cachoeira do Utupiru, 318 - CEP 08110-810</p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-inherit">
                                        Seja bem-vindo ao Condomínio Max Club Itaim! Este manual reúne informações essenciais para esclarecer dúvidas frequentes e orientar sobre regras, horários e uso das áreas comuns.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                        <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                                            <Building size={20} />
                                        </div>
                                        <h4 className="font-bold text-slate-800">Administradora</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Villa Nova Administradora. Atendimento em dias úteis, horário comercial via WhatsApp: (11) 94340-2075.
                                        </p>
                                    </div>
                                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                        <div className="w-10 h-10 bg-highlight/10 rounded-xl flex items-center justify-center text-highlight">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <h4 className="font-bold text-slate-800">Regras de Convivência</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            Consulte o regimento interno para detalhes sobre barulho (lei do silêncio), animais de estimação e coleta de lixo.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'financas' && (
                            <>
                                <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
                                    <CreditCard className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10" />
                                    <h3 className="text-2xl font-black mb-8">Taxa Condominial</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                                        {[
                                            { dorms: '1 dormitório', val: 'R$ 186,13' },
                                            { dorms: '2 dormitórios', val: 'R$ 343,56' },
                                            { dorms: '3 dormitórios', val: 'R$ 418,34' },
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">{item.dorms}</span>
                                                <span className="text-xl font-bold text-primary">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-8 text-xs text-slate-400 leading-relaxed italic">
                                        * Valores divididos de acordo com a fração ideal. Variam conforme custos (Água, Luz e Gás das áreas comuns) e rateios aprovados.
                                    </p>
                                </div>

                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Zap className="text-highlight" size={20} /> Contas de Consumo
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Rateio no Boleto</span>
                                            <p className="text-sm font-bold text-slate-700">Água e Luz (Áreas Comuns)</p>
                                        </div>
                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Consumo Individual (unidade)</span>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 font-medium">Gás (Comgás)</span>
                                                    <a href="https://wa.me/551133250197" className="text-primary font-bold">(11) 3325-0197</a>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600 font-medium">Luz (Enel)</span>
                                                    <a href="https://wa.me/5521996019608" className="text-primary font-bold">(21) 99601-9608</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'lazer' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Clock className="text-primary" size={20} /> Áreas de Uso Livre
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { icon: <Droplets size={16} />, name: 'Piscina', time: '08h às 22h', note: 'Fecha segundas para manutenção' },
                                            { icon: <Building size={16} />, name: 'Quadra Poliesportiva', time: '08h às 22h', note: 'Uso livre (Agenda apenas p/ rede)' },
                                            { icon: <Baby size={16} />, name: 'Brinquedoteca', time: '08h às 22h' },
                                            { icon: <Scissors size={16} />, name: 'Espaço Mulher', time: '08h às 22h' },
                                            { icon: <Coffee size={16} />, name: 'Coworking', time: '08h às 22h' },
                                            { icon: <Dumbbell size={16} />, name: 'Academia', time: '05h às 23h' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-slate-400">{item.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">{item.name}</p>
                                                        {item.note && <p className="text-[10px] text-primary font-medium">{item.note}</p>}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-slate-500">{item.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
                                        <h4 className="font-bold mb-4 flex items-center gap-2">
                                            <Smartphone className="text-primary" size={20} /> Áreas Agendáveis
                                        </h4>
                                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">Uso mediante agendamento prévio pelo aplicativo Gruvi.</p>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                                <span className="text-sm font-bold">Salão de Festas & Churrasqueira</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase">10h às 22h</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-primary/20">
                                                <div>
                                                    <span className="text-sm font-bold block">Rede de Vôlei (Quadra)</span>
                                                    <span className="text-[9px] text-primary font-bold uppercase">Solicitação de montagem</span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase">08h às 20h</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary/10 border border-primary/20 p-8 rounded-[2.5rem] text-primary">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info size={18} />
                                            <h4 className="font-black text-xs uppercase tracking-widest">Taxa de Reserva</h4>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">
                                            R$ 75,00 (5% do salário mínimo) cobrados no boleto. Necessário estar adimplente para reservar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'regras' && (
                            <div className="space-y-8">
                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                        <MapPin className="text-primary" size={28} /> Mudanças
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dias permitidos</span>
                                                <p className="text-lg font-bold text-slate-700">Segunda a Sábado</p>
                                                <p className="text-xs text-secondary font-bold italic">Proibido Domingos e Feriados</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Períodos Sugeridos</span>
                                                <p className="text-sm font-bold text-slate-600">Manhã (08h às 13h) <br /> Tarde (13h às 17h)</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl flex flex-col justify-center">
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                O agendamento da mudança deve ser realizado com antecedência mínima de 48h através do aplicativo Gruvi.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                                        <Hammer className="text-highlight" size={28} /> Reformas
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                                <span className="text-sm font-medium text-slate-600">Segunda a Sexta</span>
                                                <span className="text-sm font-black text-slate-900">08h às 17h</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3 border-b border-slate-50">
                                                <span className="text-sm font-medium text-slate-600">Sábado</span>
                                                <span className="text-sm font-black text-slate-900">09h às 17h</span>
                                            </div>
                                            <div className="flex justify-between items-center py-3">
                                                <span className="text-sm font-medium text-slate-600">Domingos e Feriados</span>
                                                <span className="text-sm font-black text-secondary">PROIBIDO</span>
                                            </div>
                                        </div>
                                        <div className="bg-highlight/5 p-6 rounded-3xl flex items-center">
                                            <p className="text-xs text-highlight font-bold leading-relaxed italic">
                                                Para qualquer obra na unidade, é necessária a apresentação de RRT/ART assinada por profissional habilitado à administração.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'infra' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Phone className="text-primary" size={20} /> Interfones Úteis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { name: 'Portaria', val: '900' },
                                            { name: 'Salão Festas', val: '007' },
                                            { name: 'Espaço Mulher', val: '008' },
                                            { name: 'Lavanderia', val: '022' },
                                            { name: 'Coworking', val: 'A Definir' },
                                            { name: 'Academia', val: 'A Definir' },
                                        ].map((int, i) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-2xl flex flex-col items-center">
                                                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{int.name}</span>
                                                <span className="text-lg font-black text-slate-800 tracking-widest">{int.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            <Car className="text-secondary" size={20} /> Vagas de Garagem
                                        </h4>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            Unidades de 2 e 3 dormitórios possuem direito a 1 vaga. <br />
                                            Unidades de 1 dormitório (final 9) não possuem vaga.
                                        </p>
                                        <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                                            <p className="text-[11px] text-secondary font-black italic uppercase">
                                                A posição (presa/solta) e o número da vaga são definidos via sorteio bienal.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
                                        <h4 className="font-bold flex items-center gap-2">
                                            <Zap className="text-primary" size={20} /> Voltagem
                                        </h4>
                                        <p className="text-sm text-slate-400 font-medium">
                                            As unidades possuem voltagem mista: 110v e 220v.
                                        </p>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                            <p className="text-xs font-bold leading-relaxed">
                                                <span className="text-primary">220v:</span> Reservado apenas ao chuveiro. <br />
                                                <span className="text-primary">110v:</span> Todas as demais tomadas da unidade.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Footer Tip */}
                <div className="mt-20 text-center space-y-6">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-slate-400">
                        <Users size={24} />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Ainda tem dúvidas?</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                            Nossa equipe de gestão está à disposição para ajudar você. Entre em contato pelos canais oficiais na tela inicial.
                        </p>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 text-center">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">MaxClubItaim Experience • Condomínio Inteligente</p>
            </footer>
        </div>
    );
}

export default ManualMaxClub;
