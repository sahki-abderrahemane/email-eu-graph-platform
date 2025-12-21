'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiService, { AuthResponse } from './api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Check if we're on the client side
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            checkAuth();
        }
    }, [mounted]);

    const checkAuth = async () => {
        // Only run on client side
        if (typeof window === 'undefined') {
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const storedUser = localStorage.getItem('user');

            if (!token) {
                setIsLoading(false);
                return;
            }

            // If we have stored user data, use it immediately for faster UI
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch {
                    // Invalid stored user
                }
            }

            // Then verify token in background (with timeout)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const result = await apiService.verifyToken(token);
                clearTimeout(timeoutId);

                if (result.valid && result.user) {
                    setUser(result.user);
                    localStorage.setItem('user', JSON.stringify(result.user));
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch (verifyError) {
                clearTimeout(timeoutId);
                // If verification fails, keep local user data
                // but allow continued use until next login attempt
                console.warn('Token verification failed:', verifyError);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response: AuthResponse = await apiService.login({ email, password });

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response: AuthResponse = await apiService.register({ name, email, password });

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            setUser(response.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const clearError = () => setError(null);

    // Don't render anything during SSR to prevent hydration mismatch
    if (!mounted) {
        return (
            <AuthContext.Provider
                value={{
                    user: null,
                    isLoading: true,
                    isAuthenticated: false,
                    login,
                    register,
                    logout,
                    token: null,
                    error: null,
                    clearError,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                token: localStorage.getItem('accessToken'),
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
