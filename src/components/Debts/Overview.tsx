import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeContainer from '../common/IframeContainer';

const Overview = () => {
  return (
    <IframeContainer
      src={PROJECT_URLS[ROUTES.DEBTS_OVERVIEW]}
      title="Visão Geral de Dívidas"
      data-iframe="debts-overview"
    />
  );
};

export default Overview;