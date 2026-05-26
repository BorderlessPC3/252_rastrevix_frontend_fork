import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';
import type { DadosRastreador, EventoRastreador } from '../types';

export interface RelatorioPeriodoPayload {
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
  private post<T>(path: string, payload: object) {
    return apiService.request<{ message: string; data: T }>(`/reports${path}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  historico(payload: RelatorioPeriodoPayload) {
    if (useFirebaseDirect()) return fb.relatorioHistorico(payload);
    return this.post<RelatorioHistoricoResult>('/historico', payload);
  }

  telemetria(payload: RelatorioPeriodoPayload & { eventoId?: number }) {
    if (useFirebaseDirect()) return fb.relatorioTelemetria(payload);
    return this.post<RelatorioTelemetriaResult>('/telemetria', payload);
  }

  eventos(payload: RelatorioPeriodoPayload & { eventoId?: number }) {
    if (useFirebaseDirect()) return fb.relatorioTelemetria(payload);
    return this.post<RelatorioTelemetriaResult>('/eventos', payload);
  }

  movimentacao(payload: RelatorioPeriodoPayload & { velocidadeMinima?: number }) {
    if (useFirebaseDirect()) return fb.relatorioMovimentacao(payload);
    return this.post<RelatorioMovimentacaoResult>('/movimentacao', payload);
  }

  frota(payload: RelatorioPeriodoPayload) {
    if (useFirebaseDirect()) return fb.relatorioFrota(payload);
    return this.post<{
      periodo: { dataInicio: string; dataFim: string };
      resumo: { total: number; ativas: number; comRastreador: number; distanciaTotalKm: number };
      veiculos: Array<{
        id: string;
        codigo: string;
        nome: string;
        status: string;
        distanciaKm: number;
        duracaoMinutos: number;
        eficiencia?: number;
      }>;
    }>('/frota', payload);
  }

  logistica(payload: RelatorioPeriodoPayload & { velocidadeMinima?: number }) {
    if (useFirebaseDirect()) return fb.relatorioLogistica(payload);
    return this.post<{
      viagens: Array<{
        rastreadorId: string;
        distanciaKm: number;
        paradasDetectadas: number;
        pontos: number;
      }>;
    }>('/logistica', payload);
  }

  financeiro(
    payload: RelatorioPeriodoPayload & {
      custoPorKm?: number;
      custoCombustivelLitro?: number;
      consumoKmPorLitro?: number;
    }
  ) {
    if (useFirebaseDirect()) return fb.relatorioFinanceiro(payload);
    return this.post<{
      custoTotal: number;
      linhas: Array<{
        rastreadorId: string;
        distanciaKm: number;
        custoTotal: number;
      }>;
    }>('/financeiro', payload);
  }

  desempenho(payload: RelatorioPeriodoPayload) {
    if (useFirebaseDirect()) return fb.relatorioDesempenho(payload);
    return this.post<{
      mediaEficiencia: number;
      distanciaTotalKm: number;
      ranking: Array<{ id: string; codigo: string; nome: string; distanciaKm: number }>;
    }>('/desempenho', payload);
  }

  viagem(payload: RelatorioPeriodoPayload) {
    if (useFirebaseDirect()) return fb.relatorioViagem(payload);
    return this.post<{
      viagens: Array<{
        rastreadorId: string;
        viagemIndex: number;
        distanciaKm: number;
        pontos: number;
        inicio?: string;
        fim?: string;
      }>;
    }>('/viagem', payload);
  }

  manutencao(payload: RelatorioPeriodoPayload) {
    if (useFirebaseDirect()) return fb.relatorioManutencao();
    return this.post<{
      itens: Array<{
        id: string;
        codigo: string;
        nome: string;
        status: string;
        proximaManutencao?: string;
        ultimaManutencao?: string;
      }>;
    }>('/manutencao', payload);
  }
}

export const reportsService = new ReportsService();
export default reportsService;
