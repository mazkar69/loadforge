import api from './axiosInstance.js';

export const getCollections = (params) => api.get('/collections', { params });
export const getCollectionById = (id) => api.get(`/collections/${id}`);
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);
export const duplicateCollection = (id) => api.post(`/collections/${id}/duplicate`);
export const exportCollection = (id) => api.get(`/collections/${id}/export`);
export const importCollection = (data) => api.post('/collections/import', data);
export const addRequest = (id, data) => api.post(`/collections/${id}/requests`, data);
export const deleteRequest = (id, requestId) => api.delete(`/collections/${id}/requests/${requestId}`);
export const addFolder = (id, data) => api.post(`/collections/${id}/folders`, data);
