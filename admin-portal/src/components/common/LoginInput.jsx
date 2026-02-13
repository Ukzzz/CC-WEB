import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginInput = React.forwardRef(({ 
  label, 
  type = 'text', 
  error, 
  icon: Icon,
  endIcon: EndIcon,
  onEndIconClick,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;

  return (
    <div className="relative mb-6 group">
      <div className={`
        relative flex items-center w-full bg-white rounded-xl border transition-all duration-300 overflow-hidden
        ${error 
          ? 'border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' 
          : isFocused 
            ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]' 
            : 'border-gray-200 hover:border-gray-300'
        }
      `}>
        {/* Leading Icon */}
        {Icon && (
          <div className={`pl-4 pr-2 transition-colors duration-300 ${isFocused || hasValue ? 'text-emerald-600' : 'text-gray-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="relative flex-1 h-14">
          <input
            ref={ref}
            type={type}
            className={`
              peer w-full h-full bg-transparent text-gray-900 placeholder-transparent focus:outline-none px-4 pt-4 pb-1 font-medium
              ${Icon ? 'pl-0' : 'pl-4'}
            `}
            placeholder={label}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          <label className={`
            absolute left-0 top-4 text-gray-500 text-base transition-all duration-200 pointer-events-none origin-[0]
            peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
            peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-emerald-600 font-medium
            ${(isFocused || hasValue) ? 'scale-75 -translate-y-3 text-emerald-600' : ''}
            ${Icon ? 'pl-0' : 'pl-4'}
          `}>
            {label}
          </label>
        </div>

        {/* Trailing Icon (e.g., Password Toggle) */}
        {EndIcon && (
          <button
            type="button"
            onClick={onEndIconClick}
            className="pr-4 pl-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <EndIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-1 -bottom-5 text-xs font-medium text-red-500 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default LoginInput;
