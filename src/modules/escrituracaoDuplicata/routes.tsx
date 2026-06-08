import React from 'react';
import EscrituracaoDuplicata from '@/modules/escrituracaoDuplicata';
import { ROUTES } from '@/constants/routes';

export const escrituracaoDuplicataRoutes = [
  {
    path: ROUTES.RECEIVABLES,
    element: <EscrituracaoDuplicata />,
  },
];
