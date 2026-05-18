import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPath } from '../utils/rbac';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  Map,
  Plus,
  User,
  Cog,
  Users,
  Settings,
  HelpCircle,
  ChevronDown,
  ShoppingCart,
  Cpu,
  Building,
  FileText,
  History,
  Clock,
  Truck,
  AlertCircle,
  Wrench,
  Fuel,
  FileWarning,
  Route,
  DollarSign,
  Package,
  CheckSquare,
  Link2,
  MapPin,
  Shield,
  Timer,
  Building2,
  TrendingUp,
  Car,
  Square,
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { branding } = useTheme();
  const [isCadastroOpen, setIsCadastroOpen] = useState(location.pathname.startsWith('/cadastro'));
  const [isEstoqueOpen, setIsEstoqueOpen] = useState(location.pathname.startsWith('/estoque'));
  const [isRelatoriosOpen, setIsRelatoriosOpen] = useState(location.pathname.startsWith('/relatorios'));
  const [isPerimetrosOpen, setIsPerimetrosOpen] = useState(location.pathname.startsWith('/perimetros'));
  const [isTelemetriaOpen, setIsTelemetriaOpen] = useState(location.pathname.startsWith('/telemetria'));
  const [isGerenciaOpen, setIsGerenciaOpen] = useState(location.pathname.startsWith('/gerencia'));
  const [isMapaOpen, setIsMapaOpen] = useState(location.pathname.startsWith('/mapa'));

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const toggleCadastro = () => {
    setIsCadastroOpen(!isCadastroOpen);
  };

  const toggleEstoque = () => {
    setIsEstoqueOpen(!isEstoqueOpen);
  };

  const toggleRelatorios = () => {
    setIsRelatoriosOpen(!isRelatoriosOpen);
  };

  const togglePerimetros = () => {
    setIsPerimetrosOpen(!isPerimetrosOpen);
  };

  const toggleTelemetria = () => {
    setIsTelemetriaOpen(!isTelemetriaOpen);
  };

  const toggleGerencia = () => {
    setIsGerenciaOpen(!isGerenciaOpen);
  };

  const toggleMapa = () => {
    setIsMapaOpen(!isMapaOpen);
  };

  // Abrir menu automaticamente quando estiver na rota correspondente
  useEffect(() => {
    setIsCadastroOpen(location.pathname.startsWith('/cadastro'));
    setIsEstoqueOpen(location.pathname.startsWith('/estoque'));
    setIsRelatoriosOpen(location.pathname.startsWith('/relatorios'));
    setIsPerimetrosOpen(location.pathname.startsWith('/perimetros'));
    setIsTelemetriaOpen(location.pathname.startsWith('/telemetria'));
    setIsGerenciaOpen(location.pathname.startsWith('/gerencia'));
    setIsMapaOpen(location.pathname.startsWith('/mapa'));
  }, [location.pathname]);

  const getIcon = (iconName: string, size: number = 20) => {
    const iconProps = { size, className: "sidebar-icon" };

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
      case 'settings':
        return <Settings {...iconProps} />;
      case 'help':
        return <HelpCircle {...iconProps} />;
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
      case 'clock':
        return <Clock {...iconProps} />;
      case 'truck':
        return <Truck {...iconProps} />;
      case 'alert-circle':
        return <AlertCircle {...iconProps} />;
      case 'wrench':
        return <Wrench {...iconProps} />;
      case 'fuel':
        return <Fuel {...iconProps} />;
      case 'file-warning':
        return <FileWarning {...iconProps} />;
      case 'route':
        return <Route {...iconProps} />;
      case 'dollar-sign':
        return <DollarSign {...iconProps} />;
      case 'package':
        return <Package {...iconProps} />;
      case 'check-square':
        return <CheckSquare {...iconProps} />;
      case 'link2':
        return <Link2 {...iconProps} />;
      case 'map-pin':
        return <MapPin {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'timer':
        return <Timer {...iconProps} />;
      case 'building2':
        return <Building2 {...iconProps} />;
      case 'trending-up':
        return <TrendingUp {...iconProps} />;
      case 'car':
        return <Car {...iconProps} />;
      case 'square':
        return <Square {...iconProps} />;
      case 'activity':
        return <Activity {...iconProps} />;
      case 'briefcase':
        return <Briefcase {...iconProps} />;
      case 'refresh-cw':
        return <RefreshCw {...iconProps} />;
      default:
        return <div className="sidebar-icon" style={{ width: size, height: size }}></div>;
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: 'home',
      protected: true
    },
    {
      name: 'Mapa',
      icon: 'map',
      protected: true,
      submenu: [
        { name: 'Ao vivo', path: '/mapa', icon: 'map' },
        { name: 'Histórico / Replay', path: '/mapa/historico', icon: 'history' }
      ]
    },
    {
      name: 'Cadastro',
      icon: 'plus',
      protected: true,
      submenu: [
        {
          name: 'Cliente',
          path: '/cadastro/cliente',
          icon: 'user'
        },
        {
          name: 'Máquina',
          path: '/cadastro/maquina',
          icon: 'cog'
        },
        {
          name: 'Rastreador',
          path: '/cadastro/rastreador',
          icon: 'map'
        },
        {
          name: 'Colaborador',
          path: '/cadastro/colaborador',
          icon: 'users'
        }
      ]
    },
    {
      name: 'Estoque',
      icon: 'shopping-cart',
      protected: true,
      submenu: [
        {
          name: 'Chip GSM',
          path: '/estoque/chip-gsm',
          icon: 'cpu'
        },
        {
          name: 'Equipamento',
          path: '/estoque/equipamento',
          icon: 'cog'
        },
        {
          name: 'Forn. Chip GSM',
          path: '/estoque/fornecedor-chip-gsm',
          icon: 'building'
        }
      ]
    },
    {
      name: 'Relatórios',
      icon: 'file-text',
      protected: true,
      submenu: [
        {
          name: 'Histórico',
          path: '/relatorios/historico',
          icon: 'history'
        },
        {
          name: 'Parada/Desloc.',
          path: '/relatorios/parada-deslocamento',
          icon: 'map'
        },
        {
          name: 'Moto./Jornada',
          path: '/relatorios/motorista-jornada',
          icon: 'clock'
        },
        {
          name: 'Logística',
          path: '/relatorios/logistica',
          icon: 'truck'
        },
        {
          name: 'Evento',
          path: '/relatorios/evento',
          icon: 'alert-circle'
        },
        {
          name: 'Manutenção',
          path: '/relatorios/manutencao',
          icon: 'wrench'
        },
        {
          name: 'Abastecimento',
          path: '/relatorios/abastecimento',
          icon: 'fuel'
        },
        {
          name: 'Multa',
          path: '/relatorios/multa',
          icon: 'file-warning'
        },
        {
          name: 'Viagem',
          path: '/relatorios/viagem',
          icon: 'route'
        },
        {
          name: 'Custo de Viagem',
          path: '/relatorios/custo-viagem',
          icon: 'dollar-sign'
        },
        {
          name: 'Entrega',
          path: '/relatorios/entrega',
          icon: 'package'
        },
        {
          name: 'Checklist',
          path: '/relatorios/checklist',
          icon: 'check-square'
        },
        {
          name: 'Vínculo',
          path: '/relatorios/vinculo',
          icon: 'link2'
        },
        {
          name: 'Pontos',
          path: '/relatorios/pontos',
          icon: 'map-pin'
        },
        {
          name: 'Cercas',
          path: '/relatorios/cercas',
          icon: 'shield'
        },
        {
          name: 'Atraso',
          path: '/relatorios/atraso',
          icon: 'timer'
        },
        {
          name: 'Matriz/Cliente',
          path: '/relatorios/matriz-cliente',
          icon: 'building2'
        },
        {
          name: 'Financeiro',
          path: '/relatorios/financeiro',
          icon: 'trending-up'
        },
        {
          name: 'Frota',
          path: '/relatorios/frota',
          icon: 'car'
        }
      ]
    },
    {
      name: 'Telemetria',
      icon: 'activity',
      protected: true,
      submenu: [
        {
          name: 'Evento',
          path: '/telemetria/evento',
          icon: 'alert-circle'
        }
      ]
    },
    {
      name: 'Perímetros',
      icon: 'square',
      protected: true,
      submenu: [
        {
          name: 'Ponto',
          path: '/perimetros/ponto',
          icon: 'map-pin'
        },
        {
          name: 'Cerca',
          path: '/perimetros/cerca',
          icon: 'shield'
        },
        {
          name: 'Rota',
          path: '/perimetros/rota',
          icon: 'route'
        }
      ]
    },
    {
      name: 'Gerência',
      icon: 'briefcase',
      protected: true,
      submenu: [
        {
          name: 'Integração',
          path: '/gerencia/integracao',
          icon: 'refresh-cw'
        }
      ]
    },
    {
      name: 'Perfil',
      path: '/profile',
      icon: 'user',
      protected: true
    },
    {
      name: 'Configurações',
      path: '/settings',
      icon: 'settings',
      protected: true
    },
    {
      name: 'Ajuda',
      path: '/help',
      icon: 'help',
      protected: false
    }
  ];

  const filterByRole = (items: typeof menuItems) => {
    const role = user?.role;
    return items
      .filter((item) => !item.protected || isAuthenticated)
      .map((item) => {
        if (!item.submenu) {
          return item.path && !canAccessPath(item.path, role) ? null : item;
        }
        const submenu = item.submenu.filter(
          (sub) => canAccessPath(sub.path, role)
        );
        if (submenu.length === 0) return null;
        return { ...item, submenu };
      })
      .filter(Boolean) as typeof menuItems;
  };

  const filteredMenuItems = filterByRole(menuItems);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="" className="logo-img" style={{ height: 28 }} />
            ) : (
              <span className="logo-icon"></span>
            )}
            {!isCollapsed && (
              <span className="logo-text">{branding?.name || 'Rastrevix'}</span>
            )}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
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
                      onClick={
                        item.name === 'Cadastro' ? toggleCadastro
                          : item.name === 'Estoque' ? toggleEstoque
                            : item.name === 'Relatórios' ? toggleRelatorios
                              : item.name === 'Telemetria' ? toggleTelemetria
                                : item.name === 'Perímetros' ? togglePerimetros
                                  : item.name === 'Gerência' ? toggleGerencia
                                    : item.name === 'Mapa' ? toggleMapa
                                    : undefined
                      }
                      style={{ cursor: 'pointer' }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {getIcon(item.icon)}
                      {!isCollapsed && <span className="sidebar-text">{item.name}</span>}
                      {!isCollapsed && <ChevronDown size={16} className={`sidebar-arrow ${(item.name === 'Cadastro' && isCadastroOpen) || (item.name === 'Estoque' && isEstoqueOpen) || (item.name === 'Relatórios' && isRelatoriosOpen) || (item.name === 'Telemetria' && isTelemetriaOpen) || (item.name === 'Perímetros' && isPerimetrosOpen) || (item.name === 'Gerência' && isGerenciaOpen) || (item.name === 'Mapa' && isMapaOpen) ? 'open' : ''}`} />}
                    </div>
                    {((item.name === 'Cadastro' && isCadastroOpen) || (item.name === 'Estoque' && isEstoqueOpen) || (item.name === 'Relatórios' && isRelatoriosOpen) || (item.name === 'Telemetria' && isTelemetriaOpen) || (item.name === 'Perímetros' && isPerimetrosOpen) || (item.name === 'Gerência' && isGerenciaOpen) || (item.name === 'Mapa' && isMapaOpen)) && (
                      <ul className="sidebar-submenu-list">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path} className="sidebar-subitem">
                            <Link
                              to={subItem.path}
                              className={`sidebar-sublink ${location.pathname === subItem.path ? 'active' : ''
                                }`}
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
                    to={item.path}
                    className={`sidebar-link ${location.pathname === item.path ? 'active' : ''
                      }`}
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
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="user-details">
                  <div className="user-name">
                    {user?.name || 'Usuário'}
                  </div>
                  <div className="user-email">
                    {user?.email || 'user@email.com'}
                  </div>
                </div>
              )}
              <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Sair"
                title={isCollapsed ? "Sair" : undefined}
              >
                {!isCollapsed ? "Sair" : "↗"}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-link login-link">
                {!isCollapsed ? "Entrar" : "→"}
              </Link>
              <Link to="/register" className="auth-link register-link">
                {!isCollapsed ? "Cadastrar" : "+"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;

