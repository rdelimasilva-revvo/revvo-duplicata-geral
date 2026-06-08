import React from 'react';
import AcordosComerciais from '@/modules/acordosComerciais';
import { ROUTES } from '@/constants/routes';

export const acordosComerciaisRoutes = [
  {
    path: ROUTES.ACORDOS_COMERCIAIS,
    element: <AcordosComerciais />,
  },
];
