import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle = ({ title, subtitle }: PageTitleProps) => {
  return (
    <div className="flex items-center space-x-6 ml-6">
      <div className="flex items-center">
        <span className="text-[15px] text-gray-800 font-normal flex items-center">
          {title}
        </span>
      </div>
      {subtitle && (
        <span className="text-[15px] text-gray-600">{subtitle}</span>
      )}
    </div>
  );
}

export default PageTitle;