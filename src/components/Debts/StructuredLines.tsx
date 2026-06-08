import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeContainer from '../common/IframeContainer';

interface StructuredLinesProps {
  isForeignCurrency?: boolean;
}

const StructuredLines: React.FC<StructuredLinesProps> = ({ isForeignCurrency = false }) => {
  const url = isForeignCurrency 
    ? PROJECT_URLS[ROUTES.DEBTS_STRUCTURED_LINES_FOREIGN]
    : PROJECT_URLS[ROUTES.DEBTS_STRUCTURED_LINES];
    
  return (
    <IframeContainer
      src={url}
      title={isForeignCurrency ? "Linhas Estruturadas em M.E." : "Linhas Estruturadas"}
      data-iframe="debts-structured-lines"
    />
  );
};

export default StructuredLines;