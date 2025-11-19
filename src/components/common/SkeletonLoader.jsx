import PropTypes from 'prop-types';

export const SkeletonLoader = ({ variant = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  const variants = {
    text: 'h-4 bg-surface-hover rounded w-full',
    card: 'h-32 bg-surface-hover rounded-lg w-full',
    list: 'h-16 bg-surface-hover rounded-lg w-full',
    table: 'h-12 bg-surface-hover rounded w-full',
  };
  
  return (
    <div className="space-y-3 animate-pulse">
      {skeletons.map((i) => (
        <div key={i} className={variants[variant]} />
      ))}
    </div>
  );
};

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(['text', 'card', 'list', 'table']),
  count: PropTypes.number,
};
