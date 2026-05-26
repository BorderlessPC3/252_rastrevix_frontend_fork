import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';
import type {
    Rastreador,
    RastreadorComPosicao,
    RastreadorListResponse,
    RastreadorPosicaoResponse,
    RastreadorDadosResponse,
    RastreadorEventosResponse
} from '../types';

class RastreadorService {
    private baseEndpoint = '/rastreadores';

    async listarRastreadores(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<RastreadorListResponse> {
        if (useFirebaseDirect()) return fb.listarRastreadores(params) as Promise<RastreadorListResponse>;

        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);

        const endpoint = queryParams.toString()
            ? `${this.baseEndpoint}?${queryParams.toString()}`
            : this.baseEndpoint;

        return apiService.request<RastreadorListResponse>(endpoint);
    }

    async obterRastreador(id: string): Promise<{ message: string; data: { rastreador: Rastreador } }> {
        if (useFirebaseDirect()) return fb.obterRastreador(id) as Promise<{ message: string; data: { rastreador: Rastreador } }>;
        return apiService.request<{ message: string; data: { rastreador: Rastreador } }>(`${this.baseEndpoint}/${id}`);
    }

    async obterPosicaoAtual(id: string): Promise<RastreadorPosicaoResponse> {
        if (useFirebaseDirect()) return fb.obterPosicaoAtual(id) as Promise<RastreadorPosicaoResponse>;
        return apiService.request<RastreadorPosicaoResponse>(`${this.baseEndpoint}/${id}/posicao-atual`);
    }

    async obterDados(id: string, params?: {
        page?: number;
        limit?: number;
        dataInicio?: string;
        dataFim?: string;
    }): Promise<RastreadorDadosResponse> {
        if (useFirebaseDirect()) return fb.obterDadosRastreador(id, params) as Promise<RastreadorDadosResponse>;

        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
        if (params?.dataFim) queryParams.append('dataFim', params.dataFim);

        const endpoint = queryParams.toString()
            ? `${this.baseEndpoint}/${id}/dados?${queryParams.toString()}`
            : `${this.baseEndpoint}/${id}/dados`;

        return apiService.request<RastreadorDadosResponse>(endpoint);
    }

    async listarRastreadoresComPosicoes(): Promise<RastreadorComPosicao[]> {
        try {
            const response = await this.listarRastreadores({
                limit: 1000,
                status: 'ativo'
            });

            const rastreadores = response.data.rastreadores;

            const rastreadoresComPosicoes = await Promise.allSettled(
                rastreadores.map(async (rastreador) => {
                    try {
                        const posicaoResponse = await this.obterPosicaoAtual(rastreador.id);
                        return {
                            ...rastreador,
                            posicaoAtual: posicaoResponse.data.posicao
                        } as RastreadorComPosicao;
                    } catch {
                        return {
                            ...rastreador,
                            posicaoAtual: undefined
                        } as RastreadorComPosicao;
                    }
                })
            );

            return rastreadoresComPosicoes
                .filter((result): result is PromiseFulfilledResult<RastreadorComPosicao> =>
                    result.status === 'fulfilled'
                )
                .map(result => result.value)
                .filter(rastreador =>
                    rastreador.posicaoAtual?.latitude &&
                    rastreador.posicaoAtual?.longitude
                );
        } catch (error) {
            console.error('Erro ao listar rastreadores com posições:', error);
            return [];
        }
    }

    async criarRastreador(dados: Partial<Rastreador>): Promise<{ message: string; data: { rastreador: Rastreador } }> {
        if (useFirebaseDirect()) return fb.criarRastreador(dados) as Promise<{ message: string; data: { rastreador: Rastreador } }>;
        return apiService.request<{ message: string; data: { rastreador: Rastreador } }>(this.baseEndpoint, {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    }

    async atualizarRastreador(id: string, dados: Partial<Rastreador>): Promise<{ message: string; data: { rastreador: Rastreador } }> {
        if (useFirebaseDirect()) return fb.atualizarRastreador(id, dados) as Promise<{ message: string; data: { rastreador: Rastreador } }>;
        return apiService.request<{ message: string; data: { rastreador: Rastreador } }>(`${this.baseEndpoint}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
    }

    async deletarRastreador(id: string): Promise<{ message: string }> {
        if (useFirebaseDirect()) return fb.deletarRastreador(id);
        return apiService.request<{ message: string }>(`${this.baseEndpoint}/${id}`, {
            method: 'DELETE',
        });
    }

    async obterEventos(id: string, params?: {
        page?: number;
        limit?: number;
        dataInicio?: string;
        dataFim?: string;
        eventoId?: number;
    }): Promise<RastreadorEventosResponse> {
        if (useFirebaseDirect()) return fb.obterEventosRastreador(id, params) as Promise<RastreadorEventosResponse>;

        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.dataInicio) queryParams.append('dataInicio', params.dataInicio);
        if (params?.dataFim) queryParams.append('dataFim', params.dataFim);
        if (params?.eventoId) queryParams.append('eventoId', params.eventoId.toString());

        const endpoint = queryParams.toString()
            ? `${this.baseEndpoint}/${id}/eventos?${queryParams.toString()}`
            : `${this.baseEndpoint}/${id}/eventos`;

        return apiService.request<RastreadorEventosResponse>(endpoint);
    }
}

export const rastreadorService = new RastreadorService();
export default rastreadorService;
