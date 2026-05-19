/**
 * Menu e rotas habilitadas — apenas funcionalidades com backend real.
 * Rotas removidas aqui não aparecem na sidebar; URLs antigas redirecionam para /.
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
      { name: 'Equipamento', path: '/estoque/equipamento', icon: 'cog' },
      { name: 'Forn. Chip GSM', path: '/estoque/fornecedor-chip-gsm', icon: 'building' }
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
    submenu: [{ name: 'Integração', path: '/gerencia/integracao', icon: 'refresh-cw' }]
  },
  { name: 'Perfil', path: '/profile', icon: 'user', protected: true }
];

/** Rotas protegidas ativas (para router) */
export const ENABLED_APP_PATHS: string[] = [
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
  '/profile'
];

/** URLs legadas (placeholders) → redirecionar para home */
export const LEGACY_DISABLED_PATHS = [
  '/relatorios/motorista-jornada',
  '/relatorios/evento',
  '/relatorios/abastecimento',
  '/relatorios/multa',
  '/relatorios/custo-viagem',
  '/relatorios/entrega',
  '/relatorios/checklist',
  '/relatorios/vinculo',
  '/relatorios/pontos',
  '/relatorios/cercas',
  '/relatorios/atraso',
  '/relatorios/matriz-cliente',
  '/perimetros/ponto',
  '/perimetros/cerca',
  '/perimetros/rota',
  '/help',
  '/settings'
] as const;

export function isLegacyDisabledPath(path: string): boolean {
  return (LEGACY_DISABLED_PATHS as readonly string[]).includes(path);
}
