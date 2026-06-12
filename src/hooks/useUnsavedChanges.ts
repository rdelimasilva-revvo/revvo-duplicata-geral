import { useState, useCallback, useEffect, useRef } from 'react';

export function useUnsavedChanges(enabled = true) {
  const [hasChanges, setHasChanges] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const markChanged = useCallback(() => setHasChanges(true), []);
  const markSaved = useCallback(() => setHasChanges(false), []);

  useEffect(() => {
    if (!enabled || !hasChanges) return;

    // Para fechar/recarregar a aba, o navegador só aceita o diálogo nativo.
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não salvas. Deseja sair?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled, hasChanges]);

  const confirmIfUnsaved = useCallback((callback: () => void) => {
    if (!hasChanges) {
      callback();
      return;
    }
    pendingActionRef.current = callback;
    setIsConfirmOpen(true);
  }, [hasChanges]);

  const handleConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setHasChanges(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }, []);

  const handleCancel = useCallback(() => {
    setIsConfirmOpen(false);
    pendingActionRef.current = null;
  }, []);

  return {
    hasChanges,
    markChanged,
    markSaved,
    confirmIfUnsaved,
    isConfirmOpen,
    handleConfirm,
    handleCancel
  };
}
