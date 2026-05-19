import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';

const RelatorioDesempenho: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — DESEMPENHO"
    descricao="Ranking de veículos por distância e eficiência média no período."
    fetchReport={(p) => reportsService.desempenho(p)}
    columns={[
      { key: 'codigo', label: 'Código' },
      { key: 'nome', label: 'Nome' },
      { key: 'distanciaKm', label: 'Distância (km)' }
    ]}
    mapRows={(data) => {
      const d = data as {
        mediaEficiencia?: number;
        distanciaTotalKm?: number;
        ranking?: Array<Record<string, unknown>>;
      };
      const rows = (d.ranking ?? []).map((r) => ({
        codigo: r.codigo,
        nome: r.nome,
        distanciaKm: r.distanciaKm
      }));
      if (rows.length === 0 && d.distanciaTotalKm != null) {
        return [
          {
            codigo: '—',
            nome: `Média eficiência: ${d.mediaEficiencia ?? 0}% | Total: ${d.distanciaTotalKm} km`,
            distanciaKm: d.distanciaTotalKm
          }
        ];
      }
      return rows;
    }}
  />
);

export default RelatorioDesempenho;
