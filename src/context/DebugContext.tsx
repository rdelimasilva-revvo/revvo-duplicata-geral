import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DebugContextType {
  isDebugEnabled: boolean;
  setDebugEnabled: (enabled: boolean) => void;
  debugData: Record<string, any>;
  setDebugData: (data: Record<string, any>) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDebugEnabled, setDebugEnabled] = useState(false);
  const [debugData, setDebugData] = useState<Record<string, any>>({});

  return (
    <DebugContext.Provider value={{ 
      isDebugEnabled, 
      setDebugEnabled, 
      debugData, 
      setDebugData 
    }}>
      {children}
      {isDebugEnabled && <DebugPanel />}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

const DebugPanel: React.FC = () => {
  const { debugData } = useDebug();

  const formatValue = (value: any) => {
    if (value === undefined) return '<undefined>';
    if (value === null) return '<null>';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white rounded-lg shadow-lg z-50 text-sm">
      <div className="flex items-center p-2 space-x-2">
        <span className="font-medium">Debug Panel</span>
        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
      </div>
      {Object.keys(debugData).length === 0 ? (
        <div className="px-3 pb-2 text-gray-400 text-xs italic">
          No debug data available
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto px-3 pb-2">
          <div className="space-y-1">
            {Object.entries(debugData).map(([key, value]) => (
              <div key={key} className="flex items-start space-x-2 text-xs">
                <span className="text-blue-400 font-mono whitespace-nowrap">{key}:</span>
                <span className="text-green-400 font-mono break-all">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};