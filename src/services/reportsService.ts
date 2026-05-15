import { apiService } from './api';
import type { DadosRastreador, EventoRastreador } from '../types';

export interface RelatorioHistoricoPayload {
  dataInicio: string;
  dataFim: string;
  clienteId?: string;
  veiculosIds?: string[];
  veiculoId?: string;
  rastreadorId?: string;
}

export interface RelatorioHistoricoResult {
  periodo: { dataInicio: string; dataFim: string };
  veiculos: number;
  distanciaTotalKm: number;
  resultados: Array<{
    rastreadorId: string;
    pontos: DadosRastreador[];
    distanciaKm: number;
    duracaoMinutos: number;
  }>;
}

export interface RelatorioTelemetriaResult {
  periodo: { dataInicio: string; dataFim: string };
  total: number;
  eventos: EventoRastreador[];
}

export interface RelatorioMovimentacaoResult {
  periodo: { dataInicio: string; dataFim: string };
  velocidadeMinima: number;
  relatorios: Array<{
    rastreadorId: string;
    distanciaKm: number;
    tempoMovimentoMinutos: number;
    tempoParadoMinutos: number;
    pontosAnalisados: number;
    velocidadeMaxima: number;
  }>;
}

class ReportsService {
  async historico(payload: RelatorioHistoricoPayload) {
    return apiService.request<{ message: string; data: RelatorioHistoricoResult }>(
      '/reports/historico',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }

  async telemetria(
    payload: RelatorioHistoricoPayload & { eventoId?: number }
  ) {
    return apiService.request<{ message: string; data: RelatorioTelemetriaResult }>(
      '/reports/telemetria',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }

  async movimentacao(
    payload: RelatorioHistoricoPayload & { velocidadeMinima?: number }
  ) {
    return apiService.request<{ message: string; data: RelatorioMovimentacaoResult }>(
      '/reports/movimentacao',
      { method: 'POST', body: JSON.stringify(payload) }
    );
  }
}

export const reportsService = new ReportsService();
export default reportsService;
