import PropTypes from 'prop-types';

// Generate initials from email
const getInitials = (email) => {
  if (!email) return '?';
  const parts = email.split('@')[0].split('.');
  if (parts.length > 1) {
    return parts.map(p => p[0].toUpperCase()).join('');
  }
  return email[0].toUpperCase();
};

// Generate consistent color from email hash
const getColor = (email) => {
  if (!email) return '#666666';
  const hash = email.split('').reduce((acc, char) => 
    char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = ({ email, size = 'md', showTooltip = true, className = '' }) => {
  const initials = getInitials(email);
  const bgColor = getColor(email);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };
  
  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
      style={{ backgroundColor: bgColor }}
      title={showTooltip ? email : ''}
    >
      {initials}
    </div>
  );
};

Avatar.propTypes = {
  email: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showTooltip: PropTypes.bool,
  className: PropTypes.string,
};
