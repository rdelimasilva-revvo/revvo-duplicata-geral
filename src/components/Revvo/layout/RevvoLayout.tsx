import React from 'react';
import { Outlet } from 'react-router-dom';
import { RevvoSidebar } from './RevvoSidebar';

export const RevvoLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F4F6F8]">
      <RevvoSidebar />
      <main className="flex-1 ml-[250px]">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
