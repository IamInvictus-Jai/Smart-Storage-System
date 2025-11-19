// Auth service
import { apiClient } from './client';

export const authService = {
    async login(email, password) {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    async register(email, password) {
        const response = await apiClient.post('/auth/signup', { email, password });
        return response.data;
    },

    async getProfile() {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    },

    async logout() {
        localStorage.removeItem('auth_token');
    },
};
