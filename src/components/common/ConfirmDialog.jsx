import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({ 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  onConfirm, 
  onCancel,
  variant = 'danger' 
}) => {
  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    primary: 'bg-secondary hover:opacity-90',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10'}`}>
              <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
              <p className="text-text-secondary text-sm">{message}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-text hover:bg-surface-hover rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['danger', 'warning', 'primary']),
};
