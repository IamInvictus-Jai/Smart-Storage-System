import PropTypes from 'prop-types';
import { Image, Video, FileText, Music, File } from 'lucide-react';

const getCategoryIcon = (categoryName) => {
  const icons = {
    images: Image,
    videos: Video,
    documents: FileText,
    audio: Music,
  };
  return icons[categoryName] || File;
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const CategoryCard = ({ category, onClick }) => {
  const Icon = getCategoryIcon(category.name);
  
  return (
    <button
      onClick={onClick}
      className="bg-surface border border-border rounded-lg p-6 hover:border-secondary hover:shadow-md transition-all text-left w-full group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
          <Icon className="w-6 h-6 text-secondary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text capitalize mb-1">
            {category.name}
          </h3>
          <p className="text-sm text-text-secondary">
            {category.count} {category.count === 1 ? 'file' : 'files'}
          </p>
          {category.extensions && category.extensions.length > 0 && (
            <p className="text-xs text-text-muted mt-1">
              {category.extensions.slice(0, 3).join(', ')}
              {category.extensions.length > 3 && ` +${category.extensions.length - 3}`}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    extensions: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};
