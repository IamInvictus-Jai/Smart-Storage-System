import PropTypes from 'prop-types';
import { Database, ChevronRight } from 'lucide-react';

export const EntityCard = ({ entity, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-lg p-6 hover:bg-surface-hover hover:border-secondary transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
          <Database className="w-6 h-6 text-secondary" />
        </div>
        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-secondary transition-colors" />
      </div>

      <h3 className="text-lg font-semibold text-text mb-2 capitalize">
        {entity.name.replace(/_/g, ' ')}
      </h3>

      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {entity.record_count || 0} records
        </span>
        {entity.last_updated && (
          <span className="text-text-muted text-xs">
            Updated {new Date(entity.last_updated).toLocaleDateString()}
          </span>
        )}
      </div>

      {entity.description && (
        <p className="mt-3 text-sm text-text-secondary line-clamp-2">
          {entity.description}
        </p>
      )}
    </div>
  );
};

EntityCard.propTypes = {
  entity: PropTypes.shape({
    name: PropTypes.string.isRequired,
    record_count: PropTypes.number,
    last_updated: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};
