import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useMediaCategories } from '../../hooks/useMediaCategories';
import { CategoryCard } from './CategoryCard';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const MediaCategories = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = useMediaCategories();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  const handleCategoryClick = (categoryName) => {
    navigate(`/files/${categoryName}`);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 bg-surface-hover rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load categories</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Retry
        </button>
      </div>
    );
  }
  
  const categories = data?.categories || [];
  
  if (categories.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-text-secondary">No media files uploaded yet</p>
        <p className="text-text-muted text-sm mt-2">Upload some files to get started</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
          title="Refresh categories"
        >
          <RefreshCw className={`w-5 h-5 text-text ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            onClick={() => handleCategoryClick(category.name)}
          />
        ))}
      </div>
    </div>
  );
};
