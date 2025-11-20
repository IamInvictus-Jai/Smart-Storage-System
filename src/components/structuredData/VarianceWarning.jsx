import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';
import { UPLOAD_CONFIG } from '../../config/upload.config';

export const VarianceWarning = ({ 
  varianceLevel, 
  schemaVariants, 
  maxAllowed, 
  recommendation,
  userOverride,
  acknowledgeRisks,
  onUserOverrideChange,
  onAcknowledgeRisksChange,
  showCheckboxes
}) => {
  const isHighVariance = varianceLevel === 'high' || varianceLevel === 'extreme';
  const varianceColor = UPLOAD_CONFIG.VARIANCE_COLORS[varianceLevel] || 'text-gray-500';

  if (!isHighVariance) {
    return null;
  }

  return (
    <div className="bg-orange-500/10 border-2 border-orange-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-600 mb-2">
            High Schema Variance Detected
          </h3>
          <p className="text-text mb-3">
            Your data contains <span className="font-semibold">{schemaVariants} different schema variants</span>,
            which exceeds the recommended maximum of {maxAllowed}. This indicates significant structural differences
            in your data.
          </p>

          {recommendation && recommendation.reason && (
            <div className="mb-3 p-3 bg-surface rounded-lg">
              <p className="text-sm text-text-secondary">{recommendation.reason}</p>
            </div>
          )}

          <div className="mb-3">
            <h4 className="text-sm font-semibold text-text mb-2">Recommendation:</h4>
            <p className="text-sm text-text-secondary">
              Use the <span className="font-semibold text-secondary">Merged Schema</span> option to combine all variants
              into a single table/collection. This approach:
            </p>
            <ul className="list-disc list-inside text-sm text-text-secondary mt-2 space-y-1 ml-4">
              <li>Simplifies data management</li>
              <li>Enables future uploads with schema validation</li>
              <li>Maintains data consistency</li>
              <li>Reduces complexity</li>
            </ul>
          </div>

          {showCheckboxes && (
            <div className="space-y-3 mt-4 pt-4 border-t border-orange-500/20">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={userOverride}
                  onChange={(e) => onUserOverrideChange(e.target.checked)}
                  className="mt-1 w-4 h-4 text-secondary focus:ring-secondary rounded"
                />
                <span className="text-sm text-text">
                  I understand the risks and want to create separate tables/collections for each schema variant
                </span>
              </label>

              {userOverride && (
                <label className="flex items-start gap-2 cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    checked={acknowledgeRisks}
                    onChange={(e) => onAcknowledgeRisksChange(e.target.checked)}
                    className="mt-1 w-4 h-4 text-secondary focus:ring-secondary rounded"
                  />
                  <span className="text-sm text-text">
                    I acknowledge that separate collections with high variance cannot validate future uploads,
                    and I accept responsibility for data consistency
                  </span>
                </label>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

VarianceWarning.propTypes = {
  varianceLevel: PropTypes.string.isRequired,
  schemaVariants: PropTypes.number.isRequired,
  maxAllowed: PropTypes.number.isRequired,
  recommendation: PropTypes.object,
  userOverride: PropTypes.bool,
  acknowledgeRisks: PropTypes.bool,
  onUserOverrideChange: PropTypes.func,
  onAcknowledgeRisksChange: PropTypes.func,
  showCheckboxes: PropTypes.bool,
};
