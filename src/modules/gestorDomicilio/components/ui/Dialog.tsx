import { ReactNode } from 'react';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';

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
      <div className="relative bg-white rounded-lg shadow-lg w-[400px] p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>Não</Button>
          <Button variant="primary" onClick={onConfirm}>Sim</Button>
        </div>
      </div>
    </div>
  );
}