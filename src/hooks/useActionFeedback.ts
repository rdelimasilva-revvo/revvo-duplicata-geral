import { useCallback, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { getErrorDetails } from '../utils/errorTranslation';

interface ActionFeedbackOptions {
  /** Título do toast de sucesso. Ex: "Fornecedor cadastrado" */
  successTitle: string;
  /** Mensagem complementar do toast de sucesso. */
  successMessage?: string;
  /** Título do toast de erro. Padrão: "Algo deu errado" */
  errorTitle?: string;
}

/**
 * Padroniza o feedback de mutações: executa a ação assíncrona,
 * mostra toast de sucesso ou erro traduzido, e expõe `isRunning`
 * para desabilitar botões durante a operação (previne duplo clique).
 *
 * Uso:
 *   const { run, isRunning } = useActionFeedback();
 *   const handleSave = () =>
 *     run(() => api.save(data), { successTitle: 'Alterações salvas' });
 */
export function useActionFeedback() {
  const { showToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(
    async <T>(action: () => Promise<T>, options: ActionFeedbackOptions): Promise<T | undefined> => {
      setIsRunning(true);
      try {
        const result = await action();
        showToast('success', options.successTitle, options.successMessage);
        return result;
      } catch (error) {
        const details = getErrorDetails(
          error instanceof Error ? error.message : String(error)
        );
        showToast('error', options.errorTitle ?? details.title, `${details.message} ${details.suggestion}`);
        return undefined;
      } finally {
        setIsRunning(false);
      }
    },
    [showToast]
  );

  return { run, isRunning };
}
