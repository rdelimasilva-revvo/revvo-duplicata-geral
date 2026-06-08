import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  route?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (route: string) => void;
}

const routeLabelMap: Record<string, string> = {
  'home': 'Dashboard Escritural',
  'receivables': 'Recebíveis',
  'receivables-liquidations': 'Controle de Liquidações',
  'notificacoes-duplicatas': 'Duplicatas Recebidas',
  'notificacoes-duplicatas/recebidas': 'Recebidas',
  'notificacoes-duplicatas/manifestacao': 'Manifestação',
  'notificacoes-duplicatas/pendentes': 'Pendentes',
  'domicile-management-new': 'Gestão de Domicílio',
  'fornecedor-divergente-legacy': 'Novos Recebedores',
  'opt-in-management': 'Gestão de Opt-in',
  'agente-intermediador': 'Parceiro de Escrituração',
  'agente-intermediador/fornecedores': 'Fornecedores',
  'agente-intermediador/duplicatas': 'Duplicatas',
  'agente-intermediador/contratos': 'Envio de contratos',
  'automacoes': 'Automações',
  'payment-report': 'Relatório de Pagamentos',
  'profiles-access': 'Perfis e Acessos',
  'meu-perfil': 'Meu Perfil',
  'settings': 'Configurações',
};

export function getBreadcrumbLabel(route: string): string {
  return routeLabelMap[route] || route;
}

export function buildBreadcrumbs(currentView: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Início', route: 'home' }];

  if (currentView === 'home') return items;

  const parts = currentView.split('/');

  if (parts.length > 1) {
    items.push({ label: getBreadcrumbLabel(parts[0]), route: parts[0] });
    items.push({ label: getBreadcrumbLabel(currentView) });
  } else {
    items.push({ label: getBreadcrumbLabel(currentView) });
  }

  return items;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Navegação estrutural" className="flex items-center gap-1.5 text-sm mb-3 px-1">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isFirst = idx === 0;

        return (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            {isLast ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <button
                onClick={() => item.route && onNavigate?.(item.route)}
                className="text-gray-500 hover:text-[#0070F2] transition-colors flex items-center gap-1"
              >
                {isFirst && <Home className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
