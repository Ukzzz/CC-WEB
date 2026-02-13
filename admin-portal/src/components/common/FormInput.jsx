import React, { forwardRef } from 'react';

const FormInput = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors duration-200">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg 
            focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white
            selection:bg-primary-100 selection:text-primary-900
            transition-all duration-200 ease-in-out
            placeholder:text-gray-400
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            readOnly:bg-gray-100 readOnly:text-gray-500 readOnly:cursor-not-allowed readOnly:focus:ring-0 readOnly:focus:border-gray-200
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 ml-1 animate-fadeIn">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
