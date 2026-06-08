import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const Header = () => {
  const navigate = useNavigate();

  const handleSearchNavigate = (route: string) => {
    navigate(`/app/${route}`);
  };

  return (
    <header className="h-[48px] px-4 bg-white border-b border-[#e5e5e5] flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center flex-1">
        <SearchBar onNavigate={handleSearchNavigate} />
      </div>
      <div className="flex items-center space-x-4 ml-4">
        <UserMenu />
      </div>
    </header>
  );
}

export default Header;