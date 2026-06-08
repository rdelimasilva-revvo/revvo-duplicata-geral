import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';

interface ToastProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function Toast({ isOpen, title, message, onClose }: ToastProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[400px] p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>Ok</Button>
        </div>
      </div>
    </div>
  );
}