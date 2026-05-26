import { COLLECTIONS } from './collections';
import { matchesSearch, paginate, toDate, toIso } from './helpers';
import { FirestoreRepo } from './repository';
import { calcularDistanciaPercorrida, calcularDuracaoMinutos } from '../utils/geo';
import type { Cliente, ClienteCreateData, ClienteListResponse, ClienteResponse, ClienteStatsResponse, ClienteUpdateData } from '../services/clienteService';
import type { Colaborador, ColaboradorCreateData, ColaboradorListResponse, ColaboradorResponse, ColaboradorStatsResponse, ColaboradorUpdateData } from '../services/colaboradorService';
import type { Maquina, MaquinaCreateData, MaquinaListResponse, MaquinaResponse, MaquinaStatsResponse, MaquinaUpdateData } from '../services/maquinaService';
import type { ChipGSM, ChipGSMCreateData, ChipGSMListResponse, ChipGSMResponse, ChipGSMUpdateData } from '../services/chipGsmService';
import type { FornecedorChipGSM, FornecedorChipGSMCreateData, FornecedorChipGSMListResponse, FornecedorChipGSMResponse } from '../services/fornecedorChipGsmService';
import type { TenantBranding } from '../services/tenantService';
import type { VeiculoFrota } from '../services/frotaService';
import type { DadosRastreador, EventoRastreador, Rastreador } from '../types';

const clientesRepo = new FirestoreRepo(COLLECTIONS.clientes);
const colaboradoresRepo = new FirestoreRepo(COLLECTIONS.colaboradores);
const maquinasRepo = new FirestoreRepo(COLLECTIONS.maquinas);
const rastreadoresRepo = new FirestoreRepo(COLLECTIONS.rastreadores);
const dadosRepo = new FirestoreRepo(COLLECTIONS.dadosRastreador);
const eventosRepo = new FirestoreRepo(COLLECTIONS.eventosRastreador);
const relRepo = new FirestoreRepo(COLLECTIONS.clienteColaboradores);
const chipsRepo = new FirestoreRepo(COLLECTIONS.chipsGsm);
const fornecedoresRepo = new FirestoreRepo(COLLECTIONS.fornecedoresChipGsm);
const tenantsRepo = new FirestoreRepo(COLLECTIONS.tenants);
const importLogsRepo = new FirestoreRepo(COLLECTIONS.importLogs);

function asCliente(row: Record<string, unknown>): Cliente {
  return {
    id: String(row.id),
    nome: String(row.nome ?? ''),
    email: String(row.email ?? ''),
    telefone: String(row.telefone ?? ''),
    empresa: String(row.empresa ?? ''),
    status: (row.status as Cliente['status']) || 'ativo',
    endereco: row.endereco as string | undefined,
    cidade: row.cidade as string | undefined,
    estado: row.estado as string | undefined,
    cep: row.cep as string | undefined,
    cnpj: row.cnpj as string | undefined,
    observacoes: row.observacoes as string | undefined,
    contatoResponsavel: row.contatoResponsavel as string | undefined,
    telefoneResponsavel: row.telefoneResponsavel as string | undefined,
    dataCadastro: toIso(row.dataCadastro ?? row.createdAt),
    ultimaAtualizacao: toIso(row.ultimaAtualizacao ?? row.updatedAt)
  };
}

function asColaborador(row: Record<string, unknown>): Colaborador {
  return {
    id: String(row.id),
    nome: String(row.nome ?? ''),
    email: String(row.email ?? ''),
    telefone: String(row.telefone ?? ''),
    cargo: String(row.cargo ?? ''),
    departamento: (row.departamento as Colaborador['departamento']) || 'operacoes',
    status: (row.status as Colaborador['status']) || 'ativo',
    salario: row.salario as number | undefined,
    dataContratacao: toIso(row.dataContratacao),
    dataDemissao: row.dataDemissao ? toIso(row.dataDemissao) : undefined,
    endereco: row.endereco as string | undefined,
    cidade: row.cidade as string | undefined,
    estado: row.estado as string | undefined,
    cep: row.cep as string | undefined,
    cpf: row.cpf as string | undefined,
    rg: row.rg as string | undefined,
    dataNascimento: row.dataNascimento ? toIso(row.dataNascimento) : undefined,
    observacoes: row.observacoes as string | undefined,
    supervisorId: row.supervisorId as string | undefined,
    dataCadastro: toIso(row.dataCadastro ?? row.createdAt),
    ultimaAtualizacao: toIso(row.ultimaAtualizacao ?? row.updatedAt)
  };
}

function asMaquina(row: Record<string, unknown>): Maquina {
  return row as unknown as Maquina;
}

function asRastreador(row: Record<string, unknown>): Rastreador {
  return row as unknown as Rastreador;
}

function asDados(row: Record<string, unknown>): DadosRastreador {
  return row as unknown as DadosRastreador;
}

