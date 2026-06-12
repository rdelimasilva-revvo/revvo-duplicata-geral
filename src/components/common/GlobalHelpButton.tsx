import { useState, useEffect } from 'react';
import { HelpCircle, X, BookOpen, Keyboard, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface HelpSection {
  title: string;
  faqs: FAQItem[];
}

const GLOSSARY: Record<string, string> = {
  'IUD': 'Identificador único da duplicata na rede do Banco Central.',
  'Domicílio Bancário': 'Conta bancária onde os valores serão liquidados.',
  'Sacador/Credor': 'Quem emitiu a duplicata e receberá o pagamento.',
  'Sacado/Devedor': 'Responsável pelo pagamento da duplicata.',
  'Manifestação': 'Ato de aceitar ou recusar uma duplicata dentro dos prazos legais.',
  'Aceite': 'Confirmação de que a duplicata é válida e será paga. Prazo: 10 dias úteis.',
  'Recusa': 'Negativa da duplicata por motivo válido. Prazo: 10 dias úteis.',
  'Escrituração': 'Registro formal das duplicatas no sistema do Banco Central.',
  'Opt-in': 'Adesão voluntária ao sistema de registro de recebíveis.',
  'Abatimento': 'Desconto concedido sobre o valor original da duplicata.',
  'Prorrogação': 'Extensão do prazo de vencimento de uma duplicata.',
  'Interoperabilidade': 'Troca de informações entre instituições financeiras.',
};

const HELP_SECTIONS: Record<string, HelpSection> = {
  default: {
    title: 'Geral',
    faqs: [
      { question: 'Como navegar pela aplicação?', answer: 'Use o menu lateral para acessar os módulos. Clique nos itens para expandir submenus.' },
      { question: 'Como alterar meu perfil?', answer: 'Clique no ícone do usuário no canto superior direito e selecione "Meu perfil".' },
      { question: 'Como sair do sistema?', answer: 'Clique no ícone do usuário e selecione "Sair".' },
    ],
  },
  'notificacoes-duplicatas': {
    title: 'Duplicatas Recebidas',
    faqs: [
      { question: 'Como aceitar uma duplicata?', answer: 'Clique na duplicata na tabela, revise os detalhes no painel lateral e clique em "Aceitar".' },
      { question: 'Como recusar uma duplicata?', answer: 'Abra os detalhes da duplicata e clique em "Recusar". Você precisará informar o motivo da recusa.' },
      { question: 'Posso manifestar várias duplicatas de uma vez?', answer: 'Sim. Selecione as duplicatas usando os checkboxes e clique em "Manifestar aceite/recusa em lote".' },
      { question: 'Quais são os prazos legais?', answer: 'O prazo para aceite ou recusa é de 10 dias úteis a partir da notificação.' },
      { question: 'O que acontece se o prazo vencer?', answer: 'Ocorre o decurso de prazo e a duplicata é considerada tacitamente aceita.' },
    ],
  },
  'domicile-management-new': {
    title: 'Gestão de Domicílio',
    faqs: [
      { question: 'Como solicitar troca de domicílio?', answer: 'Clique em "Gestão de Domicílio" na barra de ações e depois em "Nova Solicitação".' },
      { question: 'Quais documentos são necessários?', answer: 'Comprovante bancário, cartão de assinaturas e certidão de CNPJ.' },
      { question: 'Quanto tempo leva a aprovação?', answer: 'Solicitações com todos os documentos são aprovadas automaticamente. Casos com documentação incompleta passam por análise.' },
    ],
  },
  'automacoes': {
    title: 'Automações',
    faqs: [
      { question: 'Como criar uma regra de automação?', answer: 'Clique em "Nova Regra", preencha os campos obrigatórios e selecione os critérios de filtragem.' },
      { question: 'O que é "Origem do Ativo"?', answer: 'Define se a regra se aplica a ativos originados de clientes ou fornecedores.' },
      { question: 'O que é "Canal de obtenção de dados"?', answer: 'Define como os dados são recebidos: via integração automática, upload manual ou API.' },
      { question: 'Posso desativar uma regra sem excluí-la?', answer: 'Sim. Use o toggle "Regra ativa" nos detalhes da regra ou o menu de opções na listagem.' },
    ],
  },
  'opt-in-management': {
    title: 'Gestão de Opt-in',
    faqs: [
      { question: 'O que é opt-in?', answer: 'É a adesão voluntária ao sistema de registro de recebíveis do Banco Central.' },
      { question: 'Como aderir ao opt-in?', answer: 'Acesse o módulo de Gestão de Opt-in e siga o fluxo de adesão.' },
    ],
  },
  'payment-report': {
    title: 'Relatório de Pagamentos',
    faqs: [
      { question: 'O que o relatório de pagamentos apresenta?', answer: 'Consolida as duplicatas liquidadas e pendentes de pagamento, com valores, datas de vencimento e liquidação e o domicílio bancário de destino.' },
      { question: 'Como filtrar os pagamentos por período?', answer: 'Use o filtro de datas no topo da tela para selecionar o intervalo desejado. Você também pode combinar filtros por sacado, status e valor.' },
      { question: 'Como exportar o relatório?', answer: 'Clique em "Exportar" na barra de ações para baixar os dados em planilha. A exportação respeita os filtros aplicados.' },
      { question: 'O que significa o status "Liquidada"?', answer: 'Indica que o pagamento da duplicata foi confirmado e o valor foi creditado no domicílio bancário cadastrado.' },
    ],
  },
  'profiles-access': {
    title: 'Perfis e Acessos',
    faqs: [
      { question: 'Como convidar um novo usuário?', answer: 'Clique em "Adicionar usuário", informe o e-mail e selecione o perfil de acesso. O usuário receberá um convite por e-mail.' },
      { question: 'Qual a diferença entre os perfis?', answer: 'O perfil Administrador gerencia usuários e configurações; o Operador realiza manifestações e escrituração; o perfil Consulta apenas visualiza dados.' },
      { question: 'Como alterar o perfil de um usuário?', answer: 'Localize o usuário na listagem, abra o menu de opções e selecione "Editar perfil". A alteração vale a partir do próximo login.' },
      { question: 'Como revogar o acesso de um usuário?', answer: 'Abra o menu de opções do usuário e selecione "Desativar". O acesso é bloqueado imediatamente, sem excluir o histórico de ações.' },
    ],
  },
  'receivables-sacados': {
    title: 'Cadastro de Sacados',
    faqs: [
      { question: 'O que é um sacado?', answer: 'É o devedor responsável pelo pagamento da duplicata. O cadastro correto do sacado é obrigatório para a escrituração no Banco Central.' },
      { question: 'Como cadastrar um novo sacado?', answer: 'Clique em "Novo sacado" e informe CNPJ ou CPF, razão social e dados de contato. O documento é validado automaticamente.' },
      { question: 'Posso importar sacados em lote?', answer: 'Sim. Use a opção "Importar" para enviar uma planilha no modelo disponibilizado. Registros com inconsistências são apontados antes da confirmação.' },
      { question: 'Por que manter o cadastro de sacados atualizado?', answer: 'Dados desatualizados podem gerar divergências na escrituração das duplicatas e atrasar notificações e manifestações do sacado.' },
    ],
  },
};

const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl + K', description: 'Abrir busca' },
  { keys: 'Ctrl + F', description: 'Abrir filtros' },
  { keys: 'Ctrl + S', description: 'Salvar' },
  { keys: 'Ctrl + Z', description: 'Desfazer' },
  { keys: 'Esc', description: 'Fechar janela/modal' },
  { keys: 'Shift + ?', description: 'Abrir ajuda' },
];

