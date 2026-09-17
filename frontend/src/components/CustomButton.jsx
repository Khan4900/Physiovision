import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import theme from '../theme';

const CustomButton = ({ 
  text, 
  onClick, 
  variant = 'primary',
  icon: Icon,
  type = 'button',
  disabled = false,
  fullWidth = true,
  loading = false 
}) => {
  const baseStyles = `${fullWidth ? 'w-full' : ''} px-6 py-3 rounded-xl font-semibold text-base
    transition-all duration-300 flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed`;

  const variantStyles = {
    primary: `text-white shadow-lg hover:shadow-xl`,
    outline: `bg-white border-2 text-gray-700 hover:shadow-lg`,
  };

  return (
    <Motion.button
      whileHover={{ scale: (disabled || loading) ? 1 : 1.02 }}
      whileTap={{ scale: (disabled || loading) ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${
        variant === 'outline' ? 'border-gray-300 hover:border-pink-500' : ''
      }`}
      style={
        variant === 'primary'
          ? { background: theme.gradients.primary }
          : {}
      }
    >
      {loading ? (
        <>
          <Motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader className="w-5 h-5" />
          </Motion.div>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          <span>{text}</span>
        </>
      )}
    </Motion.button>
  );
};

export default CustomButton;
