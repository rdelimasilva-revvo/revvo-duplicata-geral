import {
  BarChart3,
  CreditCard,
  Banknote,
  ToggleLeft,
  Users,
  Cog,
  CloudCog
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export const menuItems = [
  { icon: BarChart3, label: 'Dashboard Escritural', route: ROUTES.HOME },
  {
    icon: CreditCard,
    label: 'Recebíveis',
    route: ROUTES.RECEIVABLES,
    items: [
      { label: 'Escrituração', route: ROUTES.RECEIVABLES },
      { label: 'Controle de Liquidações', route: ROUTES.RECEIVABLES_LIQUIDATIONS },
    ],
  },
  {
    icon: Banknote,
    label: 'Pagamentos',
    route: ROUTES.SUPPLIER_MANAGEMENT,
    items: [
      { label: 'Duplicatas Recebidas', route: ROUTES.NOTIFICACOES_DUPLICATAS },
      { label: 'Gestão de Domicílio', route: ROUTES.DOMICILE_MANAGEMENT_NEW },
      { label: 'Novos Recebedores', route: ROUTES.FORNECEDOR_DIVERGENTE_LEGACY },
      { label: 'Relatório de Pagamentos', route: ROUTES.PAYMENT_REPORT },
      {
        label: 'Gestão de Acordos',
        route: ROUTES.ACORDOS_COMERCIAIS,
        items: [
          { label: 'Empresa', route: ROUTES.ACORDOS_COMERCIAIS },
          { label: 'Fornecedor', route: ROUTES.ACORDOS_COMERCIAIS_REVISAO_PROPOSTA },
        ],
      },
    ],
  },
  {
    icon: ToggleLeft,
    label: 'Gestão de Opt-in',
    route: ROUTES.OPT_IN_MANAGEMENT,
  },
  {
    icon: Users,
    label: 'Parceiro de Escrituração',
    route: ROUTES.AGENTE_INTERMEDIADOR,
    items: [
      { label: 'Dashboard', route: ROUTES.AGENTE_INTERMEDIADOR },
      { label: 'Fornecedores', route: ROUTES.AGENTE_INTERMEDIADOR_FORNECEDORES },
      { label: 'Duplicatas', route: ROUTES.AGENTE_INTERMEDIADOR_DUPLICATAS },
      { label: 'Envio de contratos', route: ROUTES.AGENTE_INTERMEDIADOR_CONTRATOS },
    ],
  },
  {
    icon: CloudCog,
    label: 'Automações',
    route: ROUTES.AUTOMACOES,
  },
] as const;

export const footerMenuItems = [
  {
    icon: Cog,
    label: 'Configurações',
    route: ROUTES.SETTINGS,
    items: [
      { label: 'Concessão automática de crédito'},
      { label: 'Assinaturas'},
      { label: 'Perfis e acessos', route: ROUTES.PROFILES_ACCESS },
      { label: 'Alertas e notificações'},
    ],
  },
] as const;

export const findParentRoutes = (items: any[], targetRoute: string, path: string[] = []): string[] => {
  for (const item of items) {
    if (item.route === targetRoute) {
      return [...path, item.route];
    }
    if (item.items) {
      const found = findParentRoutes(item.items, targetRoute, [...path, item.route]);
      if (found.length) return found;
    }
  }
  return [];
};
