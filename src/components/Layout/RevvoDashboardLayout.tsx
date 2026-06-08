import React from 'react';
import RevvoSidebar from './RevvoSidebar';

interface RevvoDashboardLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export default function RevvoDashboardLayout({ children, activePath }: RevvoDashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RevvoSidebar activePath={activePath} />
      <div className="flex-1 ml-64 overflow-auto">
        {children}
      </div>
    </div>
  );
}
