import {
  BarChart3,
  CreditCard,
  Banknote,
  Users,
  Cog,
  Activity
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export const menuItems = [
  { icon: BarChart3, label: 'Dashboard Escritural', route: ROUTES.HOME },
  {
    icon: CreditCard,
    label: 'Recebíveis',
    route: ROUTES.RECEIVABLES,
    items: [
      { label: 'Início', route: ROUTES.RECEIVABLES_HOME },
      { label: 'Notas Fiscais', route: ROUTES.RECEIVABLES_NOTAS_FISCAIS },
      { label: 'Duplicatas', route: ROUTES.RECEIVABLES },
      { label: 'Controle de Liquidações', route: ROUTES.RECEIVABLES_LIQUIDATIONS },
      { label: 'Automações', route: ROUTES.AUTOMACOES },
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
      { label: 'Automações', route: ROUTES.AUTOMACOES },
    ],
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
      { label: 'Agente de oneração', route: ROUTES.AGENTE_INTERMEDIADOR_ONERACAO },
    ],
  },
  { icon: Activity, label: 'Status integrações', route: ROUTES.INTEGRATIONS_STATUS },
] as const;

export const footerMenuItems = [
  {
    icon: Cog,
    label: 'Configurações',
    route: ROUTES.SETTINGS,
    items: [
      { label: 'Concessão automática de crédito'},
      { label: 'Assinaturas'},
      { label: 'Cadastro de sacados', route: ROUTES.RECEIVABLES_SACADOS },
      { label: 'Opt-in', route: ROUTES.OPT_IN_MANAGEMENT },
      { label: 'Perfis e acessos', route: ROUTES.PROFILES_ACCESS },
      { label: 'Alertas e notificações'},
      { label: 'Ocultar menus', route: ROUTES.MENU_VISIBILITY },
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
