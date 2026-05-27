import api from './axiosInstance.js';

export const startTest = (data) => api.post('/tests/run', data);
export const cancelTest = (id) => api.delete(`/tests/${id}/cancel`);
export const getTests = (params) => api.get('/tests', { params });
export const getTestById = (id) => api.get(`/tests/${id}`);
export const deleteTest = (id) => api.delete(`/tests/${id}`);
