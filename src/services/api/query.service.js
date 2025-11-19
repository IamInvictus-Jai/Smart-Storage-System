// Query service for AI-powered search
import { apiClient } from './client';

export const queryService = {
    async getSchema(entityName) {
        const response = await apiClient.get(`/api/data/entities/${entityName}/schema`);
        return response.data;
    },

    async executeQuery(query) {
        console.log(query)
        const response = await apiClient.post('/api/data/query', query);
        return response.data;
    },

    async getQueryHistory(limit = 20) {
        const response = await apiClient.get('/api/data/query/history', {
            params: { limit },
        });
        return response.data;
    },

    async deleteQueryHistory(queryId) {
        const response = await apiClient.delete(`/api/data/query/history/${queryId}`);
        return response.data;
    },

    async clearQueryHistory() {
        const response = await apiClient.delete('/api/data/query/history');
        return response.data;
    },
};
