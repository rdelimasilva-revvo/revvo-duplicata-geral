import { useState, useEffect } from 'react';

interface IframeLoaderOptions {
  iframeSelector?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const useIframeLoader = (options: IframeLoaderOptions = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
      setHasError(false);
      options.onLoad?.();
    };

    const handleIframeError = (event: ErrorEvent) => {
      console.error('Iframe loading error:', event);
      setIsLoading(false);
      setHasError(true);
      setErrorMessage('Failed to load the embedded content. Please try again later.');
      options.onError?.(event.error);
    };

    // Use the provided selector or default to any iframe
    const selector = options.iframeSelector || 'iframe';
    const iframe = document.querySelector(selector) as HTMLIFrameElement;

    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);

      // Add additional error detection
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setHasError(true);
          setErrorMessage('The content is taking too long to load. Please check your connection.');
          setIsLoading(false);
        }
      }, 30000); // 30 second timeout

      return () => {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
        clearTimeout(timeoutId);
      };
    }
  }, [options]);

  return { isLoading, hasError, errorMessage };
};