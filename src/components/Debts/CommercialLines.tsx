import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeContainer from '../common/IframeContainer';

const CommercialLines = () => {
  return (
    <IframeContainer
      src={PROJECT_URLS[ROUTES.DEBTS_COMMERCIAL_LINES]}
      title="Linhas Comerciais"
      data-iframe="debts-commercial-lines"
    />
  );
};

export default CommercialLines;