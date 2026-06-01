/**
 * Menu e rotas habilitadas — apenas funcionalidades com backend real.
 */

export interface ProductMenuItem {
  name: string;
  path?: string;
  icon: string;
  protected?: boolean;
  submenu?: ProductMenuItem[];
}

/** Itens exibidos na sidebar (fonte única de verdade) */
export const PRODUCT_MENU: ProductMenuItem[] = [
  { name: 'Dashboard', path: '/', icon: 'home', protected: true },
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
      { name: 'Cliente', path: '/cadastro/cliente', icon: 'user' },
      { name: 'Máquina', path: '/cadastro/maquina', icon: 'cog' },
      { name: 'Rastreador', path: '/cadastro/rastreador', icon: 'map' },
      { name: 'Colaborador', path: '/cadastro/colaborador', icon: 'users' }
    ]
  },
  {
    name: 'Estoque',
    icon: 'shopping-cart',
    protected: true,
    submenu: [
      { name: 'Chip GSM', path: '/estoque/chip-gsm', icon: 'cpu' },
      { name: 'Equipamento', path: '/estoque/equipamento', icon: 'cog' }
    ]
  },
  {
    name: 'Relatórios',
    icon: 'file-text',
    protected: true,
    submenu: [
      { name: 'Histórico', path: '/relatorios/historico', icon: 'history' },
      { name: 'Parada/Desloc.', path: '/relatorios/parada-deslocamento', icon: 'map' },
      { name: 'Logística', path: '/relatorios/logistica', icon: 'truck' },
      { name: 'Manutenção', path: '/relatorios/manutencao', icon: 'wrench' },
      { name: 'Viagem', path: '/relatorios/viagem', icon: 'route' },
      { name: 'Financeiro', path: '/relatorios/financeiro', icon: 'trending-up' },
      { name: 'Frota', path: '/relatorios/frota', icon: 'car' },
      { name: 'Desempenho', path: '/relatorios/desempenho', icon: 'activity' }
    ]
  },
  {
    name: 'Telemetria',
    icon: 'activity',
    protected: true,
    submenu: [{ name: 'Eventos', path: '/telemetria/evento', icon: 'alert-circle' }]
  },
  {
    name: 'Gerência',
    icon: 'briefcase',
    protected: true,
    submenu: [
      { name: 'Usuários / Admin', path: '/gerencia/usuarios', icon: 'users' },
      { name: 'Integração', path: '/gerencia/integracao', icon: 'refresh-cw' }
    ]
  },
  { name: 'Perfil', path: '/profile', icon: 'user', protected: true }
];

/** Rotas registradas no AppRouter (deve coincidir com o menu) */
export const ENABLED_APP_PATHS: readonly string[] = [
  '/',
  '/mapa',
  '/mapa/historico',
  '/cadastro/cliente',
  '/cadastro/maquina',
  '/cadastro/colaborador',
  '/cadastro/rastreador',
  '/estoque/chip-gsm',
  '/estoque/equipamento',
  '/estoque/fornecedor-chip-gsm',
  '/relatorios/historico',
  '/relatorios/parada-deslocamento',
  '/relatorios/logistica',
  '/relatorios/manutencao',
  '/relatorios/viagem',
  '/relatorios/financeiro',
  '/relatorios/frota',
  '/relatorios/desempenho',
  '/telemetria/evento',
  '/gerencia/integracao',
  '/gerencia/usuarios',
  '/profile'
] as const;

export function isEnabledAppPath(path: string): boolean {
  return (ENABLED_APP_PATHS as readonly string[]).includes(path);
}

