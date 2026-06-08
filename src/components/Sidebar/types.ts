import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  route: string;
  items?: MenuItem[];
}

export interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  isOpen?: boolean;
  depth?: number;
  onClick?: () => void;
  items?: MenuItem[];
  onItemClick?: (route: string) => void;
  activeView?: string;
}

export interface SidebarProps {
  onMenuClick: (view: string) => void;
  activeView: string;
}