import { ReactNode } from 'react';
import { inicioRecebiveisRoutes } from '@/modules/inicioRecebiveis/routes';
import { notasFiscaisRoutes } from '@/modules/notasFiscais/routes';
import { escrituracaoDuplicataRoutes } from '@/modules/escrituracaoDuplicata/routes';
import { notificacaoDuplicataRoutes } from '@/modules/notificacaoDuplicata/routes';
import { gestorDomicilioRoutes } from '@/modules/gestorDomicilio/routes';
import { automacoesRoutes } from '@/modules/automacoes/routes';
import { acordosComerciaisRoutes } from '@/modules/acordosComerciais/routes';

export interface ModuleRoute {
  path: string;
  element: ReactNode;
}

export const modulesRoutes: ModuleRoute[] = [
  ...inicioRecebiveisRoutes,
  ...notasFiscaisRoutes,
  ...escrituracaoDuplicataRoutes,
  ...notificacaoDuplicataRoutes,
  ...gestorDomicilioRoutes,
  ...automacoesRoutes,
  ...acordosComerciaisRoutes,
];
