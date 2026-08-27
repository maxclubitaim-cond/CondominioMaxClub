import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Store, 
    ChevronLeft, 
    X, 
    MapPin, 
    User, 
    Image as ImageIcon,
    Loader2,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';

function Entrepreneurs() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [activePhoto, setActivePhoto] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    async function fetchServices() {
        try {
            const { data, error } = await supabase
                .from('empreendedores')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            toast.error('Não foi possível carregar os serviços.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary transition-all font-bold text-sm"
                    >
                        <ChevronLeft size={20} />
                        Voltar
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-lg font-bold text-slate-900 leading-none">Empreendedores</h1>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Comunidade MaxClub</span>
                    </div>
                    <div className="w-10"></div> {/* Placeholder para manter alinhamento */}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Hero Section */}
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <Store size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Serviços da Nossa Gente</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Conheça os produtos e serviços oferecidos pelos seus vizinhos. 
                        Fortaleça o comércio local e facilite o seu dia a dia.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shadow-sm">
                        <Info size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            Morador: anuncie seus serviços através do seu portal.
                        </span>
                    </div>
                </div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="text-primary animate-spin" size={40} />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Carregando vitrine...</p>
                    </div>
                ) : services.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => {
                                    setSelectedService(service);
                                    setActivePhoto(0);
                                }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500 cursor-pointer"
                            >
                                {/* Photo Gallery Preview */}
                                <div className="h-64 relative bg-slate-100 overflow-hidden">
                                    <img 
                                        src={service.fotos[0]} 
                                        alt={service.nome}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {service.fotos.length > 1 && (
                                        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/20">
                                            +{service.fotos.length - 1} fotos
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase text-primary rounded-full shadow-sm">
                                            {service.tipo_servico}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                            <User size={14} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 leading-none">{service.nome}</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unidade {service.unidade}</p>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-4 flex-1">
                                        {service.descricao}
                                    </p>

                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postado em {formatDate(service.created_at)}</span>
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <ImageIcon size={18} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Store size={64} className="mx-auto text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-400 italic mb-2">Vitrine Vazia</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8">Nenhum serviço anunciado ainda.</p>
                    </div>
                )}
            </main>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedService(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="relative h-[300px] md:h-[450px] bg-slate-100 shrink-0 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.img 
                                        key={activePhoto}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        src={selectedService.fotos[activePhoto]} 
                                        className="w-full h-full object-cover"
                                        alt={selectedService.nome}
                                    />
                                </AnimatePresence>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="absolute top-6 right-6 p-3 bg-black/30 backdrop-blur-md text-white rounded-full hover:bg-black/50 transition-all z-10"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-6 left-6 z-10">
                                    <span className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase rounded-full shadow-lg border border-white/20">
                                        {selectedService.tipo_servico}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 overflow-y-auto">
                                {/* Thumbnails Gallery */}
                                {selectedService.fotos.length > 1 && (
                                    <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                                        {selectedService.fotos.map((url, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActivePhoto(idx)}
                                                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                                                    activePhoto === idx ? 'border-primary shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={url} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100 shadow-inner">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 leading-none mb-2">{selectedService.nome}</h3>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin size={14} className="text-primary" /> Unidade {selectedService.unidade}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Sobre o Serviço</h4>
                                        <p className="text-slate-600 text-base leading-relaxed whitespace-pre-wrap">
                                            {selectedService.descricao}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Anunciado em {formatDate(selectedService.created_at)}
                                </span>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="px-8 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest shadow-sm"
                                >
                                    Fechar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Entrepreneurs;

