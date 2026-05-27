import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth.api.js';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            login: async (credentials) => {
                const { data } = await authApi.login(credentials);
                const { accessToken, refreshToken, user } = data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, accessToken, refreshToken, isAuthenticated: true });
                return user;
            },

            register: async (userData) => {
                const { data } = await authApi.register(userData);
                const { accessToken, refreshToken, user } = data.data;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, accessToken, refreshToken, isAuthenticated: true });
                return user;
            },

            logout: async () => {
                const { refreshToken } = get();
                try {
                    if (refreshToken) await authApi.logout(refreshToken);
                } catch (_) {
                    // Ignore logout errors
                }
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
            },

            fetchProfile: async () => {
                const { data } = await authApi.getProfile();
                set({ user: data.data.user });
                return data.data.user;
            },

            updateProfile: async (profileData) => {
                const { data } = await authApi.updateProfile(profileData);
                set({ user: data.data.user });
                return data.data.user;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
