import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConfigContextType {
  configReady: boolean;
  setConfigReady: (ready: boolean) => void;
  setupReady: boolean;
  setSetupReady: (ready: boolean) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configReady, setConfigReady] = useState(false);
  const [setupReady, setSetupReady] = useState(false);

  return (
    <ConfigContext.Provider value={{ configReady, setConfigReady, setupReady, setSetupReady }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};