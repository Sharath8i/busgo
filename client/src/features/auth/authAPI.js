import api from './axiosInstance';

export const loginApi = (body) => api.post('/auth/login', body);
export const registerApi = (body) => api.post('/auth/register', body);
export const logoutApi = () => api.post('/auth/logout');
export const refreshTokenApi = () => api.post('/auth/refresh-token');
export const getMeApi = () => api.get('/auth/me');
