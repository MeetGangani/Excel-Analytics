import React from 'react';
import PropTypes from 'prop-types';

const Skeleton = ({
  variant = 'rectangular',
  width = '100%',
  height,
  className = '',
  animation = 'pulse',
  circle = false,
  ...props
}) => {
  
  // Base styles
  const baseClasses = "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden";
  
  // Shape variations
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-md",
    circular: "rounded-full",
  };
  
  // Animation styles
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "after:absolute after:inset-0 after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white after:to-transparent",
    none: "",
  };
  
  // Determine shape - circle prop overrides variant for backward compatibility
  const shape = circle ? 'circular' : variant;
  
  // Set default height if none provided
  const finalHeight = height ? height : (shape === 'text' ? '1rem' : '100px');
  
  // Assemble classes
  const skeletonClasses = `${baseClasses} ${variantClasses[shape]} ${animationClasses[animation]} ${className}`;
  
  const style = {
    width,
    height: finalHeight,
  };
  
  return (
    <div 
      className={skeletonClasses} 
      style={style} 
      aria-hidden="true"
      role="presentation"
      {...props} 
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(['text', 'rectangular', 'circular']),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  animation: PropTypes.oneOf(['pulse', 'wave', 'none']),
  circle: PropTypes.bool,
};

// Skeleton group for tables/lists
export const SkeletonGroup = ({ rows = 3, columns = 1, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`skeleton-row-${rowIndex}`} className="flex space-x-2">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={`skeleton-col-${rowIndex}-${colIndex}`} className="flex-1">
              <Skeleton />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

SkeletonGroup.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string,
};

export default Skeleton; 