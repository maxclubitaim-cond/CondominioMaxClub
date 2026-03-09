import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/acesso" element={<AccessRegister />} />
                    <Route path="/sugestoes" element={<Suggestions />} />
                    <Route path="/volei" element={<VolleyballBooking />} />
                    <Route path="/limpeza" element={<CleaningHistory />} />
                    <Route path="/agenda" element={<PublicAgenda />} />
                    <Route path="/achados" element={<LostFound />} />
                    <Route path="/manual-maxclub" element={<ManualMaxClub />} />

                    {/* Admin Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedProfiles={['OPERADOR', 'GESTOR', 'ADM']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminOverview />} />
                        <Route path="senhas" element={<DoorPasswords />} />
                        <Route path="limpeza" element={<AdminCleaning />} />
                        <Route path="avisos" element={<AdminAvisos />} />
                        <Route path="sugestoes" element={<AdminSuggestions />} />
                        <Route path="agenda" element={<AdminAgenda />} />
                        <Route path="volei" element={<AdminVolleyball />} />
                        <Route path="achados" element={<AdminLostFound />} />
                        <Route path="manutencao" element={<AdminMaintenance />} />
                        <Route path="vagas" element={<AdminParking />} />
                        <Route
                            path="usuarios"
                            element={
                                <ProtectedRoute allowedProfiles={['GESTOR', 'ADM']}>
                                    <AdminUsers />
                                </ProtectedRoute>
                            }
                        />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
