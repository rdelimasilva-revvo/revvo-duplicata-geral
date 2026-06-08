import React from 'react';
import GestorDomicilio from '@/modules/gestorDomicilio';
import { ROUTES } from '@/constants/routes';

export const gestorDomicilioRoutes = [
  {
    path: ROUTES.DOMICILE_MANAGEMENT_NEW,
    element: <GestorDomicilio />,
  },
  {
    path: ROUTES.DOMICILE_MANAGEMENT,
    element: <GestorDomicilio />,
  },
];
