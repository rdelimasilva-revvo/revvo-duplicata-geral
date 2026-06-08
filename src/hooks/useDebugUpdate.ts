import { useEffect } from 'react';
import { useDebug } from '../context/DebugContext';
import { useCompany } from '../context/CompanyContext';
import { useConfig } from '../context/ConfigContext';

export const useDebugUpdate = () => {
  const { isDebugEnabled, setDebugData } = useDebug();
  const { companyId } = useCompany();
  const { setupReady } = useConfig();

  useEffect(() => {
    if (isDebugEnabled) {
      setDebugData({
        // Application State
        companyId: companyId || '<undefined>',
        debugPanelEnabled: isDebugEnabled,
        setupReady: setupReady || false,
        configReady: false,
        isAuthenticated: false,
        currentRoute: window.location.pathname,
        
        // Environment
        nodeEnv: import.meta.env.MODE,
        baseUrl: import.meta.env.BASE_URL,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        
        // System Info
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
        
        // Browser Info
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        
        // Window Info
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        
        // Performance
        memory: performance.memory ? {
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576)
        } : '<not available>',
        
        // Network
        onLine: navigator.onLine,
        connection: navigator.connection ? {
          type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : '<not available>'
      });
    }
  }, [isDebugEnabled, companyId, setupReady, setDebugData]);

  // Update debug data when window is resized
  useEffect(() => {
    if (!isDebugEnabled) return;

    const handleResize = () => {
      setDebugData(prev => ({
        ...prev,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDebugEnabled, setDebugData]);
};