import { Modal } from '@/modules/gestorDomicilio/components/ui/Modal';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

interface ExtensionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExtensionSuccessModal({ isOpen, onClose }: ExtensionSuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[400px]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <h2 className="text-lg font-semibold">Solicitação enviada</h2>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            Sua solicitação de prorrogação foi enviada com sucesso.
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Ok
          </Button>
        </div>
      </div>
    </Modal>
  );
}