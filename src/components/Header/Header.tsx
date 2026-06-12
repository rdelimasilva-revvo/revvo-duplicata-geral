import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const Header = () => {
  const navigate = useNavigate();

  const handleSearchNavigate = (route: string) => {
    navigate(`/app/${route}`);
  };

  return (
    <header className="h-[48px] px-4 bg-white border-b border-[#e5e5e5] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      <Logo />
      <div className="flex items-center gap-2">
        <div className="hidden md:block w-72">
          <SearchBar onNavigate={handleSearchNavigate} />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}

export default Header;