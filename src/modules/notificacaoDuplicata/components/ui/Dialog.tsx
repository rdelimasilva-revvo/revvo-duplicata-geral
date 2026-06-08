import { ReactNode } from 'react';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';

interface DialogProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Dialog({ isOpen, title, children, onConfirm, onCancel }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg w-[400px] max-w-[90vw] animate-scale-in">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#f5f6f7] rounded-t-lg">
          <h2 className="text-lg font-semibold text-[#32363a]">{title}</h2>
        </div>
        <div className="px-6 py-6">{children}</div>
        <div className="px-6 py-4 border-t border-gray-200 bg-[#fafafa] rounded-b-lg flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>Não</Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>Sim</Button>
        </div>
      </div>
    </div>
  );
}
