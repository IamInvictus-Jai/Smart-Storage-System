import PropTypes from 'prop-types';
import { Image, Video, FileText, Music, Archive, File, Download, Trash2 } from 'lucide-react';

const getFileIcon = (fileType) => {
  if (!fileType) return File;
  
  const type = fileType.toLowerCase();
  
  if (type === 'image') return Image;
  if (type === 'video') return Video;
  if (type === 'audio') return Music;
  if (type === 'document' || type === 'pdf') return FileText;
  if (type === 'archive') return Archive;
  
  return File;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const FileCard = ({ file, onPreview, onDownload, onDelete }) => {
  const IconComponent = getFileIcon(file.file_type);
  const isImage = file.file_type === 'image' || file.category === 'images';
  const displayName = file.metadata?.original_filename || file.filename;
  
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden hover:border-secondary transition-colors group">
      {/* Thumbnail or Icon */}
      <div 
        className="h-48 bg-surface-hover flex items-center justify-center cursor-pointer"
        onClick={() => onPreview(file)}
      >
        {isImage && file.url ? (
          <img 
            src={file.url}
            alt={displayName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <IconComponent className="w-16 h-16 text-text-muted group-hover:text-secondary transition-colors" />
        )}
      </div>
      
      {/* File Info */}
      <div className="p-4">
        <h3 
          className="text-text font-medium truncate mb-1 cursor-pointer hover:text-secondary"
          onClick={() => onPreview(file)}
          title={displayName}
        >
          {displayName}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>{formatFileSize(file.file_size)}</span>
          <span>{formatDate(file.created_at || file.uploaded_at)}</span>
        </div>
        
        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onPreview(file)}
            className="flex-1 px-3 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors text-sm font-medium"
          >
            Preview
          </button>
          <button
            onClick={() => onDownload(file)}
            className="px-3 py-2 bg-surface-hover text-text rounded-lg hover:bg-border transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(file)}
              className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

FileCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    file_size: PropTypes.number.isRequired,
    file_type: PropTypes.string,
    category: PropTypes.string,
    created_at: PropTypes.string,
    metadata: PropTypes.object,
  }).isRequired,
  onPreview: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};
