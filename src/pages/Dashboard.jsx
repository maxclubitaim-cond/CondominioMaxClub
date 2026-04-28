import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Settings,
    Trash2,
    Plus,
    LogOut,
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Key as KeyIcon,
    Package,
    Wrench,
    Shield,
    Search,
    Bell,
    MessageSquare,
    Trophy,
    ClipboardCheck,
    Menu,
    X as CloseIcon,
    Ticket
} from 'lucide-react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Info, BellRing } from 'lucide-react';

function Dashboard() {
    const { profile, signOut } = useAuth();
    const { permission, subscribeUser, subscribing } = usePushNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [showPushBanner, setShowPushBanner] = React.useState(true);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Visão Geral', path: '/dashboard', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <ClipboardList size={20} />, label: 'Limpeza', path: '/dashboard/limpeza', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <ClipboardCheck size={20} />, label: 'Checklist Salão', path: '/dashboard/checklist-salao', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <Bell size={20} />, label: 'Avisos', path: '/dashboard/avisos', access: ['GESTOR', 'ADM'] },
        { icon: <Calendar size={20} />, label: 'Agenda', path: '/dashboard/agenda', access: ['GESTOR', 'ADM'] },
        { icon: <Trophy size={20} />, label: 'Vôlei', path: '/dashboard/volei', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <KeyIcon size={20} />, label: 'Senhas Portas', path: '/dashboard/senhas', access: ['GESTOR', 'ADM'] },
        { icon: <MessageSquare size={20} />, label: 'Sugestões', path: '/dashboard/sugestoes', access: ['GESTOR', 'ADM'] },
        { icon: <Package size={20} />, label: 'Achados e Perdidos', path: '/dashboard/achados', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <Wrench size={20} />, label: 'Manutenção', path: '/dashboard/manutencao', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <Shield size={20} />, label: 'Histórico de Acessos', path: '/dashboard/acessos', access: ['GESTOR', 'ADM'] },
        { icon: <Search size={20} />, label: 'Vagas', path: '/dashboard/vagas', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <Ticket size={20} />, label: 'Pulseiras', path: '/dashboard/pulseiras', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <Users size={20} />, label: 'Usuários', path: '/dashboard/usuarios', access: ['GESTOR', 'ADM'] },
    ];

    const allowedItems = profile?.perfil ? menuItems.filter(item => item.access.includes(profile.perfil)) : [];

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop & Mobile Drawer) */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col border-r border-white/5
            `}>
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                            <Settings className="text-primary w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-lg tracking-tight leading-none mb-1">MaxClub</span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Painel Gestão</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {allowedItems.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all group ${
                                location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className={`transition-transform duration-300 ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold uppercase text-sm border border-primary/20">
                            {profile?.nome?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate uppercase tracking-wider">{profile?.nome || 'Usuário'}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{profile?.perfil}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-rose-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rose-500/10 transition-all group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-3 text-slate-600 bg-slate-100/50 hover:bg-slate-200/50 rounded-2xl md:hidden transition-all"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-lg md:text-2xl font-bold text-slate-900 truncate max-w-[150px] md:max-w-none tracking-tight">
                                {menuItems.find(i => i.path === location.pathname)?.label || 'Painel de Controle'}
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">MaxClub Itaim Paulista</span>
                        </div>
                    </div>
                    
                    <div className="relative max-w-[160px] md:max-w-xs w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar funcionalidades..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-100/50 border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-xs font-medium focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-inner"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Push Notification Banner */}
                    {/* O banner de notificações de gestão foi removido para evitar confusão com o novo sistema focado apenas em moradores */}

                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
