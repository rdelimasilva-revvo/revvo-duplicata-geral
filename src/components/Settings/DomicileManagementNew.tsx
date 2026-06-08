import React from 'react';
import IframeContainer from '../common/IframeContainer';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';

const DomicileManagementNew = () => {
  return (
    <IframeContainer
      src={PROJECT_URLS[ROUTES.DOMICILE_MANAGEMENT_NEW]}
      title="Gestão de domicílios"
      data-iframe="domicile-management-new"
    />
  );
};

export default DomicileManagementNew;