function asEvento(row: Record<string, unknown>): EventoRastreador {
  return row as unknown as EventoRastreador;
}

// --- Clientes ---

export async function listarClientes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ClienteListResponse> {
  let rows = (await clientesRepo.getAll()).map(asCliente);
  if (params?.status) rows = rows.filter((r) => r.status === params.status);
  if (params?.search) {
    rows = rows.filter((r) =>
      matchesSearch(r as unknown as Record<string, unknown>, params.search!, ['nome', 'email', 'empresa'])
    );
  }
  const paged = paginate(rows, params?.page, params?.limit);
  return {
    message: 'Clientes listados',
    data: { clientes: paged.items, pagination: paged }
  };
}

export async function obterEstatisticasClientes(): Promise<ClienteStatsResponse> {
  const rows = (await clientesRepo.getAll()).map(asCliente);
  return {
    message: 'Estatísticas',
    data: {
      total: rows.length,
      ativos: rows.filter((r) => r.status === 'ativo').length,
      inativos: rows.filter((r) => r.status === 'inativo').length,
      pendentes: rows.filter((r) => r.status === 'pendente').length
    }
  };
}

export async function obterCliente(id: string): Promise<ClienteResponse> {
  const row = await clientesRepo.getById(id);
  if (!row) throw new Error('Cliente não encontrado');
  return { message: 'Cliente encontrado', data: { cliente: asCliente(row) } };
}

export async function criarCliente(dados: ClienteCreateData): Promise<ClienteResponse> {
  const saved = await clientesRepo.save(undefined, { ...dados, status: dados.status || 'ativo' });
  return { message: 'Cliente criado', data: { cliente: asCliente(saved) } };
}

export async function atualizarCliente(dados: ClienteUpdateData): Promise<ClienteResponse> {
  const { id, ...rest } = dados;
  const saved = await clientesRepo.update(id, rest as Record<string, unknown>);
  return { message: 'Cliente atualizado', data: { cliente: asCliente(saved) } };
}

export async function deletarCliente(id: string): Promise<{ message: string }> {
  await clientesRepo.remove(id);
  return { message: 'Cliente removido' };
}

export async function deletarTodosClientes(): Promise<{ message: string; data: { deletedCount: number } }> {
  const rows = await clientesRepo.getAll();
  await Promise.all(rows.map((r) => clientesRepo.remove(String(r.id))));
  return { message: 'Todos removidos', data: { deletedCount: rows.length } };
}

// --- Colaboradores ---

export async function listarColaboradores(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  departamento?: string;
}): Promise<ColaboradorListResponse> {
  let rows = (await colaboradoresRepo.getAll()).map(asColaborador);
  if (params?.status) rows = rows.filter((r) => r.status === params.status);
  if (params?.departamento) rows = rows.filter((r) => r.departamento === params.departamento);
  if (params?.search) {
    rows = rows.filter((r) =>
      matchesSearch(r as unknown as Record<string, unknown>, params.search!, ['nome', 'email', 'cargo'])
    );
  }
  const paged = paginate(rows, params?.page, params?.limit);
  return {
    message: 'Colaboradores listados',
    data: { colaboradores: paged.items, pagination: paged }
  };
}

export async function obterEstatisticasColaboradores(): Promise<ColaboradorStatsResponse> {
  const rows = (await colaboradoresRepo.getAll()).map(asColaborador);
  const porDepartamento = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.departamento] = (acc[r.departamento] || 0) + 1;
      return acc;
    }, {})
  ).map(([departamento, count]) => ({ departamento, count: String(count) }));

  return {
    message: 'Estatísticas',
    data: {
      total: rows.length,
      ativos: rows.filter((r) => r.status === 'ativo').length,
      inativos: rows.filter((r) => r.status === 'inativo').length,
      treinamento: rows.filter((r) => r.status === 'treinamento').length,
      porDepartamento
    }
  };
}

export async function obterColaborador(id: string): Promise<ColaboradorResponse> {
  const row = await colaboradoresRepo.getById(id);
  if (!row) throw new Error('Colaborador não encontrado');
  return { message: 'OK', data: { colaborador: asColaborador(row) } };
}

export async function criarColaborador(dados: ColaboradorCreateData): Promise<ColaboradorResponse> {
  const saved = await colaboradoresRepo.save(undefined, { ...dados, status: dados.status || 'ativo' });
  if (dados.clienteId) {
    await relRepo.save(undefined, { clienteId: dados.clienteId, colaboradorId: saved.id });
  }
  return { message: 'Criado', data: { colaborador: asColaborador(saved) } };
}

export async function atualizarColaborador(dados: ColaboradorUpdateData): Promise<ColaboradorResponse> {
  const { id, ...rest } = dados;
  const saved = await colaboradoresRepo.update(id, rest as Record<string, unknown>);
  return { message: 'Atualizado', data: { colaborador: asColaborador(saved) } };
}

