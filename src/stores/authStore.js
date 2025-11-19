// Auth store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (token, user) => {
                localStorage.setItem('auth_token', token);
                set({ token, user, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({ token: null, user: null, isAuthenticated: false });
            },

            updateUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
