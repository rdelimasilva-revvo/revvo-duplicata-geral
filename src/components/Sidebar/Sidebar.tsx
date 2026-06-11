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

  const collectDescendantRoutes = (items: any[], targetRoute: string): string[] => {
    const collect = (item: any): string[] => [
      item.route,
      ...(item.items ? item.items.flatMap(collect) : []),
    ];
    for (const item of items) {
      if (item.route === targetRoute) return collect(item);
      if (item.items) {
        const found = collectDescendantRoutes(item.items, targetRoute);
        if (found.length) return found;
      }
    }
    return [];
  };

  const handleToggle = (route: string) => {
    setOpenMenus(prev => {
      const allMenuItems = [...menuItems, ...footerMenuItems];

      // If menu is already open, close only it and its descendants
      if (prev.has(route)) {
        const next = new Set(prev);
        const toClose = collectDescendantRoutes(allMenuItems, route);
        (toClose.length ? toClose : [route]).forEach(r => next.delete(r));
        return next;
      }

      // Open the menu and ensure parent menus are open
      const next = new Set<string>();
      findAllParentRoutes(allMenuItems, route).forEach(r => next.add(r));
      next.add(route);
      return next;
    });
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
              onToggle={handleToggle}
              items={item.items}
              onItemClick={onMenuClick}
              isRouteOpen={isMenuOpen}
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
              onToggle={handleToggle}
              items={item.items}
              onItemClick={onMenuClick}
              isRouteOpen={isMenuOpen}
              activeView={activeView}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;