import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';

const RelatorioFrota: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — FROTA"
    descricao="Consolidado de veículos, status e distância percorrida no período."
    fetchReport={(p) => reportsService.frota(p)}
    columns={[
      { key: 'codigo', label: 'Código' },
      { key: 'nome', label: 'Nome' },
      { key: 'status', label: 'Status' },
      { key: 'distanciaKm', label: 'Distância (km)' },
      { key: 'duracaoMinutos', label: 'Duração (min)' },
      { key: 'eficiencia', label: 'Eficiência %' }
    ]}
    mapRows={(data) => {
      const d = data as { veiculos?: Array<Record<string, unknown>> };
      return (d.veiculos ?? []).map((v) => ({
        codigo: v.codigo,
        nome: v.nome,
        status: v.status,
        distanciaKm: v.distanciaKm,
        duracaoMinutos: v.duracaoMinutos,
        eficiencia: v.eficiencia ?? '—'
      }));
    }}
  />
);

export default RelatorioFrota;
