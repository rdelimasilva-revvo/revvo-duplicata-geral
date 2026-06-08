import { useState, useRef, useEffect } from 'react';
import { DotsThree, Eye, CheckCircle, XCircle } from '@phosphor-icons/react';

interface ActionsMenuProps {
  onViewDetails: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ActionsMenu({ onViewDetails, onApprove, onReject }: ActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Menu de ações"
      >
        <DotsThree className="w-5 h-5 text-gray-600" weight="bold" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onViewDetails);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onApprove);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-green-600"
          >
            <CheckCircle className="w-4 h-4" />
            Aprovar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onReject);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600"
          >
            <XCircle className="w-4 h-4" />
            Rejeitar
          </button>
        </div>
      )}
    </div>
  );
}
