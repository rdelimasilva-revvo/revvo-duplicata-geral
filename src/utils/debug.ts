let debugInstance: { setDebugEnabled: (enabled: boolean) => void } | null = null;
let isDebugEnabled = false;

export const initializeDebug = (instance: { setDebugEnabled: (enabled: boolean) => void }) => {
  debugInstance = instance;
  // Restore debug state if it was previously enabled
  if (isDebugEnabled) {
    instance.setDebugEnabled(true);
  }
};

export const setDebugPanel = (enabled: boolean) => {
  isDebugEnabled = enabled;
  if (debugInstance) {
    debugInstance.setDebugEnabled(enabled);
  } else {
    console.warn('Debug panel not initialized');
  }
};