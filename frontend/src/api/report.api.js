import api from './axiosInstance.js';

export const downloadJSON = (testId) =>
    api.get(`/reports/${testId}/json`, { responseType: 'blob' });
export const downloadCSV = (testId) =>
    api.get(`/reports/${testId}/csv`, { responseType: 'blob' });
export const downloadPDF = (testId) =>
    api.get(`/reports/${testId}/pdf`, { responseType: 'blob' });