export async function deletarColaborador(id: string): Promise<{ message: string }> {
  await colaboradoresRepo.remove(id);
  return { message: 'Removido' };
}

export async function listarColaboradoresDoCliente(clienteId: string): Promise<ColaboradorListResponse> {
  const rels = (await relRepo.getAll()).filter((r) => r.clienteId === clienteId);
  const ids = new Set(rels.map((r) => String(r.colaboradorId)));
  const rows = (await colaboradoresRepo.getAll()).filter((r) => ids.has(String(r.id))).map(asColaborador);
  const paged = paginate(rows, 1, 100);
  return { message: 'OK', data: { colaboradores: paged.items, pagination: paged } };
}

export async function listarColaboradoresDisponiveis(clienteId: string): Promise<ColaboradorListResponse> {
  const rels = (await relRepo.getAll()).filter((r) => r.clienteId === clienteId);
  const assigned = new Set(rels.map((r) => String(r.colaboradorId)));
  const rows = (await colaboradoresRepo.getAll())
    .filter((r) => !assigned.has(String(r.id)))
    .map(asColaborador);
  const paged = paginate(rows, 1, 100);
  return { message: 'OK', data: { colaboradores: paged.items, pagination: paged } };
}

export async function atribuirColaboradorACliente(clienteId: string, colaboradorId: string) {
  const saved = await relRepo.save(undefined, { clienteId, colaboradorId, dataAtribuicao: new Date() });
  return { message: 'Atribuído', data: { relacionamento: saved } };
}

export async function removerColaboradorDoCliente(clienteId: string, colaboradorId: string) {
  const rels = (await relRepo.getAll()).filter(
    (r) => r.clienteId === clienteId && r.colaboradorId === colaboradorId
  );
  await Promise.all(rels.map((r) => relRepo.remove(String(r.id))));
  return { message: 'Removido' };
}

// --- Máquinas ---

export async function listarMaquinas(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tipo?: string;
  clienteId?: string;
}): Promise<MaquinaListResponse> {
  let rows = (await maquinasRepo.getAll()).map(asMaquina);
  if (params?.status) rows = rows.filter((r) => r.status === params.status);
  if (params?.tipo) rows = rows.filter((r) => r.tipo === params.tipo);
  if (params?.clienteId) rows = rows.filter((r) => r.clienteId === params.clienteId);
  if (params?.search) {
    rows = rows.filter((r) =>
      matchesSearch(r as unknown as Record<string, unknown>, params.search!, ['nome', 'codigo', 'placa'])
    );
  }
  const paged = paginate(rows, params?.page, params?.limit);
  return { message: 'OK', data: { maquinas: paged.items, pagination: paged } };
}

export async function obterEstatisticasMaquinas(): Promise<MaquinaStatsResponse> {
  const rows = (await maquinasRepo.getAll()).map(asMaquina);
  const porTipo = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {})
  ).map(([tipo, count]) => ({ tipo, count: String(count) }));
  const ef = rows.filter((r) => r.eficiencia != null).map((r) => r.eficiencia!);
  const eficienciaMedia = ef.length ? ef.reduce((a, b) => a + b, 0) / ef.length : 0;

  return {
    message: 'OK',
    data: {
      total: rows.length,
      ativas: rows.filter((r) => r.status === 'ativa').length,
      inativas: rows.filter((r) => r.status === 'inativa').length,
      manutencao: rows.filter((r) => r.status === 'manutencao').length,
      calibracao: rows.filter((r) => r.status === 'calibracao').length,
      eficienciaMedia,
      porTipo
    }
  };
}

export async function obterMaquina(id: string): Promise<MaquinaResponse> {
  const row = await maquinasRepo.getById(id);
  if (!row) throw new Error('Máquina não encontrada');
  return { message: 'OK', data: { maquina: asMaquina(row) } };
}

export async function criarMaquina(dados: MaquinaCreateData): Promise<MaquinaResponse> {
  const saved = await maquinasRepo.save(undefined, { ...dados, status: dados.status || 'ativa' });
  return { message: 'Criada', data: { maquina: asMaquina(saved) } };
}

export async function atualizarMaquina(dados: MaquinaUpdateData): Promise<MaquinaResponse> {
  const { id, ...rest } = dados;
  const saved = await maquinasRepo.update(id, rest as Record<string, unknown>);
  return { message: 'Atualizada', data: { maquina: asMaquina(saved) } };
}

export async function deletarMaquina(id: string): Promise<{ message: string }> {
  await maquinasRepo.remove(id);
  return { message: 'Removida' };
}

// --- Rastreadores ---

