import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { frotaService, type VeiculoFrota } from '../services/frotaService';
import { reportsService } from '../services/reportsService';
import { EVENTOS_TELEMETRIA, type EventoRastreador } from '../types';
import { exportToPDF, exportToXLSX } from '../utils/exportUtils';
import { showError, showSuccess } from '../utils/toast';
import { Search } from 'lucide-react';
import PageFeedback from '../components/PageFeedback';
import '../styles/dashboard-pages.css';

const TelemetriaEvento: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoFrota[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [rastreadorId, setRastreadorId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState<EventoRastreador[]>([]);

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    setDataInicio(hoje);
    setDataFim(hoje);
    clienteService.listarClientes({ limit: 500 }).then((r) => setClientes(r.data.clientes));
  }, []);

  useEffect(() => {
    if (!clienteId) {
      setVeiculos([]);
      setRastreadorId('');
      return;
    }
    frotaService.listar({ clienteId }).then((r) => setVeiculos(r.veiculos));
  }, [clienteId]);

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.empresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const carregarEventos = async () => {
    if (!clienteId || !dataInicio || !dataFim) {
      showError('Selecione cliente e período');
      return;
    }
    try {
      setLoading(true);
      const veiculosIds = rastreadorId
        ? veiculos.filter((v) => v.rastreadorId === rastreadorId || v.id === rastreadorId).map((v) => v.id)
        : veiculos.map((v) => v.id);

      const res = await reportsService.telemetria({
        dataInicio: new Date(`${dataInicio}T00:00:00`).toISOString(),
        dataFim: new Date(`${dataFim}T23:59:59`).toISOString(),
        clienteId,
        veiculosIds: veiculosIds.length ? veiculosIds : undefined,
        rastreadorId: rastreadorId || undefined,
        eventoId: eventoId ? parseInt(eventoId, 10) : undefined
      });
      setEventos(res.data.eventos);
      showSuccess(`${res.data.total} evento(s) encontrado(s)`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const exportar = async (tipo: 'pdf' | 'xlsx') => {
    const rows = eventos.map((e) => ({
      evento: EVENTOS_TELEMETRIA[e.eventoId] || e.eventoNome || e.eventoId,
      rastreador: e.rastreadorId,
      data: new Date(e.timestamp).toLocaleString('pt-BR'),
      descricao: e.descricao || ''
    }));
    const cols = [
      { key: 'evento', label: 'Evento' },
      { key: 'rastreador', label: 'Rastreador' },
      { key: 'data', label: 'Data/Hora' },
      { key: 'descricao', label: 'Descrição' }
    ];
    if (tipo === 'xlsx') await exportToXLSX(rows, 'telemetria-eventos', cols);
    else await exportToPDF(rows, 'telemetria-eventos', 'Telemetria — Eventos', cols);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>TELEMETRIA — EVENTOS</h1>
      </div>

      <div className="telemetria-container">
        <div className="telemetria-left-panel">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Procurar Cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="clientes-list">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                className={`cliente-item ${clienteId === cliente.id ? 'selected' : ''}`}
                onClick={() => setClienteId(cliente.id)}
              >
                <div className="cliente-nome">{cliente.nome}</div>
                <div className="cliente-abrev">{cliente.empresa}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="telemetria-right-panel">
          <div className="panel-header">
            <h2>Eventos GPS</h2>
          </div>

          {clienteId && (
            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Veículo / Rastreador</label>
                <select value={rastreadorId} onChange={(e) => setRastreadorId(e.target.value)} className="form-input">
                  <option value="">Todos</option>
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.rastreadorId || v.id}>
                      {v.nome} — {v.placa || v.codigo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>De</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label>Até</label>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label>Tipo evento</label>
                <select value={eventoId} onChange={(e) => setEventoId(e.target.value)} className="form-input">
                  <option value="">Todos</option>
                  {Object.entries(EVENTOS_TELEMETRIA).map(([id, nome]) => (
                    <option key={id} value={id}>{nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ alignSelf: 'end' }}>
                <button type="button" className="btn-primary" onClick={carregarEventos} disabled={loading}>
                  {loading ? 'Carregando…' : 'Carregar'}
                </button>
              </div>
            </div>
          )}

          {eventos.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => exportar('xlsx')}>Excel</button>
              <button type="button" className="btn-secondary" onClick={() => exportar('pdf')} style={{ marginLeft: 8 }}>PDF</button>
            </div>
          )}

          <div className="eventos-table-wrap">
            {loading ? (
              <PageFeedback loading loadingMessage="Carregando eventos…" />
            ) : eventos.length === 0 ? (
              <PageFeedback empty emptyMessage="Selecione os filtros e clique em Carregar para ver os eventos." />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Rastreador</th>
                    <th>Data/Hora</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((e) => (
                    <tr key={e.id}>
                      <td>{EVENTOS_TELEMETRIA[e.eventoId] || e.eventoNome || e.eventoId}</td>
                      <td>{e.rastreadorId.slice(0, 8)}…</td>
                      <td>{new Date(e.timestamp).toLocaleString('pt-BR')}</td>
                      <td>{e.descricao || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelemetriaEvento;

