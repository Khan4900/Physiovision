import React from 'react';
import { motion as Motion } from 'framer-motion';
import theme from '../theme';


const CustomInput = ({ 
  label, 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  value, 
  onChange,
  error,
  name,
  required = false,
  rightIcon
}) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-12 py-3 rounded-xl border-2 border-gray-200 
            focus:border-transparent focus:outline-none focus:ring-2 focus:ring-offset-0
            transition-all duration-300 text-gray-700 placeholder-gray-400
            hover:border-gray-300 shadow-sm hover:shadow-md`}
          style={{
            '--tw-ring-color': theme.colors.primary.pink,
          }}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};

export default CustomInput;
