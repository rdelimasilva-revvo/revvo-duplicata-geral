import React from 'react';
import IframeContainer from '../common/IframeContainer';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';

const Subscriptions = () => {
  return (
    <IframeContainer
      src={PROJECT_URLS[ROUTES.SUBSCRIPTIONS]}
      title="Assinaturas"
      data-iframe="subscriptions"
    />
  );
};

export default Subscriptions;