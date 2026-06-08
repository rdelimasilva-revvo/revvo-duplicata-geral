import { useState, useCallback, useRef, useEffect } from 'react';

interface UndoAction {
  id: string;
  description: string;
  undo: () => void | Promise<void>;
  timestamp: number;
}

interface UseUndoReturn {
  addUndoAction: (description: string, undoFn: () => void | Promise<void>) => string;
  executeUndo: (id: string) => Promise<void>;
  currentAction: UndoAction | null;
  clearUndo: () => void;
}

const UNDO_TIMEOUT = 10000; // 10 seconds

export function useUndo(): UseUndoReturn {
  const [currentAction, setCurrentAction] = useState<UndoAction | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearUndo = useCallback(() => {
    setCurrentAction(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const addUndoAction = useCallback((description: string, undoFn: () => void | Promise<void>) => {
    const id = `undo-${Date.now()}-${Math.random()}`;
    const action: UndoAction = {
      id,
      description,
      undo: undoFn,
      timestamp: Date.now()
    };

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setCurrentAction(action);

    // Auto-clear after timeout
    timeoutRef.current = setTimeout(() => {
      setCurrentAction(null);
      timeoutRef.current = null;
    }, UNDO_TIMEOUT);

    return id;
  }, []);

  const executeUndo = useCallback(async (id: string) => {
    if (currentAction && currentAction.id === id) {
      await currentAction.undo();
      clearUndo();
    }
  }, [currentAction, clearUndo]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    addUndoAction,
    executeUndo,
    currentAction,
    clearUndo
  };
}
