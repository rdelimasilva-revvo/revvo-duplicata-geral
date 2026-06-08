import React from 'react';
import { useIframeLoader } from '../../hooks';
import IframeErrorBoundary from './IframeErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

interface IframeContainerProps {
  src: string;
  title: string;
  iframeSelector?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const IframeContainer: React.FC<IframeContainerProps> = ({
  src,
  title,
  iframeSelector,
  className = '',
  onLoad,
  onError,
}) => {
  const { isLoading, hasError, errorMessage } = useIframeLoader({
    iframeSelector,
    onLoad,
    onError,
  });

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {`Não foi possível carregar ${title}`}
          </h2>
          <p className="text-gray-600">
            {errorMessage || 'Por favor, tente novamente mais tarde ou contate o suporte.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <IframeErrorBoundary>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner />}
        <iframe
          src={src}
          className={`w-full h-full min-h-[calc(100vh-180px)] ${className}`}
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title={title}
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default IframeContainer;