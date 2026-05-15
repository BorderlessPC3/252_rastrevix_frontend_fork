import { apiService } from './api';
import type { DadosRastreador, Rastreador } from '../types';

export interface VeiculoFrota {
  id: string;
  maquinaId: string;
  rastreadorId?: string;
  codigo: string;
  nome: string;
  placa?: string;
  status: string;
  clienteId?: string;
  tipo?: string;
  tipoVeiculo?: string;
  condutor?: string;
  rastreador?: Rastreador;
  posicaoAtual?: DadosRastreador;
}

export interface RotaResponse {
  message: string;
  data: {
    veiculoId: string;
    rastreadorId: string;
    pontos: DadosRastreador[];
    distanciaKm: number;
    duracaoMinutos: number;
    dataInicio?: string;
    dataFim?: string;
  };
}

class FrotaService {
  async listar(params?: {
    clienteId?: string;
    status?: string;
    search?: string;
  }): Promise<{ veiculos: VeiculoFrota[]; total: number }> {
    const q = new URLSearchParams();
    if (params?.clienteId) q.append('clienteId', params.clienteId);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);

    const endpoint = q.toString() ? `/frota?${q}` : '/frota';
    const res = await apiService.request<{
      message: string;
      data: { veiculos: VeiculoFrota[]; total: number };
    }>(endpoint);
    return res.data;
  }

  async listarMapa(clienteId?: string): Promise<VeiculoFrota[]> {
    const q = clienteId ? `?clienteId=${clienteId}` : '';
    const res = await apiService.request<{
      message: string;
      data: { veiculos: VeiculoFrota[]; total: number };
    }>(`/frota/mapa${q}`);
    return res.data.veiculos;
  }

  async obterRota(
    veiculoId: string,
    dataInicio: string,
    dataFim: string,
    limit = 5000
  ): Promise<RotaResponse['data']> {
    const q = new URLSearchParams({
      dataInicio,
      dataFim,
      limit: String(limit)
    });
    const res = await apiService.request<RotaResponse>(
      `/frota/${veiculoId}/rota?${q}`
    );
    return res.data;
  }
}

export const frotaService = new FrotaService();
export default frotaService;
