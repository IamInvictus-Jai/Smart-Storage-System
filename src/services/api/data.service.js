// Data service for database entities
import { apiClient } from './client';

export const dataService = {
    async getEntities() {
        const response = await apiClient.get('/api/data/entities');
        return response.data;
    },

    async getEntityData(entityName, page = 1, limit = 50) {
        const response = await apiClient.post(`/api/data/query`, {
            entity:entityName,
            limit,
            offset:page
        });
        return response.data;
    },

    async createRecord(entityName, data) {
        const response = await apiClient.post(`/api/data/entities/${entityName}`, data);
        return response.data;
    },

    async updateRecord(entityName, recordId, data) {
        const response = await apiClient.put(`/api/data/entities/${entityName}/${recordId}`, data);
        return response.data;
    },

    async deleteRecord(entityName, recordId) {
        const response = await apiClient.delete(`/api/data/entities/${entityName}/${recordId}`);
        return response.data;
    },

    async searchEntity(entityName, query) {
        const response = await apiClient.get(`/api/data/entities/${entityName}/search`, {
            params: { q: query },
        });
        return response.data;
    },
};
