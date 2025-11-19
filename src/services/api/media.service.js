// Media service
import { apiClient } from "./client";

export const mediaService = {
  async getCategories(refresh = false) {
    const response = await apiClient.get("/api/files/categories", {
      params: { refresh },
    });
    return response.data;
  },

  async refreshCategories() {
    const response = await apiClient.get("/api/files/categories", {
      params: { refresh: true },
    });
    return response.data;
  },

  async getFilesByCategory(categories, refresh = false) {
    const response = await apiClient.get("/api/files/by-category", {
      params: { categories: categories.join(","), refresh },
    });
    return response.data;
  },

  async refreshFilesByCategory(categories) {
    const response = await apiClient.get("/api/files/by-category", {
      params: { categories: categories.join(","), refresh: true },
    });
    return response.data;
  },

  async uploadMedia(files, { onUploadProgress } = {}) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    // Let axios set the Content-Type (including the boundary). Do not set it manually.
    const response = await apiClient.post("/api/media/upload", formData, {
      onUploadProgress,
    });
    return response.data;
  },

  async getUploadStatus(jobId) {
    const response = await apiClient.get(`/api/media/upload/status/${jobId}`);
    return response.data;
  },

  async deleteFile(fileId) {
    const response = await apiClient.delete(`/api/files/${fileId}`);
    return response.data;
  },
};
