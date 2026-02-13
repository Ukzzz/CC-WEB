import React from 'react';
import { motion } from 'framer-motion';

const FormCard = ({ title, icon: Icon, children, className = '' }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
    >
      {(title || Icon) && (
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <Icon className="w-5 h-5" />
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-gray-800">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default FormCard;