export async function listarRastreadores(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  let rows = (await rastreadoresRepo.getAll()).map(asRastreador);
  if (params?.status) rows = rows.filter((r) => r.status === params.status);
  if (params?.search) {
    rows = rows.filter((r) =>
      matchesSearch(r as unknown as Record<string, unknown>, params.search!, [
        'numeroSerial',
        'imei',
        'nome',
        'placa'
      ])
    );
  }
  const paged = paginate(rows, params?.page, params?.limit);
  return { message: 'OK', data: { rastreadores: paged.items, pagination: paged } };
}

export async function obterRastreador(id: string) {
  const row = await rastreadoresRepo.getById(id);
  if (!row) throw new Error('Rastreador não encontrado');
  return { message: 'OK', data: { rastreador: asRastreador(row) } };
}

export async function obterPosicaoAtual(id: string) {
  const rows = (await dadosRepo.getAll())
    .filter((d) => d.rastreadorId === id && d.latitude != null && d.longitude != null)
    .sort((a, b) => (toDate(b.timestamp)?.getTime() || 0) - (toDate(a.timestamp)?.getTime() || 0));
  const posicao = rows[0] ? asDados(rows[0]) : null;
  return { message: 'OK', data: { posicao } };
}

export async function obterDadosRastreador(
  id: string,
  params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string }
) {
  let rows = (await dadosRepo.getAll()).filter((d) => d.rastreadorId === id);
  if (params?.dataInicio) {
    const start = new Date(params.dataInicio).getTime();
    rows = rows.filter((d) => (toDate(d.timestamp)?.getTime() || 0) >= start);
  }
  if (params?.dataFim) {
    const end = new Date(params.dataFim).getTime();
    rows = rows.filter((d) => (toDate(d.timestamp)?.getTime() || 0) <= end);
  }
  rows.sort((a, b) => (toDate(a.timestamp)?.getTime() || 0) - (toDate(b.timestamp)?.getTime() || 0));
  const paged = paginate(rows.map(asDados), params?.page, params?.limit);
  const rastreadorRow = await rastreadoresRepo.getById(id);
  const rastreador = rastreadorRow
    ? asRastreador(rastreadorRow)
    : ({ id, numeroSerial: '', imei: '', status: 'ativo' } as Rastreador);
  return {
    message: 'OK',
    data: {
      rastreador,
      dados: paged.items,
      pagination: { page: paged.page, limit: paged.limit, total: paged.total, pages: paged.pages }
    }
  };
}

export async function obterEventosRastreador(
  id: string,
  params?: { page?: number; limit?: number; dataInicio?: string; dataFim?: string; eventoId?: number }
) {
  let rows = (await eventosRepo.getAll()).filter((d) => d.rastreadorId === id);
  if (params?.eventoId != null) rows = rows.filter((d) => d.eventoId === params.eventoId);
  if (params?.dataInicio) {
    const start = new Date(params.dataInicio).getTime();
    rows = rows.filter((d) => (toDate(d.timestamp)?.getTime() || 0) >= start);
  }
  if (params?.dataFim) {
    const end = new Date(params.dataFim).getTime();
    rows = rows.filter((d) => (toDate(d.timestamp)?.getTime() || 0) <= end);
  }
  rows.sort((a, b) => (toDate(b.timestamp)?.getTime() || 0) - (toDate(a.timestamp)?.getTime() || 0));
  const paged = paginate(rows.map(asEvento), params?.page, params?.limit);
  const rastreadorRow = await rastreadoresRepo.getById(id);
  const rastreador = rastreadorRow
    ? asRastreador(rastreadorRow)
    : ({ id, numeroSerial: '', imei: '', status: 'ativo' } as Rastreador);
  return {
    message: 'OK',
    data: {
      rastreador,
      eventos: paged.items,
      pagination: { page: paged.page, limit: paged.limit, total: paged.total, pages: paged.pages }
    }
  };
}

export async function criarRastreador(dados: Partial<Rastreador>) {
  const saved = await rastreadoresRepo.save(undefined, dados as Record<string, unknown>);
  return { message: 'Criado', data: { rastreador: asRastreador(saved) } };
}

export async function atualizarRastreador(id: string, dados: Partial<Rastreador>) {
  const saved = await rastreadoresRepo.update(id, dados as Record<string, unknown>);
  return { message: 'Atualizado', data: { rastreador: asRastreador(saved) } };
}

export async function deletarRastreador(id: string) {
  await rastreadoresRepo.remove(id);
  return { message: 'Removido' };
}

// --- Chips GSM ---

export async function listarChipsGsm(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  operadora?: string;
}): Promise<ChipGSMListResponse> {
  let rows = (await chipsRepo.getAll()) as unknown as ChipGSM[];
  if (params?.status) rows = rows.filter((r) => r.status === params.status);
  if (params?.operadora) rows = rows.filter((r) => r.operadora === params.operadora);
  if (params?.search) {
    rows = rows.filter((r) =>
      matchesSearch(r as unknown as Record<string, unknown>, params.search!, ['numero', 'iccid', 'telefone'])
    );
  }
  const paged = paginate(rows, params?.page, params?.limit);
  return { message: 'OK', data: { chips: paged.items, pagination: paged } };
}

