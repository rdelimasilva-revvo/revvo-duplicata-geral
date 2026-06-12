import { ReactNode, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface HeadlessModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classe de largura máxima do container (ex.: "max-w-[1000px]"). */
  maxWidth?: string;
}

/**
 * Modal "headless": fornece overlay, centralização, ESC para fechar e trava de
 * scroll do body, deixando o conteúdo (incluindo cabeçalho/fechar) por conta dos filhos.
 * Fonte única para os modais dos módulos — use o `Modal`/`ConfirmModal` de
 * components/ui/Modal quando precisar de título/footer estruturados.
 */
export function HeadlessModal({ isOpen, onClose, children, maxWidth = 'max-w-[1000px]' }: HeadlessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        <div className={twMerge('relative bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto', maxWidth)}>
          {children}
        </div>
      </div>
    </div>
  );
}
