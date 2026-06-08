import React, { useState, useEffect } from 'react';
import { menuItems, footerMenuItems, findParentRoutes } from './menuConfig';
import MenuItem from './MenuItem';
import type { SidebarProps } from './types';

const findAllParentRoutes = (items: any[], targetRoute: string): string[] => {
  for (const item of items) {
    if (item.route === targetRoute) {
      return [item.route];
    }
    if (item.items) {
      const found = findAllParentRoutes(item.items, targetRoute);
      if (found.length) {
        return [item.route, ...found];
      }
    }
  }
  return [];
};

const Sidebar: React.FC<SidebarProps> = ({ onMenuClick, activeView }) => {
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allMenuItems = [...menuItems, ...footerMenuItems];
    const parentRoutes = findAllParentRoutes(allMenuItems, activeView);
    if (parentRoutes.length > 0) {
      setOpenMenus(new Set(parentRoutes));
    }
  }, [activeView]);

  const handleMenuClick = (route: string, hasSubmenu?: boolean) => {
    if (hasSubmenu) {
      setOpenMenus(prev => {
        const newOpenMenus = new Set<string>();
        
        // If menu is already open, close it and its children
        if (prev.has(route)) {
          // Close everything by returning empty set
          return newOpenMenus;
        } else {
          // Open the menu and ensure parent menus are open
          const allMenuItems = [...menuItems, ...footerMenuItems];
          const parentRoutes = findAllParentRoutes(allMenuItems, route);
          parentRoutes.forEach(r => newOpenMenus.add(r));
          newOpenMenus.add(route);
        }
        return newOpenMenus;
      });
    } else {
      // Use the route directly from the menu configuration
      onMenuClick(route);
    }
  };

  const isMenuOpen = (route: string) => openMenus.has(route);
  const isMenuActive = (item: any): boolean => {
    if (activeView === item.route) return true;
    if (item.items) {
      return item.items.some((subItem: any) => isMenuActive(subItem));
    }
    return false;
  };

  return (
    <aside className="w-[220px] bg-white border-r border-[#e5e5e5] h-[calc(100vh-48px)] flex flex-col flex-shrink-0">
      <nav className="flex-1 py-2 overflow-y-auto flex flex-col">
        <div className="px-3 py-2.5 border-b border-[#e5e5e5] mb-2 flex items-center">
          <img
            src="https://07iiwshc01.ufs.sh/f/0LiFpsMBmMUk1KdzLnbanW4CiUlp7AaDvuoZtTx8NYPy2jes"
            alt="Logo"
            className="h-4 w-auto"
          />
        </div>
        <div className="flex-1">
          {menuItems.map((item) => (
            <MenuItem 
              key={item.route}
              icon={item.icon} 
              label={item.label} 
              route={item.route}
              isActive={isMenuActive(item)}
              isOpen={isMenuOpen(item.route)}
              onClick={() => handleMenuClick(item.route, !!item.items)}
              items={item.items}
              onItemClick={onMenuClick}
              activeView={activeView}
            />
          ))}
        </div>
        <div className="border-t border-[#e5e5e5] pt-2">
          {footerMenuItems.map((item) => (
            <MenuItem 
              key={item.route}
              icon={item.icon} 
              label={item.label} 
              route={item.route}
              isActive={isMenuActive(item)}
              isOpen={isMenuOpen(item.route)}
              onClick={() => handleMenuClick(item.route, !!item.items)}
              items={item.items}
              onItemClick={onMenuClick}
              activeView={activeView}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;