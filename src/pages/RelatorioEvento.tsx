import React from 'react';
import RelatorioComResultado from '../components/RelatorioComResultado';
import { reportsService } from '../services/reportsService';
import { EVENTOS_TELEMETRIA } from '../types';

const RelatorioEvento: React.FC = () => (
  <RelatorioComResultado
    titulo="RELATÓRIO — EVENTOS"
    descricao="Eventos de telemetria registrados pelos rastreadores no período."
    fetchReport={(p) => reportsService.eventos(p)}
    columns={[
      { key: 'evento', label: 'Evento' },
      { key: 'rastreador', label: 'Rastreador' },
      { key: 'data', label: 'Data/Hora' },
      { key: 'descricao', label: 'Descrição' }
    ]}
    mapRows={(data) => {
      const d = data as { eventos?: Array<{ eventoId: number; eventoNome?: string; rastreadorId: string; timestamp: string; descricao?: string }> };
      return (d.eventos ?? []).map((e) => ({
        evento: EVENTOS_TELEMETRIA[e.eventoId] || e.eventoNome || e.eventoId,
        rastreador: String(e.rastreadorId).slice(0, 8) + '…',
        data: new Date(e.timestamp).toLocaleString('pt-BR'),
        descricao: e.descricao || '—'
      }));
    }}
  />
);

export default RelatorioEvento;

