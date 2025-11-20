// Structured Data Upload Service
import { apiClient } from './client';

export const structuredDataService = {
    /**
     * Analyze uploaded JSON file
     * @param {File} file - JSON file to analyze
     * @returns {Promise} Analysis response
     */
    async analyzeFile(file) {
        const formData = new FormData();
        formData.append('files', file);

        const response = await apiClient.post('/api/data/upload/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },

    /**
     * Execute upload based on analysis
     * @param {string} analysisId - Analysis ID from analyze step
     * @param {Object} decisions - User decisions for each schema
     * @param {boolean} userOverride - Whether user is overriding high variance recommendation
     * @param {boolean} acknowledgeRisks - Whether user acknowledges risks
     * @returns {Promise} Execute response with job_id
     */
    async executeUpload(analysisId, decisions, userOverride = false, acknowledgeRisks = false) {
        const response = await apiClient.post('/api/data/upload/execute', {
            analysis_id: analysisId,
            decisions,
            user_override: userOverride,
            acknowledge_risks: acknowledgeRisks,
        });

        return response.data;
    },

    /**
     * Get upload job status
     * @param {string} jobId - Job ID from execute step
     * @returns {Promise} Job status response
     */
    async getJobStatus(jobId) {
        const response = await apiClient.get(`/api/data/upload/status/${jobId}`);
        return response.data;
    },

    /**
     * Get failed records for a job
     * @param {string} jobId - Job ID
     * @returns {Promise} Failed records
     */
    async getFailedRecords(jobId) {
        const response = await apiClient.get(`/api/data/upload/${jobId}/failed`);
        return response.data;
    },
};
