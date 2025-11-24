import api from './axios';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user)); // Assuming user info is returned
    }
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async verifyForgotPasswordOTP(email, otp) {
    const response = await api.post('/auth/verify-forgot-password-otp', { email, otp });
    return response.data; // Should return a temp token for password reset
  },

  async changePassword(newPassword, token) {
     // The token might need to be passed in headers or body depending on backend implementation
     // Based on route: verifyForgotPasswordTokenMiddleware is used, so likely Authorization header
     const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
     };
    const response = await api.post('/auth/change-password', { newPassword }, config);
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Optional: Call backend logout endpoint
    // api.post('/auth/logout');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },
  
  isAuthenticated() {
      return !!localStorage.getItem('accessToken');
  }
};