export async function obterChipGsm(id: string): Promise<ChipGSMResponse> {
  const row = await chipsRepo.getById(id);
  if (!row) throw new Error('Chip não encontrado');
  return { message: 'OK', data: { chip: row as unknown as ChipGSM } };
}

export async function criarChipGsm(dados: ChipGSMCreateData): Promise<ChipGSMResponse> {
  const saved = await chipsRepo.save(undefined, { ...dados, status: dados.status || 'ativo' });
  return { message: 'Criado', data: { chip: saved as unknown as ChipGSM } };
}

export async function atualizarChipGsm(dados: ChipGSMUpdateData): Promise<ChipGSMResponse> {
  const { id, ...rest } = dados;
  const saved = await chipsRepo.update(id, rest as Record<string, unknown>);
  return { message: 'Atualizado', data: { chip: saved as unknown as ChipGSM } };
}

export async function deletarChipGsm(id: string) {
  await chipsRepo.remove(id);
  return { message: 'Removido' };
}

// --- Fornecedores ---

export async function listarFornecedoresChipGsm(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<FornecedorChipGSMListResponse> {
  let rows = (await fornecedoresRepo.getAll()) as unknown as FornecedorChipGSM[];
  if (params?.search) {
    rows = rows.filter((r) =>
      matchesSearch(r as unknown as Record<string, unknown>, params.search!, ['nome', 'email', 'remetente'])
    );
  }
  const paged = paginate(rows, params?.page, params?.limit);
  return { message: 'OK', data: { fornecedores: paged.items, pagination: paged } };
}

export async function obterFornecedorChipGsm(id: string): Promise<FornecedorChipGSMResponse> {
  const row = await fornecedoresRepo.getById(id);
  if (!row) throw new Error('Fornecedor não encontrado');
  return { message: 'OK', data: { fornecedor: row as unknown as FornecedorChipGSM } };
}

export async function criarFornecedorChipGsm(data: FornecedorChipGSMCreateData): Promise<FornecedorChipGSMResponse> {
  const saved = await fornecedoresRepo.save(undefined, data as unknown as Record<string, unknown>);
  return { message: 'Criado', data: { fornecedor: saved as unknown as FornecedorChipGSM } };
}

export async function atualizarFornecedorChipGsm(
  id: string,
  data: Partial<FornecedorChipGSMCreateData>
): Promise<FornecedorChipGSMResponse> {
  const saved = await fornecedoresRepo.update(id, data as unknown as Record<string, unknown>);
  return { message: 'Atualizado', data: { fornecedor: saved as unknown as FornecedorChipGSM } };
}

export async function excluirFornecedorChipGsm(id: string) {
  await fornecedoresRepo.remove(id);
  return { message: 'Removido' };
}

// --- Tenant branding ---

export async function getTenantBranding(tenantId?: string): Promise<TenantBranding | null> {
  const rows = await tenantsRepo.getAll();
  let tenant = tenantId ? rows.find((r) => r.id === tenantId && r.active !== false) : null;
  if (!tenant) tenant = rows.find((r) => r.slug === 'default' && r.active !== false) ?? null;
  if (!tenant) return null;
  return {
    id: String(tenant.id),
    slug: String(tenant.slug ?? 'default'),
    name: String(tenant.name ?? 'Rastrevix'),
    logoUrl: tenant.logoUrl as string | undefined,
    primaryColor: String(tenant.primaryColor ?? '#00d9ff'),
    secondaryColor: String(tenant.secondaryColor ?? '#0f172a'),
    faviconUrl: tenant.faviconUrl as string | undefined
  };
}

// --- Frota ---

async function latestPosicao(rastreadorId: string): Promise<DadosRastreador | undefined> {
  const rows = (await dadosRepo.getAll())
    .filter((d) => d.rastreadorId === rastreadorId && d.latitude != null && d.longitude != null)
    .sort((a, b) => (toDate(b.timestamp)?.getTime() || 0) - (toDate(a.timestamp)?.getTime() || 0));
  return rows[0] ? asDados(rows[0]) : undefined;
}

export async function listarVeiculosFrota(params?: {
  clienteId?: string;
  status?: string;
  search?: string;
}): Promise<{ veiculos: VeiculoFrota[]; total: number }> {
  let maquinas = (await maquinasRepo.getAll()).map(asMaquina);
  if (params?.clienteId) maquinas = maquinas.filter((m) => m.clienteId === params.clienteId);
  if (params?.status) maquinas = maquinas.filter((m) => m.status === params.status);
  if (params?.search) {
    maquinas = maquinas.filter((m) =>
      matchesSearch(m as unknown as Record<string, unknown>, params.search!, ['nome', 'codigo', 'placa'])
    );
  }

  const rastreadores = (await rastreadoresRepo.getAll()).map(asRastreador);
  const rastMap = new Map(rastreadores.map((r) => [r.id, r]));
  const veiculos: VeiculoFrota[] = [];

  for (const maquina of maquinas) {
    const rastreador = maquina.rastreadorId ? rastMap.get(maquina.rastreadorId) : undefined;
    const posicaoAtual = maquina.rastreadorId ? await latestPosicao(maquina.rastreadorId) : undefined;
    veiculos.push({
      id: maquina.id,
      maquinaId: maquina.id,
      rastreadorId: maquina.rastreadorId,
      codigo: maquina.codigo,
      nome: maquina.nome || rastreador?.nome || maquina.codigo,
      placa: maquina.placa || rastreador?.placa,
      status: maquina.status,
      clienteId: maquina.clienteId,
      tipo: maquina.tipo,
      tipoVeiculo: rastreador?.tipoVeiculo,
      condutor: rastreador?.condutor,
      rastreador,
      posicaoAtual
    });
  }

  const vinculados = new Set(maquinas.map((m) => m.rastreadorId).filter(Boolean));
  const orphans = rastreadores.filter((r) => r.status === 'ativo' && !vinculados.has(r.id));
  for (const r of orphans) {
    veiculos.push({
      id: r.id,
      maquinaId: r.id,
      rastreadorId: r.id,
      codigo: r.numeroSerial,
      nome: r.nome || r.numeroSerial,
      placa: r.placa,
      status: r.status,
      tipoVeiculo: r.tipoVeiculo,
      condutor: r.condutor,
      rastreador: r,
      posicaoAtual: await latestPosicao(r.id)
    });
  }

  return { veiculos, total: veiculos.length };
}

export async function obterRotaVeiculo(
  veiculoId: string,
  dataInicio: string,
  dataFim: string,
  limit = 5000
) {
  const maquina = await maquinasRepo.getById(veiculoId);
  const rastreadorId = (maquina?.rastreadorId as string) || veiculoId;
  let rows = (await dadosRepo.getAll()).filter(
    (d) =>
      d.rastreadorId === rastreadorId &&
      d.latitude != null &&
      d.longitude != null
  );
  const start = new Date(dataInicio).getTime();
  const end = new Date(dataFim).getTime();
  rows = rows.filter((d) => {
    const t = toDate(d.timestamp)?.getTime() || 0;
    return t >= start && t <= end;
  });
  rows.sort((a, b) => (toDate(a.timestamp)?.getTime() || 0) - (toDate(b.timestamp)?.getTime() || 0));
  rows = rows.slice(0, Math.min(limit, 10000));
  const pontos = rows.map(asDados);
  const geo = pontos
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ latitude: p.latitude!, longitude: p.longitude!, timestamp: p.timestamp }));
  return {
    veiculoId,
    rastreadorId,
    pontos,
    distanciaKm: calcularDistanciaPercorrida(geo),
    duracaoMinutos: calcularDuracaoMinutos(geo[0]?.timestamp, geo[geo.length - 1]?.timestamp),
    dataInicio: geo[0]?.timestamp as string | undefined,
    dataFim: geo[geo.length - 1]?.timestamp as string | undefined
  };
}

