import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { IUserResponseDTO } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
    user: IUserResponseDTO | null;
    isLoading: boolean;
    login: (login: string, password: string) => Promise<void>;
    register: (name: string, login: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUserResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };
    const login = async (login: string, password: string) => {
        try {
            const response = await authApi.login({ login, password });
            if (response.user) {
                setUser(response.user);
            }
        } catch (error) {
            throw error;
        }
    };

    const register = async (name: string, login: string, password: string) => {
        try {
            const response = await authApi.register({ name, login, password });
            setUser(response.newUser);
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw error;
            }
            try {
                const loginResponse = await authApi.login({ login, password });
                if (loginResponse.user) {
                    setUser(loginResponse.user);
                }
            } catch {
                throw error;
            }
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};