function getContextKey(currentView: string): string {
  if (currentView.startsWith('notificacoes-duplicatas')) return 'notificacoes-duplicatas';
  if (currentView.startsWith('domicile-management')) return 'domicile-management-new';
  if (currentView.startsWith('automacoes')) return 'automacoes';
  if (currentView === 'opt-in-management') return 'opt-in-management';
  if (currentView === 'payment-report') return 'payment-report';
  if (currentView === 'profiles-access') return 'profiles-access';
  if (currentView === 'receivables-sacados') return 'receivables-sacados';
  return 'default';
}

interface GlobalHelpButtonProps {
  currentView?: string;
}

export function GlobalHelpButton({ currentView = '' }: GlobalHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'faq' | 'glossary' | 'shortcuts'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const contextKey = getContextKey(currentView);
  const contextHelp = HELP_SECTIONS[contextKey] || HELP_SECTIONS.default;
  const defaultHelp = HELP_SECTIONS.default;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[9998] bg-[#0070F2] text-white p-3.5 rounded-full shadow-lg hover:bg-[#0060D2] transition-all hover:scale-105 active:scale-95"
        title="Central de Ajuda (Shift + ?)"
        aria-label="Abrir ajuda"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9998] bg-white rounded-xl shadow-2xl w-[400px] max-h-[600px] overflow-hidden flex flex-col animate-scale-in border border-gray-200">
      <div className="bg-[#0070F2] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-semibold text-[15px]">Central de Ajuda</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-lg p-1 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex border-b border-gray-200 flex-shrink-0">
        {[
          { key: 'faq' as const, icon: MessageCircle, label: 'FAQ' },
          { key: 'glossary' as const, icon: BookOpen, label: 'Glossário' },
          { key: 'shortcuts' as const, icon: Keyboard, label: 'Atalhos' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-[#0070F2] border-b-2 border-[#0070F2] bg-blue-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto flex-1 p-4">
        {activeTab === 'faq' && (
          <div className="space-y-4">
            {contextKey !== 'default' && (
              <div>
                <h4 className="text-xs font-semibold text-[#0070F2] uppercase tracking-wide mb-2">
                  {contextHelp.title}
                </h4>
                <div className="space-y-1">
                  {contextHelp.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                        {expandedFaq === idx ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-3 pb-2.5 text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Perguntas Gerais
              </h4>
              <div className="space-y-1">
                {defaultHelp.faqs.map((faq, idx) => {
                  const faqIdx = contextKey !== 'default' ? idx + 100 : idx;
                  return (
                    <div key={faqIdx} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faqIdx ? null : faqIdx)}
                        className="w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                        {expandedFaq === faqIdx ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === faqIdx && (
                        <div className="px-3 pb-2.5 text-sm text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="space-y-2">
            {Object.entries(GLOSSARY).map(([term, definition]) => (
              <div key={term} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{term}</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{definition}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="space-y-2">
            {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <kbd className="px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200 text-xs font-mono text-gray-600">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 bg-gray-50 flex-shrink-0">
        <p className="text-xs text-gray-500 text-center">
          Pressione <kbd className="px-1.5 py-0.5 bg-white rounded border text-[10px] font-mono">Shift + ?</kbd> para abrir/fechar a ajuda
        </p>
      </div>
    </div>
  );
}
