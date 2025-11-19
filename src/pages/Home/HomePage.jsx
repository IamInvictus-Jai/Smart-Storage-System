import { useState } from 'react';
import { Upload } from 'lucide-react';
import { MediaCategories } from '../../components/media/MediaCategories';
import { DataEntities } from '../../components/data/DataEntities';
import { FileUploadZone } from '../../components/media/FileUploadZone';
import { useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../../services/api/media.service';

export const HomePage = () => {
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  const handleUploadComplete = async () => {
    try {
      // Force backend to refresh from database
      const freshData = await mediaService.refreshCategories();
      
      // Update the cache with fresh data
      queryClient.setQueryData(['media-categories', false], freshData);
      
      // Invalidate all file queries
      queryClient.invalidateQueries({ queryKey: ['files-by-category'] });
      
      setShowUpload(false);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      // Fallback to regular invalidation
      queryClient.invalidateQueries({ queryKey: ['media-categories'] });
      setShowUpload(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>
      
      {/* Media Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-text mb-4">Media</h2>
        <MediaCategories />
      </section>
      
      {/* Data Section */}
      <section>
        <h2 className="text-2xl font-semibold text-text mb-4">Data</h2>
        <DataEntities />
      </section>

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
