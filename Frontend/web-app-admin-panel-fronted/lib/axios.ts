import axios from 'axios';

const API_URL = 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies if needed, though we might use localStorage for tokens initially
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors (token expiration)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh token
        // Note: This assumes a refresh token endpoint exists and works with cookies or another mechanism
        // For now, we might just redirect to login if refresh fails
        // const refreshToken = localStorage.getItem('refreshToken');
        // const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        // localStorage.setItem('accessToken', data.accessToken);
        // api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        // return api(originalRequest);
        
        // Simple fallback: logout
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
