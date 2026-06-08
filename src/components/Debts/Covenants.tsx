import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeContainer from '../common/IframeContainer';

const Covenants = () => {
  return (
    <IframeContainer
      src={PROJECT_URLS[ROUTES.DEBTS_COVENANTS]}
      title="Covenants"
      data-iframe="debts-covenants"
    />
  );
};

export default Covenants;