// --- Import ---

export async function batchImport(params: {
  entityType: string;
  rows: Record<string, unknown>[];
}) {
  const repoMap: Record<string, FirestoreRepo> = {
    clientes: clientesRepo,
    motoristas: colaboradoresRepo,
    veiculos: maquinasRepo,
    pontos: rastreadoresRepo
  };
  const repo = repoMap[params.entityType];
  if (!repo) throw new Error('Tipo de importação inválido');

  let successCount = 0;
  const errors: Array<{ row: number; message: string }> = [];
  for (let i = 0; i < params.rows.length; i++) {
    try {
      await repo.save(undefined, params.rows[i]!);
      successCount++;
    } catch (e) {
      errors.push({ row: i + 1, message: e instanceof Error ? e.message : 'Erro' });
    }
  }

  const log = await importLogsRepo.save(undefined, {
    entityType: params.entityType,
    status: errors.length ? 'partial' : 'success',
    totalRows: params.rows.length,
    successCount,
    errorCount: errors.length,
    skippedCount: 0,
    errors,
    startedAt: new Date(),
    finishedAt: new Date()
  });

  return {
    message: 'Importação concluída',
    data: {
      log: {
        id: String(log.id),
        entityType: params.entityType,
        status: String(log.status),
        totalRows: params.rows.length,
        successCount,
        errorCount: errors.length,
        skippedCount: 0,
        errors,
        startedAt: toIso(log.startedAt),
        finishedAt: toIso(log.finishedAt)
      }
    }
  };
}

