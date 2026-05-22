import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPath } from '../utils/rbac';
import { useTheme } from '../contexts/ThemeContext';
import { PRODUCT_MENU, type ProductMenuItem } from '../config/productMenu';
import {
  Home,
  Map,
  Plus,
  User,
  Cog,
  Users,
  ChevronDown,
  ShoppingCart,
  Cpu,
  Building,
  FileText,
  History,
  Truck,
  AlertCircle,
  Wrench,
  Route,
  TrendingUp,
  Car,
  Activity,
  Briefcase,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SUBMENU_ROUTE_PREFIX: Record<string, string> = {
  Mapa: '/mapa',
  Cadastro: '/cadastro',
  Estoque: '/estoque',
  Relatórios: '/relatorios',
  Telemetria: '/telemetria',
  Gerência: '/gerencia'
};

function buildSubmenuOpenState(pathname: string): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const [name, prefix] of Object.entries(SUBMENU_ROUTE_PREFIX)) {
    next[name] = pathname.startsWith(prefix);
  }
  return next;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { branding } = useTheme();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() =>
    buildSubmenuOpenState(location.pathname)
  );

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    setOpenSubmenus(buildSubmenuOpenState(location.pathname));
  }, [location.pathname]);

  const getIcon = (iconName: string, size: number = 20) => {
    const iconProps = { size, className: 'sidebar-icon' };

    switch (iconName) {
      case 'home':
        return <Home {...iconProps} />;
      case 'map':
        return <Map {...iconProps} />;
      case 'plus':
        return <Plus {...iconProps} />;
      case 'user':
        return <User {...iconProps} />;
      case 'cog':
        return <Cog {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'shopping-cart':
        return <ShoppingCart {...iconProps} />;
      case 'cpu':
        return <Cpu {...iconProps} />;
      case 'building':
        return <Building {...iconProps} />;
      case 'file-text':
        return <FileText {...iconProps} />;
      case 'history':
        return <History {...iconProps} />;
      case 'truck':
        return <Truck {...iconProps} />;
      case 'alert-circle':
        return <AlertCircle {...iconProps} />;
      case 'wrench':
        return <Wrench {...iconProps} />;
      case 'route':
        return <Route {...iconProps} />;
      case 'trending-up':
        return <TrendingUp {...iconProps} />;
      case 'car':
        return <Car {...iconProps} />;
      case 'activity':
        return <Activity {...iconProps} />;
      case 'briefcase':
        return <Briefcase {...iconProps} />;
      case 'refresh-cw':
        return <RefreshCw {...iconProps} />;
      default:
        return <div className="sidebar-icon" style={{ width: size, height: size }} />;
    }
  };

  const menuItems: ProductMenuItem[] = PRODUCT_MENU;

  const filterByRole = (items: ProductMenuItem[]) => {
    const role = user?.role;
    return items
      .filter((item) => !item.protected || isAuthenticated)
      .map((item) => {
        if (!item.submenu) {
          return item.path && !canAccessPath(item.path, role) ? null : item;
        }
        const submenu = item.submenu.filter(
          (sub): sub is ProductMenuItem & { path: string } =>
            typeof sub.path === 'string' && canAccessPath(sub.path, role)
        );
        if (submenu.length === 0) return null;
        return { ...item, submenu };
      })
      .filter(Boolean) as typeof menuItems;
  };

  const filteredMenuItems = filterByRole(menuItems);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="" className="logo-img" style={{ height: 28 }} />
            ) : (
              <span className="logo-icon" />
            )}
            {!isCollapsed && <span className="logo-text">{branding?.name || 'Rastrevix'}</span>}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>‹</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {filteredMenuItems.map((item) => (
              <li key={item.path || item.name} className="sidebar-item">
                {item.submenu ? (
                  <div className="sidebar-submenu">
                    <div
                      className="sidebar-link sidebar-submenu-header"
                      onClick={() => toggleSubmenu(item.name)}
                      style={{ cursor: 'pointer' }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {getIcon(item.icon)}
                      {!isCollapsed && <span className="sidebar-text">{item.name}</span>}
                      {!isCollapsed && (
                        <ChevronDown
                          size={16}
                          className={`sidebar-arrow ${openSubmenus[item.name] ? 'open' : ''}`}
                        />
                      )}
                    </div>
                    {openSubmenus[item.name] && (
                      <ul className="sidebar-submenu-list">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path} className="sidebar-subitem">
                            <Link
                              to={subItem.path!}
                              className={`sidebar-sublink ${location.pathname === subItem.path ? 'active' : ''}`}
                              onClick={onClose}
                            >
                              {getIcon(subItem.icon, 16)}
                              {!isCollapsed && <span className="sidebar-text">{subItem.name}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path!}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={onClose}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {getIcon(item.icon)}
                    {!isCollapsed && <span className="sidebar-text">{item.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {isAuthenticated ? (
            <div className="user-info">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
              {!isCollapsed && (
                <div className="user-details">
                  <div className="user-name">{user?.name || 'Usuário'}</div>
                  <div className="user-email">{user?.email || ''}</div>
                </div>
              )}
              <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Sair"
                title={isCollapsed ? 'Sair' : undefined}
              >
                {!isCollapsed ? 'Sair' : '↗'}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link login-link" onClick={onClose}>
                {!isCollapsed ? 'Entrar' : '→'}
              </Link>
              <Link to="/register" className="auth-link register-link" onClick={onClose}>
                {!isCollapsed ? 'Cadastrar' : '+'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
