import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Download } from 'lucide-react';

export const FilePreviewModal = ({ file, onClose, onDownload }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);
  
  const renderPreview = () => {
    const fileUrl = file.url;
    const displayName = file.metadata?.original_filename || file.filename;
    const isImage = file.file_type === 'image' || file.category === 'images';
    const isVideo = file.file_type === 'video' || file.category === 'videos';
    const isAudio = file.file_type === 'audio' || file.category === 'audio';
    const isPdf = file.extension === '.pdf';
    const isText = file.file_type === 'text' || file.category === 'documents';
    
    if (isImage) {
      return (
        <img 
          src={fileUrl}
          alt={displayName}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          style={{ 
            maxHeight: 'calc(95vh - 140px)',
            maxWidth: '95vw'
          }}
          onError={(e) => {
            console.error('Image load error:', e);
            e.target.style.display = 'none';
          }}
        />
      );
    }
    
    if (isVideo) {
      return (
        <video 
          controls 
          className="max-w-full max-h-full rounded-lg shadow-2xl"
          style={{ 
            maxHeight: 'calc(95vh - 140px)',
            maxWidth: '95vw'
          }}
          src={fileUrl}
        >
          Your browser does not support video playback.
        </video>
      );
    }
    
    if (isAudio) {
      return (
        <div className="w-full max-w-2xl bg-surface/90 p-8 rounded-lg shadow-2xl backdrop-blur-sm">
          <audio controls className="w-full" src={fileUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }
    
    if (isPdf) {
      return (
        <iframe 
          src={fileUrl}
          className="w-full rounded-lg shadow-2xl bg-white"
          style={{ 
            height: 'calc(95vh - 140px)',
            maxWidth: '95vw'
          }}
          title={displayName}
        />
      );
    }
    
    if (isText) {
      return (
        <iframe 
          src={fileUrl}
          className="w-full rounded-lg shadow-2xl bg-white"
          style={{ 
            height: 'calc(95vh - 140px)',
            maxWidth: '95vw'
          }}
          title={displayName}
        />
      );
    }
    
    return (
      <div className="p-8 text-center bg-surface/90 rounded-lg shadow-2xl backdrop-blur-sm">
        <p className="text-text-secondary mb-4">
          Preview not available for this file type
        </p>
        <p className="text-text-muted text-sm mb-4">
          Type: {file.file_type || 'Unknown'} | Extension: {file.extension || 'Unknown'}
        </p>
      </div>
    );
  };
  
  const displayName = file.metadata?.original_filename || file.filename;
  const isImage = file.file_type === 'image' || file.category === 'images';
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/80"
      onClick={onClose}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Close button - Top Right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-surface/90 hover:bg-surface rounded-full transition-colors shadow-lg z-10"
        title="Close (ESC)"
      >
        <X className="w-6 h-6 text-text" />
      </button>
      
      {/* Content Container */}
      <div 
        className="flex flex-col items-center justify-center max-w-[95vw] max-h-[95vh] gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Name - Top */}
        <div className="text-center px-4 py-2 bg-surface/90 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-sm text-text font-medium truncate max-w-[80vw]">
            {displayName}
          </p>
        </div>
        
        {/* Image - Center */}
        <div className="flex items-center justify-center max-w-full max-h-[calc(95vh-140px)]">
          {renderPreview()}
        </div>
        
        {/* Download Button - Bottom */}
        <button
          onClick={() => onDownload(file)}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity shadow-lg font-medium"
        >
          <Download className="w-5 h-5" />
          Download
        </button>
      </div>
    </div>
  );
};

FilePreviewModal.propTypes = {
  file: PropTypes.shape({
    filename: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    file_type: PropTypes.string,
    category: PropTypes.string,
    extension: PropTypes.string,
    metadata: PropTypes.object,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};
