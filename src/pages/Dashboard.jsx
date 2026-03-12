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
    X as CloseIcon
} from 'lucide-react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';

function Dashboard() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
        { icon: <Shield size={20} />, label: 'Histórico de Acessos', path: '/dashboard/acessos', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <Search size={20} />, label: 'Vagas', path: '/dashboard/vagas', access: ['GESTOR', 'ADM'] },
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
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                flex flex-col
            `}>
                <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Settings className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800">Admin MaxClub</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workspace</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {allowedItems.map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 font-semibold text-sm rounded-xl transition-all group ${
                                location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                            }`}
                        >
                            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                            {profile?.nome?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-800 truncate">{profile?.nome || 'Usuário'}</p>
                            <p className="text-xs text-slate-500 font-medium">{profile?.perfil}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-secondary font-bold text-sm rounded-xl hover:bg-secondary/10 transition-all"
                    >
                        <LogOut size={20} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg md:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-sm md:text-lg font-bold text-slate-800 truncate max-w-[150px] md:max-w-none">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Painel de Controle'}
                        </h2>
                    </div>
                    
                    <div className="relative max-w-[140px] md:max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 md:w-4 md:h-4" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-8 md:pl-10 pr-4 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] md:text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
