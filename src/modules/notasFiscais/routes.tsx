import NotasFiscais from '@/modules/notasFiscais';
import { ROUTES } from '@/constants/routes';

export const notasFiscaisRoutes = [
  {
    path: ROUTES.RECEIVABLES_NOTAS_FISCAIS,
    element: <NotasFiscais />,
  },
];
