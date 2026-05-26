import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';

export interface ChipGSM {
  id: string;
  numero: string;
  status: 'ativo' | 'inativo' | 'bloqueado';
  cliente?: string;
  clienteId?: string;
  telefone?: string;
  operadora?: string;
  veiculoInstalado?: string;
  equipamento?: string;
  equipamentoId?: string;
  fornecedor?: string;
  fornecedorId?: string;
  matrizFranquia?: string;
  iccid?: string;
  planoGsm?: string;
  quantidadeMB?: number;
  valorMensal?: number;
  dataAtivacao?: string;
  observacoes?: string;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

export interface ChipGSMCreateData {
  numero: string;
  status?: 'ativo' | 'inativo' | 'bloqueado';
  clienteId?: string;
  telefone?: string;
  operadora?: string;
  veiculoInstalado?: string;
  equipamentoId?: string;
  fornecedorId?: string;
  matrizFranquia?: string;
  iccid?: string;
  planoGsm?: string;
  quantidadeMB?: number;
  valorMensal?: number;
  dataAtivacao?: string;
  observacoes?: string;
}

export interface ChipGSMUpdateData extends Partial<ChipGSMCreateData> {
  id: string;
}

export interface ChipGSMListResponse {
  message: string;
  data: {
    chips: ChipGSM[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ChipGSMResponse {
  message: string;
  data: {
    chip: ChipGSM;
  };
}

class ChipGsmService {
  private baseEndpoint = '/chips-gsm';

  async listarChipsGsm(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    operadora?: string;
  }): Promise<ChipGSMListResponse> {
    if (useFirebaseDirect()) return fb.listarChipsGsm(params);

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.operadora) queryParams.append('operadora', params.operadora);

    const endpoint = queryParams.toString()
      ? `${this.baseEndpoint}?${queryParams.toString()}`
      : this.baseEndpoint;

    return apiService.request<ChipGSMListResponse>(endpoint);
  }

  async obterChipGsm(id: string): Promise<ChipGSMResponse> {
    if (useFirebaseDirect()) return fb.obterChipGsm(id);
    return apiService.request<ChipGSMResponse>(`${this.baseEndpoint}/${id}`);
  }

  async criarChipGsm(dados: ChipGSMCreateData): Promise<ChipGSMResponse> {
    if (useFirebaseDirect()) return fb.criarChipGsm(dados);
    return apiService.request<ChipGSMResponse>(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  async atualizarChipGsm(dados: ChipGSMUpdateData): Promise<ChipGSMResponse> {
    if (useFirebaseDirect()) return fb.atualizarChipGsm(dados);
    const { id, ...updateData } = dados;
    return apiService.request<ChipGSMResponse>(`${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deletarChipGsm(id: string): Promise<{ message: string }> {
    if (useFirebaseDirect()) return fb.deletarChipGsm(id);
    return apiService.request<{ message: string }>(`${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const chipGsmService = new ChipGsmService();
export default chipGsmService;
