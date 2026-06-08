import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/modules/notificacaoDuplicata/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, maxWidth = "max-w-[1000px]" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        <div className={cn(
          "relative bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto",
          maxWidth
        )}>
          {children}
        </div>
      </div>
    </div>
  );
}