export async function listImportLogs() {
  const logs = await importLogsRepo.getAll();
  return {
    message: 'OK',
    data: {
      logs: logs.map((l) => ({
        id: String(l.id),
        entityType: String(l.entityType),
        status: String(l.status),
        totalRows: Number(l.totalRows ?? 0),
        successCount: Number(l.successCount ?? 0),
        errorCount: Number(l.errorCount ?? 0),
        skippedCount: Number(l.skippedCount ?? 0),
        startedAt: toIso(l.startedAt),
        finishedAt: l.finishedAt ? toIso(l.finishedAt) : undefined
      }))
    }
  };
}

export async function getImportLog(id: string) {
  const log = await importLogsRepo.getById(id);
  if (!log) throw new Error('Log não encontrado');
  return { message: 'OK', data: { log } };
}

// --- Reports (client-side) ---

export async function relatorioHistorico(payload: {
  dataInicio: string;
  dataFim: string;
  rastreadorId?: string;
}) {
  const rastreadores = payload.rastreadorId
    ? [(await rastreadoresRepo.getById(payload.rastreadorId))].filter(Boolean)
    : await rastreadoresRepo.getAll();
  const resultados = [];
  for (const r of rastreadores) {
    const data = await obterDadosRastreador(String(r!.id), {
      dataInicio: payload.dataInicio,
      dataFim: payload.dataFim,
      limit: 10000
    });
    const pontos = data.data.dados;
    const geo = pontos
      .filter((p) => p.latitude != null && p.longitude != null)
      .map((p) => ({ latitude: p.latitude!, longitude: p.longitude!, timestamp: p.timestamp }));
    resultados.push({
      rastreadorId: String(r!.id),
      pontos,
      distanciaKm: calcularDistanciaPercorrida(geo),
      duracaoMinutos: calcularDuracaoMinutos(geo[0]?.timestamp, geo[geo.length - 1]?.timestamp)
    });
  }
  return {
    message: 'OK',
    data: {
      periodo: { dataInicio: payload.dataInicio, dataFim: payload.dataFim },
      veiculos: resultados.length,
      distanciaTotalKm: resultados.reduce((s, r) => s + r.distanciaKm, 0),
      resultados
    }
  };
}

export async function relatorioTelemetria(payload: {
  dataInicio: string;
  dataFim: string;
  eventoId?: number;
}) {
  let eventos = (await eventosRepo.getAll()).map(asEvento);
  const start = new Date(payload.dataInicio).getTime();
  const end = new Date(payload.dataFim).getTime();
  eventos = eventos.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    return t >= start && t <= end && (payload.eventoId == null || e.eventoId === payload.eventoId);
  });
  return {
    message: 'OK',
    data: {
      periodo: { dataInicio: payload.dataInicio, dataFim: payload.dataFim },
      total: eventos.length,
      eventos
    }
  };
}

export async function relatorioManutencao() {
  const maquinas = (await maquinasRepo.getAll()).map(asMaquina);
  return {
    message: 'OK',
    data: {
      itens: maquinas.map((m) => ({
        id: m.id,
        codigo: m.codigo,
        nome: m.nome,
        status: m.status,
        proximaManutencao: m.proximaManutencao,
        ultimaManutencao: m.ultimaManutencao
      }))
    }
  };
}

