import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MenuItemData {
  label: string;
  route: string;
  icon?: LucideIcon;
  items?: MenuItemData[];
}

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  route: string;
  path: string;
  selectedPath?: string | null;
  isOpen?: boolean;
  depth?: number;
  onToggle?: (route: string) => void;
  items?: MenuItemData[];
  onItemClick?: (route: string, path: string) => void;
  isRouteOpen?: (route: string) => boolean;
  collapsed?: boolean;
}

const MenuItem = ({
  icon: Icon,
  label,
  route,
  path,
  selectedPath,
  isOpen,
  depth = 0,
  onToggle,
  items,
  onItemClick,
  isRouteOpen,
  collapsed = false
}: MenuItemProps) => {
  const hasSubmenu = items && items.length > 0;
  const paddingLeft = depth * 12 + 16;
  const isMainMenuItem = depth === 0;

  // Active highlight is based on the item's unique path in the tree, not the
  // bare route — two different items can share the same route (e.g. "Automações"
  // under both Recebíveis and Pagamentos) and must not highlight each other.
  const isCurrentItemActive =
    selectedPath === path || (!!selectedPath && selectedPath.startsWith(`${path}>`));

  // Larger font size for better readability
  const fontSize = isMainMenuItem ? 'text-[15px]' : 'text-[14px]';
  const handleClick = () => {
    if (hasSubmenu) {
      onToggle?.(route);
    } else {
      // Use the route from props; pass the unique path so the selection is unambiguous
      onItemClick?.(route, path);
    }
  };

  // Collapsed mode: icon-only button with tooltip; submenus stay hidden
  if (collapsed && isMainMenuItem) {
    return (
      <button
        onClick={handleClick}
        title={label}
        aria-label={label}
        className={`w-full flex items-center justify-center py-2.5 transition-colors duration-150 ${
          isCurrentItemActive
            ? 'bg-[#ebf8ff] text-[#0070f2]'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Icon className={`w-[18px] h-[18px] transition-colors duration-150 ${
          isCurrentItemActive ? 'text-[#0070f2]' : 'text-gray-600'
        }`} />
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={`w-full flex items-center py-2.5 ${fontSize} text-left transition-colors duration-150 ${
          isCurrentItemActive
            ? 'bg-[#ebf8ff] text-[#0070f2]'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${paddingLeft}px`, paddingRight: '12px' }}
      >
        <div className="flex items-center min-w-[20px]">
          {isMainMenuItem && (
            <Icon className={`w-[18px] h-[18px] transition-colors duration-150 ${
              isCurrentItemActive ? 'text-[#0070f2]' : 'text-gray-600'
            }`} />
          )}
        </div>
        <span className={`${isMainMenuItem ? 'ml-2.5' : ''} flex-1 text-left font-medium leading-tight`}>{label}</span>
        {hasSubmenu && (
          <div className={`transition-colors duration-150 ${isCurrentItemActive ? 'text-[#0070f2]' : 'text-gray-400'}`}>
            {isOpen 
              ? <ChevronDown className="w-5 h-5 ml-2" />
              : <ChevronRight className="w-5 h-5 ml-2" />
            }
          </div>
        )}
      </button>
      {hasSubmenu && isOpen && (
        <div className="transition-all duration-200">
          {items.map((item, index) => (
            <MenuItem
              key={`${item.route}-${index}`}
              icon={item.icon || Icon}
              label={item.label}
              route={item.route}
              path={`${path}>${item.route}`}
              selectedPath={selectedPath}
              isOpen={isRouteOpen ? isRouteOpen(item.route) : false}
              depth={depth + 1}
              onToggle={onToggle}
              items={item.items}
              onItemClick={onItemClick}
              isRouteOpen={isRouteOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuItem;