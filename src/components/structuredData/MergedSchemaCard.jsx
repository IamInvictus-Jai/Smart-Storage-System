import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, Database, Star } from 'lucide-react';
import { UPLOAD_CONFIG } from '../../config/upload.config';

export const MergedSchemaCard = ({ mergedSchema, isSelected, onSelect, customName, onCustomNameChange, isDisabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const storageColor = UPLOAD_CONFIG.STORAGE_COLORS[mergedSchema.storage_recommendation] || 'bg-gray-500';

  return (
    <div className={`bg-surface border-2 rounded-lg overflow-hidden transition-colors ${
      isSelected ? 'border-secondary' : 'border-border'
    }`}>
      {/* Recommended Badge */}
      <div className="bg-secondary px-4 py-2 flex items-center gap-2">
        <Star className="w-4 h-4 text-black" />
        <span className="text-sm font-semibold text-black">RECOMMENDED - Merged Schema</span>
      </div>

      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text">{mergedSchema.suggested_name}</h3>
              <span className={`px-2 py-1 ${storageColor} text-white text-xs rounded-full`}>
                {mergedSchema.storage_recommendation.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>{mergedSchema.record_count} records</span>
              <span>{Object.keys(mergedSchema.fields).length} fields</span>
              <span>Confidence: {mergedSchema.confidence}</span>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              Combines all schema variants into a single table/collection
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-text" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text" />
            )}
          </button>
        </div>

        {/* Custom Name Input */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-text mb-1">
            Table/Collection Name
          </label>
          <input
            type="text"
            value={customName ?? mergedSchema.suggested_name}
            onChange={(e) => onCustomNameChange(e.target.value)}
            disabled={isDisabled || !isSelected}
            placeholder="Enter custom name"
            className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
          />
        </div>

        {/* Select Button */}
        <button
          onClick={onSelect}
          disabled={isDisabled}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            isSelected
              ? 'bg-secondary text-black'
              : 'bg-surface-hover text-text hover:bg-border'
          } disabled:opacity-50`}
        >
          {isSelected ? 'Selected' : 'Use Merged Schema'}
        </button>
      </div>

      {/* Expandable Additional Info */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-surface-hover">
          <h4 className="text-sm font-semibold text-text mb-3">All Fields (Merged)</h4>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(mergedSchema.fields).map(([fieldName, fieldType]) => (
              <div
                key={fieldName}
                className="px-3 py-2 bg-surface border border-border rounded text-sm"
              >
                <span className="text-text font-medium">{fieldName}</span>
                <span className="text-text-secondary ml-2">({fieldType})</span>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-text mb-2">Metrics</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="px-3 py-2 bg-surface border border-border rounded">
                <span className="text-text-secondary">Null Density:</span>
                <span className="text-text ml-2">{mergedSchema.metrics.null_density.toFixed(2)}%</span>
              </div>
              <div className="px-3 py-2 bg-surface border border-border rounded">
                <span className="text-text-secondary">Type Consistency:</span>
                <span className="text-text ml-2">{mergedSchema.metrics.type_consistency.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Reasons */}
          {mergedSchema.reasons && mergedSchema.reasons.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-text mb-2">Recommendation Reasons</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                {mergedSchema.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {mergedSchema.warnings && mergedSchema.warnings.length > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h5 className="text-sm font-semibold text-yellow-600 mb-2">Warnings</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                {mergedSchema.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MergedSchemaCard.propTypes = {
  mergedSchema: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  customName: PropTypes.string,
  onCustomNameChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};
