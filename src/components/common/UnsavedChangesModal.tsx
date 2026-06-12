import { ConfirmModal } from '@/components/ui/Modal';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesModal({ isOpen, onConfirm, onCancel }: UnsavedChangesModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Alterações não salvas"
      message="Você tem alterações não salvas. Deseja sair sem salvar?"
      confirmLabel="Sair sem salvar"
      cancelLabel="Continuar editando"
      variant="danger"
    />
  );
}
