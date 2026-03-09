import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoorPasswords from './pages/DoorPasswords';
import AccessRegister from './pages/AccessRegister';
import Suggestions from './pages/Suggestions';
import VolleyballBooking from './pages/VolleyballBooking';
import CleaningHistory from './pages/CleaningHistory';
import AdminCleaning from './pages/AdminCleaning';
import AdminAvisos from './pages/AdminAvisos';
import AdminSuggestions from './pages/AdminSuggestions';
import AdminAgenda from './pages/AdminAgenda';
import AdminVolleyball from './pages/AdminVolleyball';
import AdminUsers from './pages/AdminUsers';
import PublicAgenda from './pages/PublicAgenda';
import LostFound from './pages/LostFound';
import ManualMaxClub from './pages/ManualMaxClub';
import AdminLostFound from './pages/AdminLostFound';
import AdminParking from './pages/AdminParking';
import AdminOverview from './pages/AdminOverview';
import AdminMaintenance from './pages/AdminMaintenance';

// Mock/Lazy loading placeholders
const ProtectedRoute = ({ children, allowedProfiles = [] }) => {
    // ...
    const { user, profile, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    if (!user) return <Navigate to="/login" replace />;

    if (allowedProfiles.length > 0 && !allowedProfiles.includes(profile?.perfil)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
    >
        {children}
    </motion.div>
);

function AppContent() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
                <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
                <Route path="/acesso" element={<PageWrapper><AccessRegister /></PageWrapper>} />
                <Route path="/sugestoes" element={<PageWrapper><Suggestions /></PageWrapper>} />
                <Route path="/volei" element={<PageWrapper><VolleyballBooking /></PageWrapper>} />
                <Route path="/limpeza" element={<PageWrapper><CleaningHistory /></PageWrapper>} />
                <Route path="/agenda" element={<PageWrapper><PublicAgenda /></PageWrapper>} />
                <Route path="/achados" element={<PageWrapper><LostFound /></PageWrapper>} />
                <Route path="/manual-maxclub" element={<PageWrapper><ManualMaxClub /></PageWrapper>} />

                {/* Admin Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedProfiles={['OPERADOR', 'GESTOR', 'ADM']}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<PageWrapper><AdminOverview /></PageWrapper>} />
                    <Route path="senhas" element={<PageWrapper><DoorPasswords /></PageWrapper>} />
                    <Route path="limpeza" element={<PageWrapper><AdminCleaning /></PageWrapper>} />
                    <Route path="avisos" element={<PageWrapper><AdminAvisos /></PageWrapper>} />
                    <Route path="sugestoes" element={<PageWrapper><AdminSuggestions /></PageWrapper>} />
                    <Route path="agenda" element={<PageWrapper><AdminAgenda /></PageWrapper>} />
                    <Route path="volei" element={<PageWrapper><AdminVolleyball /></PageWrapper>} />
                    <Route path="achados" element={<PageWrapper><AdminLostFound /></PageWrapper>} />
                    <Route path="manutencao" element={<PageWrapper><AdminMaintenance /></PageWrapper>} />
                    <Route path="vagas" element={<PageWrapper><AdminParking /></PageWrapper>} />
                    <Route
                        path="usuarios"
                        element={
                            <ProtectedRoute allowedProfiles={['GESTOR', 'ADM']}>
                                <PageWrapper><AdminUsers /></PageWrapper>
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
