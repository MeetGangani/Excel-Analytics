import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  className = '',
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props
}) => {
  
  // Base styles
  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium shadow-button focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Size variations
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
    xl: "px-7 py-3 text-lg",
  };
  
  // Variant styles
  const variantStyles = {
    primary: `bg-primary-main text-white hover:bg-primary-dark focus:ring-primary-light ${disabled ? 'bg-opacity-70 cursor-not-allowed' : ''}`,
    secondary: `bg-secondary-main text-white hover:bg-opacity-90 focus:ring-secondary ${disabled ? 'bg-opacity-70 cursor-not-allowed' : ''}`,
    outlined: `bg-transparent border-2 border-primary-main text-primary-main hover:bg-primary-main hover:bg-opacity-10 focus:ring-primary-light ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`,
    text: `bg-transparent text-primary-main hover:bg-primary-main hover:bg-opacity-10 focus:ring-primary-light shadow-none ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`,
    success: `bg-success-main text-white hover:bg-opacity-90 focus:ring-success ${disabled ? 'bg-opacity-70 cursor-not-allowed' : ''}`,
    error: `bg-error-main text-white hover:bg-opacity-90 focus:ring-error ${disabled ? 'bg-opacity-70 cursor-not-allowed' : ''}`,
    warning: `bg-warning-main text-white hover:bg-opacity-90 focus:ring-warning ${disabled ? 'bg-opacity-70 cursor-not-allowed' : ''}`,
    info: `bg-info-main text-white hover:bg-opacity-90 focus:ring-info ${disabled ? 'bg-opacity-70 cursor-not-allowed' : ''}`,
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Assemble classes
  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthClass} ${className}`;
  
  return (
    <motion.button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outlined', 'text', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

export default Button; 