import React from 'react';
import IframeContainer from '../common/IframeContainer';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';

const DomicileManagement = () => {
  return (
    <IframeContainer
      src="https://effulgent-marshmallow-b4075d.netlify.app"
      title="Notificações de duplicatas"
      data-iframe="domicile-management"
    />
  );
};

export default DomicileManagement;