import React from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { menuItems } from '../Sidebar/menuConfig';
import { useMenuVisibilityStore, menuItemId } from '@/stores/menuVisibilityStore';

interface VisibilityItem {
  label: string;
  items?: readonly VisibilityItem[];
}

interface ToggleRowProps {
  item: VisibilityItem;
  labelPath: string[];
  depth: number;
  parentHidden: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ item, labelPath, depth, parentHidden }) => {
  const isHidden = useMenuVisibilityStore((state) => state.hiddenMenuIds.includes(menuItemId(labelPath)));
  const toggleMenu = useMenuVisibilityStore((state) => state.toggleMenu);

  const id = menuItemId(labelPath);
  const effectivelyHidden = parentHidden || isHidden;
  const visible = !isHidden;

  return (
    <>
      <div
        className={`flex items-center justify-between py-2.5 pr-4 border-b border-gray-100 last:border-b-0 ${
          parentHidden ? 'opacity-40' : ''
        }`}
        style={{ paddingLeft: `${depth * 24 + 16}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {effectivelyHidden
            ? <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
            : <Eye className="w-4 h-4 text-[#0070F2] flex-shrink-0" />
          }
          <span className={`text-sm truncate ${depth === 0 ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {item.label}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={visible}
          aria-label={`${visible ? 'Ocultar' : 'Expor'} menu ${item.label}`}
          disabled={parentHidden}
          onClick={() => toggleMenu(id)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
            parentHidden ? 'cursor-not-allowed' : ''
          } ${visible ? 'bg-[#0070F2]' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              visible ? 'translate-x-[18px]' : 'translate-x-[3px]'
            }`}
          />
        </button>
      </div>
      {item.items?.map((subItem) => (
        <ToggleRow
          key={menuItemId([...labelPath, subItem.label])}
          item={subItem}
          labelPath={[...labelPath, subItem.label]}
          depth={depth + 1}
          parentHidden={effectivelyHidden}
        />
      ))}
    </>
  );
};

const MenuVisibility = () => {
  const hiddenCount = useMenuVisibilityStore((state) => state.hiddenMenuIds.length);
  const resetVisibility = useMenuVisibilityStore((state) => state.resetVisibility);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Ocultar menus</h1>
          <p className="text-sm text-gray-500 mt-1">
            Escolha quais menus ficam visíveis no menu lateral. Ocultar um menu principal também oculta seus submenus.
          </p>
        </div>
        <button
          type="button"
          onClick={resetVisibility}
          disabled={hiddenCount === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Restaurar padrão
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg max-w-2xl">
        {menuItems.map((item) => (
          <ToggleRow
            key={menuItemId([item.label])}
            item={item as VisibilityItem}
            labelPath={[item.label]}
            depth={0}
            parentHidden={false}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuVisibility;
