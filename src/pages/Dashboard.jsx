import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
    Trophy
} from 'lucide-react';
import { useNavigate, Link, Outlet } from 'react-router-dom';

function Dashboard() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Visão Geral', path: '/dashboard', access: ['OPERADOR', 'GESTOR', 'ADM'] },
        { icon: <ClipboardList size={20} />, label: 'Limpeza', path: '/dashboard/limpeza', access: ['OPERADOR', 'GESTOR', 'ADM'] },
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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col">
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
                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 hover:text-primary transition-all group"
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
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">Painel de Controle</h2>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar no painel..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
