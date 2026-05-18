import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';

const RelatorioViagem: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — VIAGEM"
    descricao="Viagens segmentadas por intervalo entre posições GPS."
    fetchReport={(p) => reportsService.viagem(p)}
    columns={[
      { key: 'rastreadorId', label: 'Rastreador' },
      { key: 'viagemIndex', label: 'Viagem #' },
      { key: 'distanciaKm', label: 'Distância (km)' },
      { key: 'pontos', label: 'Pontos' },
      { key: 'inicio', label: 'Início' },
      { key: 'fim', label: 'Fim' }
    ]}
    mapRows={(data) => {
      const d = data as { viagens?: Array<Record<string, unknown>> };
      return (d.viagens ?? []).map((v) => ({
        rastreadorId: String(v.rastreadorId).slice(0, 8) + '…',
        viagemIndex: v.viagemIndex,
        distanciaKm: v.distanciaKm,
        pontos: v.pontos,
        inicio: v.inicio ? new Date(String(v.inicio)).toLocaleString('pt-BR') : '—',
        fim: v.fim ? new Date(String(v.fim)).toLocaleString('pt-BR') : '—'
      }));
    }}
  />
);

export default RelatorioViagem;
