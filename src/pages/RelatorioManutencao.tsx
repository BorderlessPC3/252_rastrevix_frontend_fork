import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';

const RelatorioManutencao: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — MANUTENÇÃO"
    descricao="Veículos com manutenção programada ou em status de manutenção."
    fetchReport={(p) => reportsService.manutencao(p)}
    columns={[
      { key: 'codigo', label: 'Código' },
      { key: 'nome', label: 'Nome' },
      { key: 'status', label: 'Status' },
      { key: 'proximaManutencao', label: 'Próxima manutenção' },
      { key: 'ultimaManutencao', label: 'Última manutenção' }
    ]}
    mapRows={(data) => {
      const d = data as { itens?: Array<Record<string, unknown>> };
      return (d.itens ?? []).map((i) => ({
        codigo: i.codigo,
        nome: i.nome,
        status: i.status,
        proximaManutencao: i.proximaManutencao
          ? new Date(String(i.proximaManutencao)).toLocaleDateString('pt-BR')
          : '—',
        ultimaManutencao: i.ultimaManutencao
          ? new Date(String(i.ultimaManutencao)).toLocaleDateString('pt-BR')
          : '—'
      }));
    }}
  />
);

export default RelatorioManutencao;
