import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPath, isEnabledAppPath } from '../utils/rbac';
import { showError } from '../utils/toast';
import PageFeedback from '../components/PageFeedback';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const deniedNotified = useRef(false);

  useEffect(() => {
    deniedNotified.current = false;
  }, [location.pathname]);

  if (loading) {
    return (
      <PageFeedback loading loadingMessage="Verificando sessão…" />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const path = location.pathname;

  if (!isEnabledAppPath(path)) {
    return <Navigate to="/" replace />;
  }

  if (!canAccessPath(path, user?.role)) {
    if (!deniedNotified.current) {
      deniedNotified.current = true;
      showError('Você não tem permissão para acessar esta página.');
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
