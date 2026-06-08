import React, { useState } from 'react';
import {
  House,
  Wallet,
  CreditCard,
  Bank,
  FileText,
  ChartBar,
  Gear,
  User,
  CaretDown,
  CaretRight,
  Bell
} from '@phosphor-icons/react';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
  submenu?: { id: string; label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: House,
    path: '/dashboard'
  },
  {
    id: 'recebiveis',
    label: 'Recebíveis',
    icon: Wallet,
    path: '/recebiveis'
  },
  {
    id: 'pagamentos',
    label: 'Pagamentos',
    icon: CreditCard,
    submenu: [
      { id: 'notificacoes-duplicatas', label: 'Notificações de duplicatas', path: '/notificacoes-duplicatas' },
      { id: 'contas-pagar', label: 'Contas a pagar', path: '/contas-pagar' },
      { id: 'gestao-fornecedores', label: 'Gestão de fornecedores', path: '/gestao-fornecedores' }
    ]
  },
  {
    id: 'gestao-domicilios',
    label: 'Gestão de Domicílios',
    icon: Bank,
    path: '/gestao-domicilios'
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: ChartBar,
    path: '/relatorios'
  }
];

export default function RevvoSidebar({ activePath = '/notificacoes-duplicatas' }: { activePath?: string }) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['pagamentos']);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => path === activePath;
  const isSubmenuActive = (submenu?: { path: string }[]) =>
    submenu?.some(item => item.path === activePath);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <FileText size={24} className="text-white" weight="bold" />
          </div>
          <span className="text-xl font-bold text-gray-900">Revvo</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.id);
            const isMenuActive = isActive(item.path) || isSubmenuActive(item.submenu);

            return (
              <li key={item.id}>
                <button
                  onClick={() => hasSubmenu && toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isMenuActive && !hasSubmenu
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={20}
                      weight={isMenuActive ? 'fill' : 'regular'}
                      className={isMenuActive && !hasSubmenu ? 'text-blue-700' : 'text-gray-600'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {hasSubmenu && (
                    isExpanded ? (
                      <CaretDown size={16} className="text-gray-500" />
                    ) : (
                      <CaretRight size={16} className="text-gray-500" />
                    )
                  )}
                </button>

                {hasSubmenu && isExpanded && (
                  <ul className="mt-1 ml-9 space-y-1">
                    {item.submenu!.map(subitem => (
                      <li key={subitem.id}>
                        <button
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subitem.path)
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {subitem.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span>Notificações</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <Gear size={20} className="text-gray-600" />
          <span>Configurações</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <User size={20} className="text-gray-600" />
          <span>Perfil</span>
        </button>
      </div>
    </div>
  );
}
