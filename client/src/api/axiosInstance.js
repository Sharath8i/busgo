import axios from 'axios';
import { store } from '../redux/store';
import { setCredentials, logout } from '../features/auth/authSlice';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const reqPath = `${original.baseURL || ''}${original.url || ''}`;
    const isLogin = reqPath.includes('auth/login') || (original.url || '').includes('auth/login');
    const isRefresh = reqPath.includes('refresh-token') || (original.url || '').includes('refresh-token');
    if (err.response?.status === 401 && !original._retry && !isLogin && !isRefresh) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        store.dispatch(setCredentials(data));
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        store.dispatch(logout());
      }
    }
    return Promise.reject(err);
  }
);

export default api;
