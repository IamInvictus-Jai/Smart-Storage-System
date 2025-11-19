// Admin service
import { apiClient } from './client';

export const adminService = {
    async getAllUsers() {
        const response = await apiClient.get('/auth/admin/users');
        return response.data;
    },

    async updateUserRole(userId, newRole) {
        const response = await apiClient.put(`/auth/admin/users/${userId}/role`, {
            new_role: newRole,
        });
        return response.data;
    },

    async getSystemStats() {
        const response = await apiClient.get('/api/admin/stats');
        return response.data;
    },
};
