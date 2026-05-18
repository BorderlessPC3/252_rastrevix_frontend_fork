import { apiService } from './api';

export interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
    status: 'ativo' | 'inativo' | 'pendente';
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cnpj?: string;
    observacoes?: string;
    contatoResponsavel?: string;
    telefoneResponsavel?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
}

export interface ClienteCreateData {
    nome: string;
    email: string;
    telefone?: string;
    empresa: string;
    status?: 'ativo' | 'inativo' | 'pendente';
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cnpj?: string;
    observacoes?: string;
    contatoResponsavel?: string;
    telefoneResponsavel?: string;
}

export interface ClienteUpdateData extends Partial<ClienteCreateData> {
    id: string;
}

export interface ClienteListResponse {
    message: string;
    data: {
        clientes: Cliente[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface ClienteStatsResponse {
    message: string;
    data: {
        total: number;
        ativos: number;
        inativos: number;
        pendentes: number;
    };
}

export interface ClienteResponse {
    message: string;
    data: {
        cliente: Cliente;
    };
}

class ClienteService {
    private baseEndpoint = '/clientes';

    // Listar clientes com filtros e paginação
    async listarClientes(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<ClienteListResponse> {
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);

        const endpoint = queryParams.toString()
            ? `${this.baseEndpoint}?${queryParams.toString()}`
            : this.baseEndpoint;

        return apiService.request<ClienteListResponse>(endpoint);
    }

    // Obter estatísticas dos clientes
    async obterEstatisticas(): Promise<ClienteStatsResponse> {
        return apiService.request<ClienteStatsResponse>(`${this.baseEndpoint}/stats`);
    }

    // Obter cliente por ID
    async obterCliente(id: string): Promise<ClienteResponse> {
        return apiService.request<ClienteResponse>(`${this.baseEndpoint}/${id}`);
    }

    // Criar novo cliente
    async criarCliente(dados: ClienteCreateData): Promise<ClienteResponse> {
        return apiService.request<ClienteResponse>(this.baseEndpoint, {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    // Atualizar cliente
    async atualizarCliente(dados: ClienteUpdateData): Promise<ClienteResponse> {
        const { id, ...updateData } = dados;
        return apiService.request<ClienteResponse>(`${this.baseEndpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    // Deletar cliente
    async deletarCliente(id: string): Promise<{ message: string }> {
        return apiService.request<{ message: string }>(`${this.baseEndpoint}/${id}`, {
            method: 'DELETE',
        });
    }

    // Deletar TODOS os clientes (requer admin)
    async deletarTodosClientes(): Promise<{ message: string; data: { deletedCount: number } }> {
        return apiService.request<{ message: string; data: { deletedCount: number } }>(`${this.baseEndpoint}/all`, {
            method: 'DELETE',
            headers: { 'X-Confirm-Delete-All': 'true' }
        });
    }
}

export const clienteService = new ClienteService();
export default clienteService;
