export const COLLECTIONS = {
  users: 'users',
  clientes: 'clientes',
  colaboradores: 'colaboradores',
  maquinas: 'maquinas',
  rastreadores: 'rastreadores',
  dadosRastreador: 'dados_rastreador',
  eventosRastreador: 'eventos_rastreador',
  clienteColaboradores: 'cliente_colaboradores',
  chipsGsm: 'chips_gsm',
  fornecedoresChipGsm: 'fornecedores_chip_gsm',
  tenants: 'tenants',
  importLogs: 'import_logs'
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
