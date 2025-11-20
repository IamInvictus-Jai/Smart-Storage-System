import { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp, Database, AlertTriangle, Info } from 'lucide-react';
import { UPLOAD_CONFIG } from '../../config/upload.config';

export const SchemaCard = ({ schema, decision, onDecisionChange, isDisabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleActionChange = (action) => {
    onDecisionChange(schema.schema_id, { ...decision, action });
  };

  const handleCustomNameChange = (customName) => {
    onDecisionChange(schema.schema_id, { ...decision, custom_name: customName });
  };

  const storageColor = UPLOAD_CONFIG.STORAGE_COLORS[schema.storage_recommendation] || 'bg-gray-500';
  const hasConflict = schema.conflict && schema.conflict.type;

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-text-secondary" />
              <h3 className="text-lg font-semibold text-text">{schema.suggested_name}</h3>
              <span className={`px-2 py-1 ${storageColor} text-white text-xs rounded-full`}>
                {schema.storage_recommendation.toUpperCase()}
              </span>
              {hasConflict && (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>{schema.record_count} records</span>
              <span>{Object.keys(schema.fields).length} fields</span>
              <span>Confidence: {schema.confidence}</span>
            </div>
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
            value={decision.custom_name ?? schema.suggested_name}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            disabled={isDisabled}
            placeholder="Enter custom name"
            className="w-full px-3 py-2 bg-surface-hover border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
          />
        </div>

        {/* Action Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text mb-2">Action</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`action-${schema.schema_id}`}
                value="create"
                checked={decision.action === 'create'}
                onChange={() => handleActionChange('create')}
                disabled={isDisabled}
                className="w-4 h-4 text-secondary focus:ring-secondary"
              />
              <span className="text-text">Create new table/collection</span>
            </label>
            {hasConflict && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`action-${schema.schema_id}`}
                  value="evolve"
                  checked={decision.action === 'evolve'}
                  onChange={() => handleActionChange('evolve')}
                  disabled={isDisabled}
                  className="w-4 h-4 text-secondary focus:ring-secondary"
                />
                <span className="text-text">Evolve existing schema</span>
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`action-${schema.schema_id}`}
                value="skip"
                checked={decision.action === 'skip'}
                onChange={() => handleActionChange('skip')}
                disabled={isDisabled}
                className="w-4 h-4 text-secondary focus:ring-secondary"
              />
              <span className="text-text">Skip this schema</span>
            </label>
          </div>
        </div>
      </div>

      {/* Expandable Additional Info */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-surface-hover">
          <h4 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Additional Information
          </h4>

          {/* Fields */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-text mb-2">Fields</h5>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(schema.fields).map(([fieldName, fieldType]) => (
                <div
                  key={fieldName}
                  className="px-3 py-2 bg-surface border border-border rounded text-sm"
                >
                  <span className="text-text font-medium">{fieldName}</span>
                  <span className="text-text-secondary ml-2">({fieldType})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-text mb-2">Metrics</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="px-3 py-2 bg-surface border border-border rounded">
                <span className="text-text-secondary">Null Density:</span>
                <span className="text-text ml-2">{schema.metrics.null_density.toFixed(2)}%</span>
              </div>
              <div className="px-3 py-2 bg-surface border border-border rounded">
                <span className="text-text-secondary">Type Consistency:</span>
                <span className="text-text ml-2">{schema.metrics.type_consistency.toFixed(2)}%</span>
              </div>
              <div className="px-3 py-2 bg-surface border border-border rounded">
                <span className="text-text-secondary">Schema Variants:</span>
                <span className="text-text ml-2">{schema.metrics.schema_variants}</span>
              </div>
              <div className="px-3 py-2 bg-surface border border-border rounded">
                <span className="text-text-secondary">Max Allowed:</span>
                <span className="text-text ml-2">{schema.metrics.max_allowed_variants}</span>
              </div>
            </div>
          </div>

          {/* Reasons */}
          {schema.reasons && schema.reasons.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-text mb-2">Storage Recommendation Reasons</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                {schema.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conflict Details */}
          {hasConflict && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h5 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Conflict Detected
              </h5>
              <div className="space-y-2 text-sm">
                <p className="text-text">
                  <span className="font-medium">Type:</span> {schema.conflict.type}
                </p>
                {schema.conflict.existing_schema && (
                  <p className="text-text">
                    <span className="font-medium">Existing Schema:</span> {schema.conflict.existing_schema}
                  </p>
                )}
                <p className="text-text">
                  <span className="font-medium">Similarity:</span> {schema.conflict.similarity}%
                </p>
                <p className="text-text-secondary">{schema.conflict.impact}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SchemaCard.propTypes = {
  schema: PropTypes.object.isRequired,
  decision: PropTypes.object.isRequired,
  onDecisionChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
};
