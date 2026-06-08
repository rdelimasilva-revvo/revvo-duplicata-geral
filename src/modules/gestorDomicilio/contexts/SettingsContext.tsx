import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  twoStepPayment: boolean;
  useWorkflow: boolean;
  isLoading: boolean;
  setTwoStepPayment: (value: boolean) => void;
  setUseWorkflow: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [twoStepPayment, setTwoStepPayment] = useState(false);
  const [useWorkflow, setUseWorkflow] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedPayment = localStorage.getItem('twoStepPayment');
        if (storedPayment !== null) {
          setTwoStepPayment(JSON.parse(storedPayment));
        }

        const storedWorkflow = localStorage.getItem('useWorkflow');
        if (storedWorkflow !== null) {
          setUseWorkflow(JSON.parse(storedWorkflow));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateTwoStepPayment = (value: boolean) => {
    setTwoStepPayment(value);
    localStorage.setItem('twoStepPayment', JSON.stringify(value));
  };

  const updateUseWorkflow = (value: boolean) => {
    setUseWorkflow(value);
    localStorage.setItem('useWorkflow', JSON.stringify(value));
  };

  return (
    <SettingsContext.Provider
      value={{
        twoStepPayment,
        useWorkflow,
        isLoading,
        setTwoStepPayment: updateTwoStepPayment,
        setUseWorkflow: updateUseWorkflow
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
