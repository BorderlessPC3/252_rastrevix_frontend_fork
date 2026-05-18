import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';

const RelatorioLogistica: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — LOGÍSTICA"
    descricao="Paradas detectadas e distância por veículo no período."
    fetchReport={(p) => reportsService.logistica({ ...p, velocidadeMinima: 5 })}
    columns={[
      { key: 'rastreadorId', label: 'Rastreador' },
      { key: 'distanciaKm', label: 'Distância (km)' },
      { key: 'paradasDetectadas', label: 'Paradas' },
      { key: 'pontos', label: 'Pontos GPS' }
    ]}
    mapRows={(data) => {
      const d = data as { viagens?: Array<Record<string, unknown>> };
      return (d.viagens ?? []).map((v) => ({
        rastreadorId: String(v.rastreadorId).slice(0, 8) + '…',
        distanciaKm: v.distanciaKm,
        paradasDetectadas: v.paradasDetectadas,
        pontos: v.pontos
      }));
    }}
  />
);

export default RelatorioLogistica;
