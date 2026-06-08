import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { HelpTooltip, Tooltip } from '@/components/ui/Tooltip';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SkeletonTable, SkeletonCard, SkeletonList } from '@/components/common/SkeletonLoader';
import { UndoToast } from '@/components/common/UndoToast';
import { useUndo } from '@/hooks/useUndo';
import { useKeyboardShortcuts, getShortcutLabel } from '@/hooks/useKeyboardShortcuts';
import { ValidatedForm } from '@/components/forms/ValidatedForm';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Trash2,
  Save,
  Search,
  Filter,
  HelpCircle
} from 'lucide-react';

export default function UsabilityDemo() {
  const [activeTab, setActiveTab] = useState<'buttons' | 'inputs' | 'modals' | 'errors' | 'loading' | 'undo' | 'form'>('buttons');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const { addUndoAction, executeUndo, currentAction, clearUndo } = useUndo();

  useKeyboardShortcuts({
    onSearch: () => alert('Busca acionada! (Ctrl+K)'),
    onFilter: () => alert('Filtros acionados! (Ctrl+F)'),
    onHelp: () => setShowHelp(!showHelp),
    onEscape: () => {
      setShowModal(false);
      setShowConfirm(false);
    }
  });

  const handleDeleteWithUndo = () => {
    addUndoAction('Item excluído com sucesso', () => {
      console.log('Restaurando item...');
      alert('Item restaurado!');
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demonstração de Melhorias de Usabilidade
          </h1>
          <p className="text-gray-600">
            Componentes e padrões implementados baseados nas 10 Heurísticas de Nielsen
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Atalhos de Teclado Disponíveis:</p>
              <ul className="space-y-1">
                <li><kbd className="px-2 py-1 bg-white rounded border text-xs">Ctrl+K</kbd> - Buscar</li>
                <li><kbd className="px-2 py-1 bg-white rounded border text-xs">Ctrl+F</kbd> - Filtros</li>
                <li><kbd className="px-2 py-1 bg-white rounded border text-xs">Shift+?</kbd> - Ajuda</li>
                <li><kbd className="px-2 py-1 bg-white rounded border text-xs">ESC</kbd> - Fechar modal</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'buttons', label: 'Botões' },
            { key: 'inputs', label: 'Inputs' },
            { key: 'modals', label: 'Modais' },
            { key: 'errors', label: 'Mensagens de Erro' },
            { key: 'loading', label: 'Loading States' },
            { key: 'undo', label: 'Undo/Desfazer' },
            { key: 'form', label: 'Formulário Validado' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
          {activeTab === 'buttons' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  Botões Unificados
                  <HelpTooltip content="Todos os botões seguem o mesmo padrão de altura e estilo" />
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Variantes</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="danger">Danger</Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tamanhos</h3>
                    <div className="flex items-end gap-3">
                      <Button size="sm">Small (32px)</Button>
                      <Button size="md">Medium (40px)</Button>
                      <Button size="lg">Large (48px)</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Com Ícones e Estados</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button icon={<Save className="w-4 h-4" />}>
                        Salvar
                      </Button>
                      <Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
                        Excluir
                      </Button>
                      <Button loading>Carregando...</Button>
                      <Button disabled>Desabilitado</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Badges</h3>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="success">Ativo</Badge>
                      <Badge variant="warning">Pendente</Badge>
                      <Badge variant="danger">Vencido</Badge>
                      <Badge variant="info">Novo</Badge>
                      <Badge variant="default">Padrão</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inputs' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Inputs com Validação</h2>

              <div className="max-w-2xl space-y-4">
                <Input
                  label="Campo Normal"
                  placeholder="Digite algo..."
                  hint="Este é um campo de texto simples"
                />

                <Input
                  label="Campo Obrigatório"
                  required
                  placeholder="Campo obrigatório..."
                />

                <Input
                  label="Com Validação"
                  validate={(value) => {
                    if (!value) return 'Campo obrigatório';
                    if (value.length < 5) return 'Mínimo 5 caracteres';
                  }}
                  placeholder="Digite pelo menos 5 caracteres..."
                />

                <Input
                  label="E-mail"
                  type="email"
                  validate={(value) => {
                    if (!value.includes('@')) return 'E-mail inválido';
                  }}
                  placeholder="seu@email.com"
                />

                <Input
                  label="Com Tooltip"
                  icon={<Search className="w-4 h-4" />}
                  placeholder="Buscar..."
                />

                <div className="flex items-center gap-2">
                  <Input
                    label="Campo com Ajuda"
                    placeholder="Digite aqui..."
                  />
                  <HelpTooltip content="Este é um exemplo de tooltip de ajuda contextual" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modals' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Modais Unificados</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tipos de Modais</h3>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowModal(true)}>
                      Modal Padrão
                    </Button>
                    <Button variant="danger" onClick={() => setShowConfirm(true)}>
                      Modal de Confirmação
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">Características dos Modais:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Fecham com ESC</li>
                    <li>Fecham clicando fora (configurável)</li>
                    <li>Animação suave de entrada</li>
                    <li>Bloqueiam scroll do body</li>
                    <li>Tamanhos configuráveis (sm, md, lg, xl)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Mensagens de Erro Específicas</h2>

              <div className="space-y-4">
                <ErrorMessage
                  type="network"
                  title="Erro de Conexão"
                  message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
                  suggestion="Tente novamente em alguns instantes ou entre em contato com o suporte."
                  errorCode="ERR_NET_001"
                  onRetry={() => alert('Tentando novamente...')}
                  onContactSupport={() => alert('Abrindo suporte...')}
                />

                <ErrorMessage
                  type="permission"
                  title="Sem Permissão"
                  message="Você não tem permissão para realizar esta ação."
                  suggestion="Entre em contato com seu administrador para solicitar acesso."
                  errorCode="ERR_PERM_403"
                />

                <ErrorMessage
                  type="validation"
                  title="Dados Inválidos"
                  message="Alguns campos do formulário contêm erros."
                  suggestion="Revise os campos destacados e tente novamente."
                />

                <ErrorMessage
                  type="expired"
                  title="Prazo Expirado"
                  message="O prazo para esta duplicata já expirou (10 dias úteis)."
                  suggestion="Esta duplicata não pode mais ser modificada."
                  errorCode="ERR_EXPIRED_001"
                />
              </div>
            </div>
          )}

          {activeTab === 'loading' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Estados de Carregamento</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Skeleton Table</h3>
                    <Button size="sm" onClick={() => setLoading(!loading)}>
                      {loading ? 'Esconder' : 'Mostrar'}
                    </Button>
                  </div>
                  {loading && <SkeletonTable rows={5} columns={6} />}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Skeleton Cards</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Skeleton List</h3>
                  <SkeletonList items={4} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'undo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Sistema de Undo/Desfazer</h2>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Como Funciona</h3>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Ações críticas podem ser desfeitas em até 10 segundos</li>
                    <li>Toast aparece automaticamente após a ação</li>
                    <li>Barra de progresso mostra tempo restante</li>
                    <li>Clique em "Desfazer" para reverter a ação</li>
                  </ul>
                </div>

                <div>
                  <Button
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDeleteWithUndo}
                  >
                    Excluir Item (com Undo)
                  </Button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium mb-2">Exemplo de código:</p>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const { addUndoAction } = useUndo();

const handleDelete = async () => {
  const backup = currentItem;
  await api.delete(id);

  addUndoAction('Item excluído', async () => {
    await api.restore(backup);
  });
};`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Formulário com Validação Completa</h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  Este formulário demonstra validação inline, tooltips de ajuda,
                  feedback visual e todas as melhores práticas de usabilidade.
                </p>
              </div>

              <ValidatedForm />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modal de Exemplo"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Este é um exemplo de modal unificado. Ele pode ser fechado clicando fora,
          pressionando ESC, ou usando os botões de ação.
        </p>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          alert('Ação confirmada!');
          setShowConfirm(false);
        }}
        title="Confirmar Ação"
        message="Tem certeza que deseja executar esta ação?"
        confirmLabel="Sim, confirmar"
        cancelLabel="Não, cancelar"
        variant="danger"
      />

      {currentAction && (
        <UndoToast
          message={currentAction.description}
          onUndo={() => executeUndo(currentAction.id)}
          onClose={clearUndo}
        />
      )}

      {showHelp && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 w-80 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Ajuda Rápida</h3>
            <button onClick={() => setShowHelp(false)}>
              <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Use os atalhos de teclado para navegar mais rapidamente pela aplicação.
          </p>
        </div>
      )}
    </div>
  );
}
