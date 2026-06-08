import React from 'react';
import RevvoDashboardLayout from '../components/Layout/RevvoDashboardLayout';
import NotificacoesDuplicatasPage from './NotificacoesDuplicatasPage';

export default function NotificacoesDuplicatasFullPage() {
  return (
    <RevvoDashboardLayout activePath="/notificacoes-duplicatas">
      <NotificacoesDuplicatasPage />
    </RevvoDashboardLayout>
  );
}
