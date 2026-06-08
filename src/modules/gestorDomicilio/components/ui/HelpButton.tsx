import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import { TERM_DEFINITIONS } from './TermDefinition';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Ajuda"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white rounded-lg shadow-2xl w-96 max-h-[600px] overflow-hidden flex flex-col">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-semibold">Central de Ajuda</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-4">
        <section className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Glossário de Termos</h4>
          <div className="space-y-3">
            {Object.entries(TERM_DEFINITIONS).map(([term, definition]) => (
              <div key={term} className="border-b pb-2">
                <p className="font-medium text-sm text-gray-900">{term}</p>
                <p className="text-xs text-gray-600 mt-1">{definition}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Perguntas Frequentes</h4>
          <div className="space-y-3 text-xs text-gray-700">
            <div>
              <p className="font-medium text-sm text-gray-900">Como aceitar uma duplicata?</p>
              <p className="mt-1">
                Clique na duplicata, revise os detalhes e confirme em "Aprovar Alteração" ou ação similar.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">Posso desfazer uma ação?</p>
              <p className="mt-1">
                Caso sua operação implemente desfazer, o aviso aparecerá logo após a ação com o botão "Desfazer".
              </p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">O que fazer se errar um filtro?</p>
              <p className="mt-1">
                Clique em "Limpar" para resetar os campos de busca e aplique novamente.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">Quais são os prazos legais?</p>
              <p className="mt-1">
                Recusa: 10 dias úteis | Aceite: 10 dias úteis, contados a partir da notificação.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h4 className="font-semibold text-gray-900 mb-3">Atalhos de Teclado</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fechar janela</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">Esc</kbd>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmar</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">Enter</kbd>
            </div>
          </div>
        </section>
      </div>

      <div className="border-t p-4 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2">Precisa de mais ajuda?</p>
        <Button variant="primary" size="sm" className="w-full">
          Contatar Suporte
        </Button>
      </div>
    </div>
  );
}
