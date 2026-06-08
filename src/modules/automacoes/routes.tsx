import React from 'react';
import Automacoes from '@/modules/automacoes';
import { ROUTES } from '@/constants/routes';

export const automacoesRoutes = [
  {
    path: ROUTES.AUTOMACOES,
    element: <Automacoes />,
  },
];
