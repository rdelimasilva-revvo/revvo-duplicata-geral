export const validateIframeOrigin = (origin: string, allowedOrigin: string): boolean => {
  try {
    const allowedUrl = new URL(allowedOrigin);
    const originUrl = new URL(origin);
    
    // Compare origins (protocol + hostname + port)
    return originUrl.origin === allowedUrl.origin;
  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
};

export const createIframeMessage = (type: string, payload: unknown) => ({
  type,
  payload,
  timestamp: new Date().toISOString(),
  source: 'revvo-platform'
});

export const validateIframeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && Boolean(urlObj.host);
  } catch {
    return false;
  }
};

export const getIframeErrorMessage = (error: Error): string => {
  if (error.message.includes('refused to connect')) {
    return 'The connection was refused. Please check if the service is available.';
  }
  if (error.message.includes('timeout')) {
    return 'The connection timed out. Please try again.';
  }
  return 'An error occurred while loading the content. Please try again later.';
};