import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, Trash2, Upload, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';
import { useQueryClient } from '@tanstack/react-query';
import { useFilesByCategory } from '../../hooks/useFilesByCategory';
import { mediaService } from '../../services/api/media.service';
import { SearchBar } from '../../components/common/SearchBar';
import { FileCard } from '../../components/media/FileCard';
import { FilePreviewModal } from '../../components/media/FilePreviewModal';
import { FileUploadZone } from '../../components/media/FileUploadZone';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const FilesPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data, isLoading, error, refetch } = useFilesByCategory([category]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleUploadComplete = async () => {
    try {
      // Force backend to refresh from database
      const freshFiles = await mediaService.refreshFilesByCategory([category]);
      const freshCategories = await mediaService.refreshCategories();
      
      // Update the cache with fresh data
      queryClient.setQueryData(['files-by-category', [category], false], freshFiles);
      queryClient.setQueryData(['media-categories', false], freshCategories);
      
      setShowUpload(false);
    } catch (error) {
      console.error('Failed to refresh files:', error);
      // Fallback to regular invalidation
      queryClient.invalidateQueries({ queryKey: ['files-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['media-categories'] });
      setShowUpload(false);
    }
  };
  
  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!data?.files) return [];
    
    // Log first file to debug
    if (data.files.length > 0) {
      console.log('Sample file data:', data.files[0]);
    }
    
    if (!searchQuery.trim()) return data.files;
    
    const query = searchQuery.toLowerCase();
    return data.files.filter(file => {
      const displayName = file.metadata?.original_filename || file.filename;
      return displayName.toLowerCase().includes(query);
    });
  }, [data?.files, searchQuery]);
  
  const handleDownload = async (file) => {
    try {
      const displayName = file.metadata?.original_filename || file.filename;
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = displayName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };
  
  const handleDelete = async (file) => {
    setFileToDelete(file);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/files/${fileToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Force backend to refresh from database
      try {
        const freshFiles = await mediaService.refreshFilesByCategory([category]);
        const freshCategories = await mediaService.refreshCategories();
        
        queryClient.setQueryData(['files-by-category', [category], false], freshFiles);
        queryClient.setQueryData(['media-categories', false], freshCategories);
      } catch (error) {
        console.error('Failed to refresh after delete:', error);
        queryClient.invalidateQueries({ queryKey: ['files-by-category'] });
        queryClient.invalidateQueries({ queryKey: ['media-categories'] });
      }
      
      setFileToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchDownload = async () => {
    if (filteredFiles.length === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: filteredFiles.length });
    
    try {
      const zip = new JSZip();
      
      // Download all files and add to zip
      for (let i = 0; i < filteredFiles.length; i++) {
        const file = filteredFiles[i];
        const displayName = file.metadata?.original_filename || file.filename;
        
        setDownloadProgress({ current: i + 1, total: filteredFiles.length });
        
        try {
          const response = await fetch(file.url);
          const blob = await response.blob();
          zip.file(displayName, blob);
        } catch (error) {
          console.error(`Failed to download ${displayName}:`, error);
          // Continue with other files even if one fails
        }
      }
      
      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download the zip
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${category}-files-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Batch download failed:', error);
      alert('Failed to create zip file. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 h-8 bg-surface-hover rounded animate-pulse w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-80 bg-surface-hover rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-red-500 mb-4">Failed to load files</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </button>
        
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-text capitalize">{category}</h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
              title="Refresh files"
            >
              <RefreshCw className={`w-5 h-5 text-text ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-hover text-text rounded-lg hover:bg-border transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            
            {filteredFiles.length > 0 && (
              <button
                onClick={handleBatchDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading {downloadProgress.current}/{downloadProgress.total}...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download All as ZIP ({filteredFiles.length})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder={`Search ${category}...`}
          className="max-w-md"
        />
      </div>
      
      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-secondary">
            {searchQuery ? 'No files match your search' : `No ${category} files found`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onPreview={setSelectedFile}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      
      {/* Preview Modal */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Delete Confirmation */}
      {fileToDelete && (
        <ConfirmDialog
          title="Delete File"
          message={`Are you sure you want to delete "${fileToDelete.metadata?.original_filename || fileToDelete.filename}"? This action cannot be undone.`}
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setFileToDelete(null)}
          variant="danger"
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <FileUploadZone
          onUpload={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};
