import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [morador, setMorador] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Recupera morador logado internamente
        const savedMorador = localStorage.getItem('maxclub_morador');
        if (savedMorador) {
            try {
                setMorador(JSON.parse(savedMorador));
            } catch (e) {
                localStorage.removeItem('maxclub_morador');
            }
        }
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('perfis')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
    
    const signOut = async () => {
        await supabase.auth.signOut();
        logoutMorador();
    };

    const loginMorador = async (unidade, senha) => {
        const { data, error } = await supabase.rpc('login_morador', {
            p_unidade: unidade,
            p_senha: senha
        });

        if (error) throw error;

        // data já é um objeto parseado (json_build_object retorna json direto no cliente js)
        setMorador(data);
        localStorage.setItem('maxclub_morador', JSON.stringify(data));
        return data;
    };

    const logoutMorador = () => {
        setMorador(null);
        localStorage.removeItem('maxclub_morador');
    };

    const updateMorador = (newData) => {
        const updated = { ...morador, ...newData };
        setMorador(updated);
        localStorage.setItem('maxclub_morador', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ 
            user, profile, loading, signIn, signOut, 
            morador, loginMorador, logoutMorador, updateMorador 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
