import React, { useState, useEffect, useMemo } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { menuItems, footerMenuItems, findParentRoutes } from './menuConfig';
import MenuItem from './MenuItem';
import type { SidebarProps } from './types';
import { useMenuVisibilityStore, menuItemId } from '@/stores/menuVisibilityStore';

const filterVisibleItems = (items: any[], hiddenIds: string[], parentPath: string[] = []): any[] =>
  items
    .filter(item => !hiddenIds.includes(menuItemId([...parentPath, item.label])))
    .map(item => item.items
      ? { ...item, items: filterVisibleItems(item.items, hiddenIds, [...parentPath, item.label]) }
      : item
    );

const COLLAPSED_STORAGE_KEY = 'sidebar-collapsed';

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
  // Unique tree path of the currently selected item (disambiguates items that
  // share the same route, e.g. "Automações" under both Recebíveis and Pagamentos).
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const hiddenMenuIds = useMenuVisibilityStore(state => state.hiddenMenuIds);
  const visibleMenuItems = useMemo(
    () => filterVisibleItems([...menuItems], hiddenMenuIds),
    [hiddenMenuIds]
  );
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const setCollapsedPersist = (value: boolean) => {
    setCollapsed(value);
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(value));
    } catch {}
  };

  // Keep the selected path in sync with the active route. If the user already
  // selected a specific item that maps to this route (e.g. the Pagamentos
  // "Automações"), keep it; otherwise fall back to the first matching item.
  useEffect(() => {
    const allMenuItems = [...menuItems, ...footerMenuItems];
    const firstPath = findParentRoutes(allMenuItems, activeView).join('>');
    setSelectedPath(prev =>
      prev && prev.split('>').pop() === activeView ? prev : (firstPath || null)
    );
  }, [activeView]);

  // Open the ancestors of the selected item so it is visible, preserving any
  // other menus the user already has open.
  useEffect(() => {
    if (!selectedPath) return;
    const ancestors = selectedPath.split('>').slice(0, -1);
    if (ancestors.length > 0) {
      setOpenMenus(prev => new Set([...prev, ...ancestors]));
    }
  }, [selectedPath]);

  const handleItemClick = (route: string, path: string) => {
    setSelectedPath(path);
    onMenuClick(route);
  };

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
    // When collapsed, clicking an item with submenu expands the sidebar and opens it
    if (collapsed) {
      setCollapsedPersist(false);
      const allMenuItems = [...menuItems, ...footerMenuItems];
      const next = new Set<string>();
      findAllParentRoutes(allMenuItems, route).forEach(r => next.add(r));
      next.add(route);
      setOpenMenus(next);
      return;
    }

    setOpenMenus(prev => {
      const allMenuItems = [...menuItems, ...footerMenuItems];

      // If menu is already open, close only it and its descendants
      if (prev.has(route)) {
        const next = new Set(prev);
        const toClose = collectDescendantRoutes(allMenuItems, route);
        (toClose.length ? toClose : [route]).forEach(r => next.delete(r));
        return next;
      }

      // Open the menu and ensure parent menus are open, keeping other open menus
      const next = new Set(prev);
      findAllParentRoutes(allMenuItems, route).forEach(r => next.add(r));
      next.add(route);
      return next;
    });
  };

  const isMenuOpen = (route: string) => openMenus.has(route);

  return (
    <aside
      className={`${
        collapsed ? 'w-[56px]' : 'w-[240px]'
      } bg-white border-r border-[#e5e5e5] h-[calc(100vh-48px)] flex flex-col flex-shrink-0 transition-[width] duration-200 ease-in-out`}
    >
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden flex flex-col">
        <div
          className={`py-2.5 border-b border-[#e5e5e5] mb-2 flex items-center ${
            collapsed ? 'justify-center px-0' : 'justify-between px-3'
          }`}
        >
          {!collapsed && (
            <img
              src="https://07iiwshc01.ufs.sh/f/0LiFpsMBmMUk1KdzLnbanW4CiUlp7AaDvuoZtTx8NYPy2jes"
              alt="Logo"
              className="h-6 w-auto"
            />
          )}
          <button
            onClick={() => setCollapsedPersist(!collapsed)}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
          >
            {collapsed
              ? <PanelLeftOpen className="w-[18px] h-[18px]" />
              : <PanelLeftClose className="w-[18px] h-[18px]" />
            }
          </button>
        </div>
        <div className="flex-1">
          {visibleMenuItems.map((item) => (
            <MenuItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              route={item.route}
              path={item.route}
              selectedPath={selectedPath}
              isOpen={isMenuOpen(item.route)}
              onToggle={handleToggle}
              items={item.items}
              onItemClick={handleItemClick}
              isRouteOpen={isMenuOpen}
              collapsed={collapsed}
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
              path={item.route}
              selectedPath={selectedPath}
              isOpen={isMenuOpen(item.route)}
              onToggle={handleToggle}
              items={item.items}
              onItemClick={handleItemClick}
              isRouteOpen={isMenuOpen}
              collapsed={collapsed}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;