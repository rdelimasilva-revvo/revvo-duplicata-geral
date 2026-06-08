import React from 'react';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import { ROUTES } from '../../constants/routes';
import MainContent from './MainContent';
import { GlobalHelpButton } from '../common/GlobalHelpButton';

interface MainLayoutProps {
  currentView?: string;
  onMenuClick: (view: string) => void;
}

const MainLayout = ({ currentView = ROUTES.HOME, onMenuClick }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#f5f6f7] overflow-x-hidden">
      <Header />
      <div className="flex h-[calc(100vh-48px)] overflow-x-hidden">
        <Sidebar onMenuClick={onMenuClick} activeView={currentView} />
        <MainContent currentView={currentView} onNavigate={onMenuClick} />
      </div>
      <GlobalHelpButton currentView={currentView} />
    </div>
  );
};

export default MainLayout;