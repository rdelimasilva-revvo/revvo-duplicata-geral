import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Onboarding from './components/Onboarding/Onboarding';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { SacadorProvider } from './context/SacadorContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { DebugProvider } from './context/DebugContext';
import { ToastProvider } from './context/ToastContext';
import { useDebugUpdate } from './hooks/useDebugUpdate';
import { useDebug } from './context/DebugContext';
import { initializeDebug, setDebugPanel } from './utils/debug';
import { getStoredCompanyId, storeCompanyId } from './utils/storage';
import { ROUTES } from './constants/routes';
import { useAuthStore } from './store/authStore';
import { RevvoLayout } from './components/Revvo/layout/RevvoLayout';
import { NotificacoesDuplicatas } from './components/Revvo/pages/NotificacoesDuplicatas';
import { NovosRecebedores } from './components/Revvo/pages/NovosRecebedores';
import { GestaoOptIn } from './components/Revvo/pages/GestaoOptIn';
import { GestaoDomicilio } from './components/Revvo/pages/GestaoDomicilio';
import { AgenteIntermediador } from './components/Revvo/pages/AgenteIntermediador';
import NotificacoesDuplicatasFullPage from './pages/NotificacoesDuplicatasFullPage';
import SupplierPortalPage from './pages/SupplierPortal/SupplierPortalPage';
import AcordosComerciaisPortal from './pages/SupplierPortal/AcordosComerciaisPortal';

const AppContent = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const currentView = segments.slice(1).join('/') || ROUTES.HOME;
  const navigate = useNavigate();

  const handleMenuClick = (view: string) => {
    if (view.startsWith('/')) {
      navigate(view);
      return;
    }
    navigate(`/app/${view}`);
  };

  return <MainLayout currentView={currentView} onMenuClick={handleMenuClick} />;
};

const AppRoutes: React.FC = () => {
  const { setCompanyId } = useCompany();
  const { setSetupReady } = useConfig();
  const { setDebugEnabled } = useDebug();
  const bootstrapTestSession = useAuthStore((s) => s.bootstrapTestSession);
  const isAuthenticated = true;
  useDebugUpdate();

  useEffect(() => {
    initializeDebug({ setDebugEnabled });
    setDebugPanel(false);
  }, [setDebugEnabled]);

  useEffect(() => {
    bootstrapTestSession();
  }, [bootstrapTestSession]);

  useEffect(() => {
    const storedCompanyId = getStoredCompanyId() || 'demo-company';
    setCompanyId(storedCompanyId);
    storeCompanyId(storedCompanyId);
    setSetupReady(true);
  }, [setCompanyId, setSetupReady]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/config/start"
        element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" replace />}
      />

      <Route path="/revvo" element={<RevvoLayout />}>
        <Route index element={<Navigate to="/revvo/notificacoes-duplicatas" replace />} />
        <Route path="notificacoes-duplicatas" element={<NotificacoesDuplicatas />} />
        <Route path="novos-recebedores" element={<NovosRecebedores />} />
        <Route path="gestao-optin" element={<GestaoOptIn />} />
        <Route path="gestao-domicilio" element={<GestaoDomicilio />} />
        <Route path="agente-intermediador" element={<AgenteIntermediador />} />
      </Route>

      <Route
        path="/dashboard/notificacoes-duplicatas"
        element={<NotificacoesDuplicatasFullPage />}
      />

      <Route path="/supplier-portal" element={<SupplierPortalPage />} />
      <Route path="/supplier-portal/acordos-comerciais" element={<AcordosComerciaisPortal />} />

      <Route
        path="/app"
        element={isAuthenticated ? <Navigate to="/app/home" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/app/*"
        element={isAuthenticated ? <AppContent /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/meu-perfil"
        element={isAuthenticated ? <Navigate to="/app/meu-perfil" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={isAuthenticated ? <Navigate to="/app/home" replace /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <CompanyProvider>
      <SacadorProvider>
        <DebugProvider>
          <ConfigProvider>
            <ToastProvider>
              <Router>
                <AppRoutes />
              </Router>
            </ToastProvider>
          </ConfigProvider>
        </DebugProvider>
      </SacadorProvider>
    </CompanyProvider>
  );
}

export default App;
