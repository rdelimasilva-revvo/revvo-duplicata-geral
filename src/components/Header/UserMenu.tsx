import React, { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { clearStorage } from '../../utils/storage';
import { useCompany } from '../../context/CompanyContext';
import { useConfig } from '../../context/ConfigContext';
import { clearAcordosAccessSession } from '../../modules/acordosComerciais/components/AcordoAccessGate';
import { Tooltip } from '../ui/Tooltip';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setCompanyId } = useCompany();
  const { setSetupReady } = useConfig();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      try { await supabase.auth.signOut(); } catch {}
      clearStorage();
      clearAcordosAccessSession();
      try {
        sessionStorage.clear();
      } catch {}
      setCompanyId(null);
      setSetupReady(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Tooltip content="Ajuda" position="bottom">
        <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Ajuda">
          <HelpCircle className="w-[18px] h-[18px] text-gray-600" />
        </button>
      </Tooltip>
      <Tooltip content="Notificações" position="bottom">
        <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Notificações">
          <Bell className="w-[18px] h-[18px] text-gray-600" />
        </button>
      </Tooltip>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          id="user-menu-button"
          className="p-1.5 hover:bg-gray-100 rounded-full ml-1 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Menu do usuário"
          title="Menu do usuário"
        >
          <div className="w-[26px] h-[26px] rounded-full bg-[#0070f2] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
        
        {isOpen && (
          <div 
            className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
          >
            <div className="py-1" role="none">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/app/meu-perfil');
                }}
              >
                Meu perfil
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/config/start?review=1');
                }}
              >
                Rever tour de boas-vindas
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
