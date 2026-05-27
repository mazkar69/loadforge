import useAuthStore from '../store/authStore.js';

const useAuth = () => {
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const login = useAuthStore((s) => s.login);
    const register = useAuthStore((s) => s.register);
    const logout = useAuthStore((s) => s.logout);
    const fetchProfile = useAuthStore((s) => s.fetchProfile);
    const updateProfile = useAuthStore((s) => s.updateProfile);

    return { user, isAuthenticated, login, register, logout, fetchProfile, updateProfile };
};

export default useAuth;
