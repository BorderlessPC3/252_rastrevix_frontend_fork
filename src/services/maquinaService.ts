import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';

export interface Maquina {
    id: string;
    codigo: string;
    nome: string;
    tipo: 'torno' | 'fresa' | 'soldadora' | 'prensa' | 'cnc' | 'outras';
    status: 'ativa' | 'inativa' | 'manutencao' | 'calibracao';
    fabricante?: string;
    modelo?: string;
    numeroSerie?: string;
    dataFabricacao?: string;
    dataInstalacao?: string;
    valorCompra?: number;
    eficiencia?: number;
    localizacao?: string;
    responsavel?: string;
    especificacoes?: string;
    observacoes?: string;
    proximaManutencao?: string;
    ultimaManutencao?: string;
    horasTrabalhadas?: number;
    horasManutencao?: number;
    latitude?: number;
    longitude?: number;
    clienteId?: string;
    rastreadorId?: string;
    placa?: string;
    grupo?: string;
    equipamento?: string;
    equipamentoNumero?: string;
    dataInstalacaoEquipamento?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
}

export interface MaquinaCreateData {
    codigo: string;
    nome: string;
    tipo: 'torno' | 'fresa' | 'soldadora' | 'prensa' | 'cnc' | 'outras';
    status?: 'ativa' | 'inativa' | 'manutencao' | 'calibracao';
    fabricante?: string;
    modelo?: string;
    numeroSerie?: string;
    dataFabricacao?: string;
    dataInstalacao?: string;
    valorCompra?: number;
    eficiencia?: number;
    localizacao?: string;
    responsavel?: string;
    especificacoes?: string;
    observacoes?: string;
    proximaManutencao?: string;
    ultimaManutencao?: string;
    horasTrabalhadas?: number;
    horasManutencao?: number;
    latitude?: number;
    longitude?: number;
    clienteId?: string;
    placa?: string;
    grupo?: string;
    equipamento?: string;
    equipamentoNumero?: string;
    dataInstalacaoEquipamento?: string;
}

export interface MaquinaUpdateData extends Partial<MaquinaCreateData> {
    id: string;
}

export interface MaquinaListResponse {
    message: string;
    data: {
        maquinas: Maquina[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface MaquinaStatsResponse {
    message: string;
    data: {
        total: number;
        ativas: number;
        inativas: number;
        manutencao: number;
        calibracao: number;
        eficienciaMedia: number;
        porTipo: Array<{
            tipo: string;
            count: string;
        }>;
    };
}

export interface MaquinaResponse {
    message: string;
    data: {
        maquina: Maquina;
    };
}

class MaquinaService {
    private baseEndpoint = '/maquinas';

    // Listar máquinas com filtros e paginação
    async listarMaquinas(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        tipo?: string;
        clienteId?: string;
    }): Promise<MaquinaListResponse> {
        if (useFirebaseDirect()) return fb.listarMaquinas(params);
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.tipo) queryParams.append('tipo', params.tipo);
        if (params?.clienteId) queryParams.append('clienteId', params.clienteId);

        const endpoint = queryParams.toString()
            ? `${this.baseEndpoint}?${queryParams.toString()}`
            : this.baseEndpoint;

        return apiService.request<MaquinaListResponse>(endpoint);
    }

    // Obter estatísticas das máquinas
    async obterEstatisticas(): Promise<MaquinaStatsResponse> {
        if (useFirebaseDirect()) return fb.obterEstatisticasMaquinas();
        return apiService.request<MaquinaStatsResponse>(`${this.baseEndpoint}/stats`);
    }

    // Obter máquina por ID
    async obterMaquina(id: string): Promise<MaquinaResponse> {
        if (useFirebaseDirect()) return fb.obterMaquina(id);
        return apiService.request<MaquinaResponse>(`${this.baseEndpoint}/${id}`);
    }

    // Criar nova máquina
    async criarMaquina(dados: MaquinaCreateData): Promise<MaquinaResponse> {
        if (useFirebaseDirect()) return fb.criarMaquina(dados);
        return apiService.request<MaquinaResponse>(this.baseEndpoint, {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    // Atualizar máquina
    async atualizarMaquina(dados: MaquinaUpdateData): Promise<MaquinaResponse> {
        if (useFirebaseDirect()) return fb.atualizarMaquina(dados);
        const { id, ...updateData } = dados;
        return apiService.request<MaquinaResponse>(`${this.baseEndpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    }

    // Deletar máquina
    async deletarMaquina(id: string): Promise<{ message: string }> {
        if (useFirebaseDirect()) return fb.deletarMaquina(id);
        return apiService.request<{ message: string }>(`${this.baseEndpoint}/${id}`, {
            method: 'DELETE',
        });
    }
}

export const maquinaService = new MaquinaService();
export default maquinaService;