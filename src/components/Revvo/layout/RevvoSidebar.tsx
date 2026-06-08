import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  UserPlus,
  Handshake,
  Bank,
  ChartBar,
  Gear
} from '@phosphor-icons/react';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  {
    path: '/revvo/notificacoes-duplicatas',
    label: 'Notificações de Duplicatas',
    icon: <FileText size={18} weight="bold" />
  },
  {
    path: '/revvo/novos-recebedores',
    label: 'Novos Recebedores',
    icon: <UserPlus size={18} weight="bold" />
  },
  {
    path: '/revvo/gestao-optin',
    label: 'Gestão de Opt-in',
    icon: <Handshake size={18} weight="bold" />
  },
  {
    path: '/revvo/gestao-domicilio',
    label: 'Gestão de Domicílio Certo',
    icon: <Bank size={18} weight="bold" />
  },
  {
    path: '/revvo/agente-intermediador',
    label: 'Agente Intermediador',
    icon: <ChartBar size={18} weight="bold" />
  }
];

export const RevvoSidebar: React.FC = () => {
  return (
    <aside className="w-[250px] bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#0066FF]">Revvo</h1>
        <p className="text-xs text-gray-500 mt-1">Dashboard Financeiro</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#0066FF] bg-blue-50 border-r-2 border-[#0066FF]'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded w-full">
          <Gear size={18} weight="bold" />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
};
