import React from 'react';
import NotificacaoDuplicata from '@/modules/notificacaoDuplicata';
import DuplicatasRecebidasPage from '@/modules/notificacaoDuplicata/pages/DuplicatasRecebidasPage';
import ManifestacoesPendentesPage from '@/modules/notificacaoDuplicata/pages/ManifestacoesPendentesPage';
import { ROUTES } from '@/constants/routes';

export const notificacaoDuplicataRoutes = [
  {
    path: ROUTES.NOTIFICACOES_DUPLICATAS,
    element: <NotificacaoDuplicata />,
  },
  {
    path: ROUTES.NOTIFICACOES_DUPLICATAS_RECEBIDAS,
    element: <DuplicatasRecebidasPage />,
  },
  {
    path: ROUTES.NOTIFICACOES_DUPLICATAS_MANIFESTACAO,
    element: <ManifestacoesPendentesPage />,
  },
  {
    path: ROUTES.NOTIFICACOES_DUPLICATAS_PENDENTES,
    element: <ManifestacoesPendentesPage />,
  },
];