export async function relatorioMovimentacao(payload: {
  dataInicio: string;
  dataFim: string;
  velocidadeMinima?: number;
}) {
  const min = payload.velocidadeMinima ?? 5;
  const rastreadores = await rastreadoresRepo.getAll();
  const relatorios = [];
  for (const r of rastreadores) {
    const data = await obterDadosRastreador(String(r.id), {
      dataInicio: payload.dataInicio,
      dataFim: payload.dataFim,
      limit: 10000
    });
    const pontos = data.data.dados;
    let distanciaKm = 0;
    let tempoMovimento = 0;
    let tempoParado = 0;
    let velMax = 0;
    for (let i = 1; i < pontos.length; i++) {
      const prev = pontos[i - 1]!;
      const curr = pontos[i]!;
      if (prev.latitude == null || curr.latitude == null) continue;
      const seg = calcularDistanciaPercorrida([
        { latitude: prev.latitude, longitude: prev.longitude! },
        { latitude: curr.latitude, longitude: curr.longitude! }
      ]);
      distanciaKm += seg;
      const dt =
        (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 60000;
      const moving = (curr.velocidade ?? 0) >= min;
      if (moving) tempoMovimento += dt;
      else tempoParado += dt;
      velMax = Math.max(velMax, curr.velocidade ?? 0);
    }
    relatorios.push({
      rastreadorId: String(r.id),
      distanciaKm: Math.round(distanciaKm * 100) / 100,
      tempoMovimentoMinutos: Math.round(tempoMovimento),
      tempoParadoMinutos: Math.round(tempoParado),
      pontosAnalisados: pontos.length,
      velocidadeMaxima: velMax
    });
  }
  return {
    message: 'OK',
    data: {
      periodo: { dataInicio: payload.dataInicio, dataFim: payload.dataFim },
      velocidadeMinima: min,
      relatorios
    }
  };
}

export async function relatorioFrota(payload: { dataInicio: string; dataFim: string }) {
  const { veiculos } = await listarVeiculosFrota();
  let distanciaTotalKm = 0;
  const mapped = [];
  for (const v of veiculos) {
    if (!v.rastreadorId) {
      mapped.push({ id: v.id, codigo: v.codigo, nome: v.nome, status: v.status, distanciaKm: 0, duracaoMinutos: 0 });
      continue;
    }
    const data = await obterDadosRastreador(v.rastreadorId, {
      dataInicio: payload.dataInicio,
      dataFim: payload.dataFim,
      limit: 5000
    });
    const geo = data.data.dados
      .filter((p) => p.latitude != null)
      .map((p) => ({ latitude: p.latitude!, longitude: p.longitude!, timestamp: p.timestamp }));
    const distanciaKm = calcularDistanciaPercorrida(geo);
    distanciaTotalKm += distanciaKm;
    mapped.push({
      id: v.id,
      codigo: v.codigo,
      nome: v.nome,
      status: v.status,
      distanciaKm,
      duracaoMinutos: calcularDuracaoMinutos(geo[0]?.timestamp, geo[geo.length - 1]?.timestamp)
    });
  }
  return {
    message: 'OK',
    data: {
      periodo: { dataInicio: payload.dataInicio, dataFim: payload.dataFim },
      resumo: {
        total: veiculos.length,
        ativas: veiculos.filter((v) => v.status === 'ativa').length,
        comRastreador: veiculos.filter((v) => v.rastreadorId).length,
        distanciaTotalKm
      },
      veiculos: mapped
    }
  };
}

export async function relatorioDesempenho(payload: { dataInicio: string; dataFim: string }) {
  const frota = await relatorioFrota(payload);
  const ranking = [...frota.data.veiculos]
    .sort((a, b) => b.distanciaKm - a.distanciaKm)
    .map((v) => ({ id: v.id, codigo: v.codigo, nome: v.nome, distanciaKm: v.distanciaKm }));
  const maquinas = (await maquinasRepo.getAll()).map(asMaquina);
  const ef = maquinas.filter((m) => m.eficiencia != null).map((m) => m.eficiencia!);
  return {
    message: 'OK',
    data: {
      mediaEficiencia: ef.length ? ef.reduce((a, b) => a + b, 0) / ef.length : 0,
      distanciaTotalKm: frota.data.resumo.distanciaTotalKm,
      ranking
    }
  };
}

export async function relatorioFinanceiro(payload: {
  dataInicio: string;
  dataFim: string;
  custoPorKm?: number;
}) {
  const { veiculos } = await listarVeiculosFrota();
  const custo = payload.custoPorKm ?? 1.5;
  const linhas = [];
  for (const v of veiculos) {
    if (!v.rastreadorId) continue;
    const data = await obterDadosRastreador(v.rastreadorId, {
      dataInicio: payload.dataInicio,
      dataFim: payload.dataFim,
      limit: 5000
    });
    const geo = data.data.dados
      .filter((p) => p.latitude != null)
      .map((p) => ({ latitude: p.latitude!, longitude: p.longitude!, timestamp: p.timestamp }));
    const distanciaKm = calcularDistanciaPercorrida(geo);
    linhas.push({
      rastreadorId: v.rastreadorId,
      distanciaKm,
      custoTotal: Math.round(distanciaKm * custo * 100) / 100
    });
  }
  return {
    message: 'OK',
    data: {
      custoTotal: linhas.reduce((s, l) => s + l.custoTotal, 0),
      linhas
    }
  };
}

export async function relatorioLogistica(payload: {
  dataInicio: string;
  dataFim: string;
  velocidadeMinima?: number;
}) {
  const mov = await relatorioMovimentacao(payload);
  return {
    message: 'OK',
    data: {
      viagens: mov.data.relatorios.map((r) => ({
        rastreadorId: r.rastreadorId,
        distanciaKm: r.distanciaKm,
        paradasDetectadas: Math.ceil(r.tempoParadoMinutos / 15),
        pontos: r.pontosAnalisados
      }))
    }
  };
}

export async function relatorioViagem(payload: { dataInicio: string; dataFim: string }) {
  const mov = await relatorioMovimentacao({ ...payload, velocidadeMinima: 5 });
  return {
    message: 'OK',
    data: {
      viagens: mov.data.relatorios.map((r, i) => ({
        rastreadorId: r.rastreadorId,
        viagemIndex: i + 1,
        distanciaKm: r.distanciaKm,
        pontos: r.pontosAnalisados
      }))
    }
  };
}
