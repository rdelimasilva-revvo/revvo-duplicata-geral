import { useState, useCallback, useEffect } from 'react';

export function useUnsavedChanges(enabled = true) {
  const [hasChanges, setHasChanges] = useState(false);

  const markChanged = useCallback(() => setHasChanges(true), []);
  const markSaved = useCallback(() => setHasChanges(false), []);

  useEffect(() => {
    if (!enabled || !hasChanges) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Você tem alterações não salvas. Deseja sair?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled, hasChanges]);

  const confirmLeave = useCallback((callback: () => void) => {
    if (!hasChanges) {
      callback();
      return;
    }
    const confirmed = window.confirm(
      'Você tem alterações não salvas. Deseja sair sem salvar?'
    );
    if (confirmed) {
      setHasChanges(false);
      callback();
    }
  }, [hasChanges]);

  return { hasChanges, markChanged, markSaved, confirmLeave };
}
