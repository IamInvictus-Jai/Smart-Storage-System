import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { structuredDataService } from '../../services/api/structuredData.service';
import { UPLOAD_CONFIG } from '../../config/upload.config';

export const ExecutionProgress = ({ jobId, onComplete, onClose }) => {
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let intervalId;

    const pollStatus = async () => {
      try {
        const status = await structuredDataService.getJobStatus(jobId);
        setJobStatus(status);

        // Stop polling if job is complete
        if (status.status === 'completed' || status.status === 'completed_with_errors' || status.status === 'failed') {
          setIsPolling(false);
          if (intervalId) {
            clearInterval(intervalId);
          }
          if (onComplete) {
            onComplete(status);
          }
        }
      } catch (err) {
        console.error('Failed to fetch job status:', err);
        setError(err.message || 'Failed to fetch status');
      }
    };

    // Initial poll
    pollStatus();

    // Set up polling interval
    if (isPolling) {
      intervalId = setInterval(pollStatus, UPLOAD_CONFIG.POLLING_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, isPolling, onComplete]);

  const getStatusIcon = () => {
    if (!jobStatus) return <Loader2 className="w-16 h-16 text-secondary animate-spin" />;

    switch (jobStatus.status) {
      case 'completed':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'completed_with_errors':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-16 h-16 text-secondary animate-spin" />;
      default:
        return <Loader2 className="w-16 h-16 text-secondary animate-spin" />;
    }
  };

  const getStatusText = () => {
    if (!jobStatus) return 'Initializing...';

    switch (jobStatus.status) {
      case 'queued':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Upload Complete!';
      case 'completed_with_errors':
        return 'Upload Completed with Errors';
      case 'failed':
        return 'Upload Failed';
      default:
        return jobStatus.status;
    }
  };

  const isComplete = jobStatus && (
    jobStatus.status === 'completed' || 
    jobStatus.status === 'completed_with_errors' || 
    jobStatus.status === 'failed'
  );

  const canClose = isComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text">Upload Progress</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Status Icon and Text */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h3 className="text-2xl font-semibold text-text mb-2">
              {getStatusText()}
            </h3>
            {jobStatus?.progress_stage && (
              <p className="text-text-secondary">
                {jobStatus.progress_stage}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {jobStatus && jobStatus.progress_percentage !== undefined && jobStatus.status === 'processing' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Progress</span>
                <span className="text-sm text-text font-medium">
                  {jobStatus.progress_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300"
                  style={{ width: `${jobStatus.progress_percentage}%` }}
                />
              </div>
              {jobStatus.progress_current !== undefined && jobStatus.progress_total !== undefined && (
                <p className="text-xs text-text-secondary mt-1 text-center">
                  {jobStatus.progress_current} / {jobStatus.progress_total} records
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Job Error Message */}
          {jobStatus?.error_message && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-500 text-sm font-semibold mb-1">Error:</p>
              <p className="text-red-500 text-sm">{jobStatus.error_message}</p>
            </div>
          )}

          {/* Success Details */}
          {jobStatus?.status === 'completed' && jobStatus.entities_created && (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <h4 className="text-sm font-semibold text-green-600 mb-2">
                  Successfully created {jobStatus.entities_created.length} entities
                </h4>
                <div className="space-y-2">
                  {jobStatus.entities_created.map((entity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-text">{entity.name}</span>
                      <span className="text-text-secondary">
                        {entity.record_count} records • {entity.storage_type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {jobStatus.success_rate !== undefined && (
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    Success Rate: <span className="font-semibold text-text">{jobStatus.success_rate.toFixed(1)}%</span>
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {jobStatus.successful_records} successful, {jobStatus.failed_records} failed
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Completed with Errors */}
          {jobStatus?.status === 'completed_with_errors' && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-600 text-sm">
                Upload completed but some records failed. Check the failed records for details.
              </p>
              {jobStatus.failed_records > 0 && (
                <p className="text-sm text-text-secondary mt-2">
                  {jobStatus.failed_records} records failed to upload
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
          {canClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-secondary text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {jobStatus?.status === 'completed' ? 'Upload Another File' : 'Close'}
            </button>
          )}
          {!canClose && (
            <p className="text-sm text-text-secondary">
              Please wait while your data is being uploaded...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

ExecutionProgress.propTypes = {
  jobId: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
