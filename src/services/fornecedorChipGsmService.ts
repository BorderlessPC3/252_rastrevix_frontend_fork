import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';

export interface FornecedorChipGSM {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  remetente: string;
  observacoes?: string;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

export interface FornecedorChipGSMCreateData {
  nome: string;
  email: string;
  telefone?: string;
  remetente: string;
  observacoes?: string;
}

export interface FornecedorChipGSMUpdateData extends Partial<FornecedorChipGSMCreateData> {
  id: string;
}

export interface FornecedorChipGSMListResponse {
  message: string;
  data: {
    fornecedores: FornecedorChipGSM[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface FornecedorChipGSMResponse {
  message: string;
  data: {
    fornecedor: FornecedorChipGSM;
  };
}

class FornecedorChipGsmService {
  private baseEndpoint = '/fornecedores-chip-gsm';

  async listarFornecedores(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<FornecedorChipGSMListResponse> {
    if (useFirebaseDirect()) return fb.listarFornecedoresChipGsm(params);

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const endpoint = queryParams.toString()
      ? `${this.baseEndpoint}?${queryParams.toString()}`
      : this.baseEndpoint;

    return apiService.request<FornecedorChipGSMListResponse>(endpoint);
  }

  async obterFornecedor(id: string): Promise<FornecedorChipGSMResponse> {
    if (useFirebaseDirect()) return fb.obterFornecedorChipGsm(id);
    return apiService.request<FornecedorChipGSMResponse>(`${this.baseEndpoint}/${id}`);
  }

  async criarFornecedor(data: FornecedorChipGSMCreateData): Promise<FornecedorChipGSMResponse> {
    if (useFirebaseDirect()) return fb.criarFornecedorChipGsm(data);
    return apiService.request<FornecedorChipGSMResponse>(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async atualizarFornecedor(id: string, data: Partial<FornecedorChipGSMCreateData>): Promise<FornecedorChipGSMResponse> {
    if (useFirebaseDirect()) return fb.atualizarFornecedorChipGsm(id, data);
    return apiService.request<FornecedorChipGSMResponse>(`${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async excluirFornecedor(id: string): Promise<{ message: string }> {
    if (useFirebaseDirect()) return fb.excluirFornecedorChipGsm(id);
    return apiService.request<{ message: string }>(`${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const fornecedorChipGsmService = new FornecedorChipGsmService();
export default fornecedorChipGsmService;
