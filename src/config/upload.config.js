// Upload Configuration
export const UPLOAD_CONFIG = {
    // Polling interval for job status (milliseconds)
    POLLING_INTERVAL: 5000,

    // Maximum file size (50MB)
    MAX_FILE_SIZE: 50 * 1024 * 1024,

    // Allowed file types
    ALLOWED_FILE_TYPES: ['.json'],

    // Auto close success modal delay (optional, set to null to disable)
    AUTO_CLOSE_SUCCESS_DELAY: null,

    // Variance level colors
    VARIANCE_COLORS: {
        low: 'text-green-500',
        medium: 'text-yellow-500',
        high: 'text-orange-500',
        extreme: 'text-red-500',
    },

    // Storage type colors
    STORAGE_COLORS: {
        sql: 'bg-blue-500',
        nosql: 'bg-green-500',
    },
};
