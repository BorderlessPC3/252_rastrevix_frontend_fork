import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';

const RelatorioFinanceiro: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — FINANCEIRO"
    descricao="Custos estimados por distância e combustível no período."
    fetchReport={(p) =>
      reportsService.financeiro({
        ...p,
        custoPorKm: 2.5,
        consumoKmPorLitro: 10,
        custoCombustivelLitro: 6
      })
    }
    columns={[
      { key: 'rastreadorId', label: 'Rastreador' },
      { key: 'distanciaKm', label: 'Distância (km)' },
      { key: 'custoTotal', label: 'Custo total (R$)' }
    ]}
    mapRows={(data) => {
      const d = data as { linhas?: Array<Record<string, unknown>> };
      return (d.linhas ?? []).map((l) => ({
        rastreadorId: String(l.rastreadorId).slice(0, 8) + '…',
        distanciaKm: l.distanciaKm,
        custoTotal: l.custoTotal
      }));
    }}
  />
);

export default RelatorioFinanceiro;
