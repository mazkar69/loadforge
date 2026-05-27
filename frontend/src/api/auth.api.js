import api from './axiosInstance.js';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = (refreshToken) => api.post('/auth/logout', { refreshToken });
export const refreshTokens = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/me', data);
