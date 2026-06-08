import { useEffect, useCallback } from 'react';

export type ShortcutAction =
  | 'search'
  | 'filter'
  | 'save'
  | 'undo'
  | 'escape'
  | 'help'
  | 'refresh';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: ShortcutAction;
}

const defaultShortcuts: KeyboardShortcut[] = [
  { key: 'k', ctrl: true, action: 'search' },
  { key: 'f', ctrl: true, action: 'filter' },
  { key: 's', ctrl: true, action: 'save' },
  { key: 'z', ctrl: true, action: 'undo' },
  { key: 'Escape', action: 'escape' },
  { key: '?', shift: true, action: 'help' },
  { key: 'r', ctrl: true, action: 'refresh' }
];

interface UseKeyboardShortcutsProps {
  onSearch?: () => void;
  onFilter?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
  onRefresh?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onSearch,
  onFilter,
  onSave,
  onUndo,
  onEscape,
  onHelp,
  onRefresh,
  enabled = true
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // Allow Escape even in inputs
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      return;
    }

    for (const shortcut of defaultShortcuts) {
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (event.key === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();

        switch (shortcut.action) {
          case 'search':
            onSearch?.();
            break;
          case 'filter':
            onFilter?.();
            break;
          case 'save':
            onSave?.();
            break;
          case 'undo':
            onUndo?.();
            break;
          case 'escape':
            onEscape?.();
            break;
          case 'help':
            onHelp?.();
            break;
          case 'refresh':
            onRefresh?.();
            break;
        }
        break;
      }
    }
  }, [enabled, onSearch, onFilter, onSave, onUndo, onEscape, onHelp, onRefresh]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function getShortcutLabel(action: ShortcutAction): string {
  const shortcut = defaultShortcuts.find(s => s.action === action);
  if (!shortcut) return '';

  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}
