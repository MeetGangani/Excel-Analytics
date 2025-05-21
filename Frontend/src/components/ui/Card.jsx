import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Card = ({
  children,
  variant = 'default',
  elevation = 'md',
  className = '',
  padding = 'default',
  interactive = false,
  header,
  footer,
  ...props
}) => {
  
  // Base styles
  const baseStyles = "rounded-xl overflow-hidden bg-white";
  
  // Variant styles
  const variantStyles = {
    default: "border border-gray-200",
    outlined: "border-2 border-gray-200",
    flat: "",
  };
  
  // Elevation/shadow styles
  const shadowStyles = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-card",
    lg: "shadow-card-hover",
  };
  
  // Padding styles
  const paddingStyles = {
    none: "",
    sm: "p-2",
    default: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  // Interactive hover effect
  const hoverStyles = interactive ? "transition-all duration-200 hover:shadow-card-hover" : "";
  
  // Assemble classes
  const cardClasses = `${baseStyles} ${variantStyles[variant]} ${shadowStyles[elevation]} ${paddingStyles[padding]} ${hoverStyles} ${className}`;
  
  const cardContent = (
    <div className={cardClasses} {...props}>
      {header && <div className="border-b border-gray-100 pb-3 mb-4">{header}</div>}
      {children}
      {footer && <div className="border-t border-gray-100 pt-3 mt-4">{footer}</div>}
    </div>
  );
  
  // Add animation if interactive
  if (interactive) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return cardContent;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outlined', 'flat']),
  elevation: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'md', 'lg']),
  interactive: PropTypes.bool,
  header: PropTypes.node,
  footer: PropTypes.node,
};

export default Card; 