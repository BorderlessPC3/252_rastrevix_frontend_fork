import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import ConnectionStatus from './ConnectionStatus';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';

const Layout: React.FC = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : true;
  });
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
  }, [isMobile, sidebarOpen]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebarCollapse = () => {
    if (!isMobile) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`app-layout ${isMobile ? 'app-layout--mobile' : ''}`}>
      <Sidebar
        isOpen={isMobile ? sidebarOpen : true}
        onClose={closeSidebar}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobile={isMobile}
      />

      <div
        className={`main-container ${!isMobile && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        <div className="main-header">
          <div className="page-title">
            {isMobile && (
              <button
                type="button"
                className="sidebar-toggle-btn"
                onClick={openSidebar}
                aria-label="Abrir menu de navegação"
                aria-expanded={sidebarOpen}
              >
                <Menu size={22} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
            <h1>Rastrevix</h1>
          </div>
          <div className="header-actions">
            <ConnectionStatus />
          </div>
        </div>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
