import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeContainer from '../common/IframeContainer';

interface IntercompanyLinesProps {
  isSupplyChain?: boolean;
}

const IntercompanyLines: React.FC<IntercompanyLinesProps> = ({ isSupplyChain = false }) => {
  const url = isSupplyChain
    ? PROJECT_URLS[ROUTES.DEBTS_SUPPLY_CHAIN]
    : PROJECT_URLS[ROUTES.DEBTS_INTERCOMPANY_LINES];

  return (
    <IframeContainer
      src={url}
      title={isSupplyChain ? "Risco Sacado" : "Linhas entre Empresas"}
      data-iframe="debts-intercompany-lines"
    />
  );
};

export default IntercompanyLines;