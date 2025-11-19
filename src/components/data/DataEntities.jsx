import { useNavigate } from 'react-router-dom';
import { RefreshCw, Database } from 'lucide-react';
import { useState } from 'react';
import { useEntities } from '../../hooks/useEntities';
import { EntityCard } from './EntityCard';

export const DataEntities = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sql');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, isLoading, error, refetch } = useEntities();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleEntityClick = (entityName) => {
    navigate(`/data/${activeTab.toLowerCase()}/${entityName}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 bg-surface-hover rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load entities</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const entities = data?.entities || [];
  
  // Filter entities by storage type
  const sqlEntities = entities.filter(e => e.storage_type === 'sql');
  const nosqlEntities = entities.filter(e => e.storage_type === 'nosql');
  
  const currentEntities = activeTab === 'sql' ? sqlEntities : nosqlEntities;

  return (
    <div>
      {/* Tabs and Refresh Button */}
      <div className="flex items-center justify-between mb-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'sql'
                ? 'bg-secondary text-black'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Database className="w-4 h-4" />
            SQL ({sqlEntities.length})
          </button>
          <button
            onClick={() => setActiveTab('nosql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium ${
              activeTab === 'nosql'
                ? 'bg-secondary text-black'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Database className="w-4 h-4" />
            NoSQL ({nosqlEntities.length})
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2 hover:bg-surface-hover rounded-lg transition-colors disabled:opacity-50"
          title="Refresh entities"
        >
          <RefreshCw className={`w-5 h-5 text-text ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Entities Grid */}
      {currentEntities.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-text-secondary">
            No {activeTab.toUpperCase()} entities found
          </p>
          <p className="text-text-muted text-sm mt-2">
            Create entities through the API or database
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentEntities.map((entity) => (
            <EntityCard
              key={entity.name}
              entity={entity}
              onClick={() => handleEntityClick(entity.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
