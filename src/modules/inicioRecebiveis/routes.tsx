import InicioRecebiveis from '@/modules/inicioRecebiveis';
import { ROUTES } from '@/constants/routes';

export const inicioRecebiveisRoutes = [
  {
    path: ROUTES.RECEIVABLES_HOME,
    element: <InicioRecebiveis />,
  },
];
