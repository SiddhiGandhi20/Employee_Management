import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5220/api',
});

// attach JWT to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// token expired / invalid -> back to login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err) => {
  if (err.response?.status === 403) return 'You are not allowed to do this (Admin only).';
  if (!err.response) return 'Cannot reach the API. Is the backend running?';
  const data = err.response.data;
  return (
    data?.message ||
    (data?.errors && Object.values(data.errors).flat().join(' ')) ||
    'Something went wrong'
  );
};

export default api;
