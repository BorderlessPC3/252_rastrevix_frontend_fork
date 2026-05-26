import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';

export interface Colaborador {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
    status: 'ativo' | 'inativo' | 'treinamento';
    salario?: number;
    dataContratacao: string;
    dataDemissao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    observacoes?: string;
    supervisorId?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
}

export interface ColaboradorCreateData {
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
    status?: 'ativo' | 'inativo' | 'treinamento';
    salario?: number;
    dataContratacao: string;
    dataDemissao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    observacoes?: string;
    supervisorId?: string;
    clienteId?: string; // Para atribuição automática ao criar
}

export interface ColaboradorUpdateData extends Partial<ColaboradorCreateData> {
    id: string;
}

export interface ColaboradorListResponse {
    message: string;
    data: {
        colaboradores: Colaborador[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface ColaboradorStatsResponse {
    message: string;
    data: {
        total: number;
        ativos: number;
        inativos: number;
        treinamento: number;
        porDepartamento: Array<{
            departamento: string;
            count: string;
        }>;
    };
}

export interface ColaboradorResponse {
    message: string;
    data: {
        colaborador: Colaborador;
    };
}

class ColaboradorService {
    private baseEndpoint = '/colaboradores';

    // Listar colaboradores com filtros e paginação
    async listarColaboradores(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        departamento?: string;
    }): Promise<ColaboradorListResponse> {
        if (useFirebaseDirect()) return fb.listarColaboradores(params);
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.departamento) queryParams.append('departamento', params.departamento);

        const endpoint = queryParams.toString()
            ? `${this.baseEndpoint}?${queryParams.toString()}`
            : this.baseEndpoint;

        return apiService.request<ColaboradorListResponse>(endpoint);
    }

    // Obter estatísticas dos colaboradores
    async obterEstatisticas(): Promise<ColaboradorStatsResponse> {
        if (useFirebaseDirect()) return fb.obterEstatisticasColaboradores();
        return apiService.request<ColaboradorStatsResponse>(`${this.baseEndpoint}/stats`);
    }

    // Obter colaborador por ID
    async obterColaborador(id: string): Promise<ColaboradorResponse> {
        if (useFirebaseDirect()) return fb.obterColaborador(id);
        return apiService.request<ColaboradorResponse>(`${this.baseEndpoint}/${id}`);
    }

    // Criar novo colaborador
    async criarColaborador(dados: ColaboradorCreateData): Promise<ColaboradorResponse> {
        if (useFirebaseDirect()) return fb.criarColaborador(dados);
        return apiService.request<ColaboradorResponse>(this.baseEndpoint, {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    // Atualizar colaborador
    async atualizarColaborador(dados: ColaboradorUpdateData): Promise<ColaboradorResponse> {
        if (useFirebaseDirect()) return fb.atualizarColaborador(dados);
        const { id, ...updateData } = dados;
        return apiService.request<ColaboradorResponse>(`${this.baseEndpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    // Deletar colaborador
    async deletarColaborador(id: string): Promise<{ message: string }> {
        if (useFirebaseDirect()) return fb.deletarColaborador(id);
        return apiService.request<{ message: string }>(`${this.baseEndpoint}/${id}`, {
            method: 'DELETE',
        });
    }

    // Listar colaboradores de um cliente
    async listarColaboradoresDoCliente(clienteId: string): Promise<ColaboradorListResponse> {
        if (useFirebaseDirect()) return fb.listarColaboradoresDoCliente(clienteId);
        return apiService.request<ColaboradorListResponse>(`${this.baseEndpoint}/cliente/${clienteId}`);
    }

    // Listar colaboradores disponíveis (não atribuídos) para um cliente
    async listarColaboradoresDisponiveis(clienteId: string): Promise<ColaboradorListResponse> {
        if (useFirebaseDirect()) return fb.listarColaboradoresDisponiveis(clienteId);
        return apiService.request<ColaboradorListResponse>(`${this.baseEndpoint}/disponiveis/${clienteId}`);
    }

    // Atribuir colaborador a um cliente
    async atribuirColaboradorACliente(clienteId: string, colaboradorId: string): Promise<{ message: string; data: { relacionamento: any } }> {
        if (useFirebaseDirect()) return fb.atribuirColaboradorACliente(clienteId, colaboradorId);
        return apiService.request<{ message: string; data: { relacionamento: any } }>(
            `${this.baseEndpoint}/cliente/${clienteId}/atribuir/${colaboradorId}`,
            {
                method: 'POST',
            }
        );
    }

    // Remover colaborador de um cliente
    async removerColaboradorDoCliente(clienteId: string, colaboradorId: string): Promise<{ message: string }> {
        if (useFirebaseDirect()) return fb.removerColaboradorDoCliente(clienteId, colaboradorId);
        return apiService.request<{ message: string }>(
            `${this.baseEndpoint}/cliente/${clienteId}/remover/${colaboradorId}`,
            {
                method: 'DELETE',
            }
        );
    }
}

export const colaboradorService = new ColaboradorService();
export default colaboradorService;
