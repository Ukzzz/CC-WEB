import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, backUrl, action }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex-1">
        {backUrl && (
          <button
            onClick={() => navigate(backUrl)}
            className="group flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-3"
          >
            <div className="p-1 rounded-full bg-gray-100 group-hover:bg-primary-50 transition-colors mr-2">
              <ArrowBack className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            Back to List
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-gray-500 text-lg">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
