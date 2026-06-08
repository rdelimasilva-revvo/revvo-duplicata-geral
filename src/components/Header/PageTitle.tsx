import React from 'react';
import { ChevronDown } from 'lucide-react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="flex items-center space-x-6 ml-6">
      <div className="flex items-center">
        <button className="text-[15px] text-gray-800 hover:text-gray-900 font-normal flex items-center">
          {title}
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>
      {subtitle && (
        <span className="text-[15px] text-gray-600">{subtitle}</span>
      )}
    </div>
  );
}

export default PageTitle;