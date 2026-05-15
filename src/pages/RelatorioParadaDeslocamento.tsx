import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { maquinaService, type Maquina } from '../services/maquinaService';
import { reportsService, type RelatorioMovimentacaoResult } from '../services/reportsService';
import { exportToPDF, exportToXLSX } from '../utils/exportUtils';
import { showError, showSuccess } from '../utils/toast';
import { Search, Calendar, Clock, DollarSign } from 'lucide-react';
import '../styles/dashboard-pages.css';
import '../styles/relatorios.css';

interface RelatorioFormData {
  clienteId: string;
  veiculosIds: string[];
  periodoRapido: 'hoje' | 'ontem' | 'dois-dias' | 'tres-dias' | 'custom';
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  consumo: string;
  custo: string;
  movimento: boolean;
  parado: boolean;
  paradoIgnLigada: boolean;
  buscaRuas: boolean;
  tipoPesquisa: 'analitico' | 'resumido' | 'dia-a-dia' | 'pontos';
}

const RelatorioParadaDeslocamento: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Maquina[]>([]);
  const [veiculosSelecionados, setVeiculosSelecionados] = useState<string[]>([]);
  const [veiculosDropdownOpen, setVeiculosDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<RelatorioMovimentacaoResult | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RelatorioFormData, string>>>({});

  const [formData, setFormData] = useState<RelatorioFormData>({
    clienteId: '',
    veiculosIds: [],
    periodoRapido: 'hoje',
    dataInicio: '',
    horaInicio: '00:00',
    dataFim: '',
    horaFim: '23:59',
    consumo: '',
    custo: '',
    movimento: true,
    parado: true,
    paradoIgnLigada: true,
    buscaRuas: false,
    tipoPesquisa: 'analitico'
  });

  useEffect(() => {
    carregarClientes();
    definirPeriodoHoje();
  }, []);

  useEffect(() => {
    if (formData.clienteId) {
      carregarVeiculos(formData.clienteId);
    } else {
      setVeiculos([]);
      setVeiculosSelecionados([]);
      setVeiculosDropdownOpen(false);
    }
  }, [formData.clienteId]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.veiculos-selector')) {
        setVeiculosDropdownOpen(false);
      }
    };

    if (veiculosDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [veiculosDropdownOpen]);

  const definirPeriodoHoje = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;
    setFormData(prev => ({
      ...prev,
      dataInicio: dataFormatada,
      dataFim: dataFormatada,
      horaInicio: '00:00',
      horaFim: '23:59'
    }));
  };

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const response = await clienteService.listarClientes({ limit: 1000 });
      setClientes(response.data.clientes);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarVeiculos = async (clienteId: string) => {
    try {
      setLoading(true);
      const response = await maquinaService.listarMaquinas({
        clienteId,
        limit: 1000
      });
      setVeiculos(response.data.maquinas);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoRapido = (periodo: 'hoje' | 'ontem' | 'dois-dias' | 'tres-dias') => {
    const hoje = new Date();
    let dataInicio = new Date();
    let dataFim = new Date();

    switch (periodo) {
      case 'hoje':
        dataInicio = new Date(hoje);
        dataFim = new Date(hoje);
        break;
      case 'ontem':
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 1);
        dataFim = new Date(dataInicio);
        break;
      case 'dois-dias':
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 2);
        dataFim = new Date(hoje);
        break;
      case 'tres-dias':
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 3);
        dataFim = new Date(hoje);
        break;
    }

    const formatarData = (data: Date) => {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    };

    setFormData(prev => ({
      ...prev,
      periodoRapido: periodo,
      dataInicio: formatarData(dataInicio),
      dataFim: formatarData(dataFim),
      horaInicio: periodo === 'hoje' ? '00:00' : '00:00',
      horaFim: periodo === 'hoje' ? '23:59' : '23:59'
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpar erro quando o usuário começar a digitar
    if (errors[name as keyof RelatorioFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleVeiculoToggle = (veiculoId: string) => {
    setVeiculosSelecionados(prev => {
      const novoArray = prev.includes(veiculoId)
        ? prev.filter(id => id !== veiculoId)
        : [...prev, veiculoId];

      setFormData(prev => ({
        ...prev,
        veiculosIds: novoArray
      }));

      return novoArray;
    });
  };

  const validarFormulario = (): boolean => {
    const novosErros: Partial<Record<keyof RelatorioFormData, string>> = {};

    if (!formData.clienteId) {
      novosErros.clienteId = 'Cliente é obrigatório';
    }

    if (veiculosSelecionados.length === 0) {
      novosErros.veiculosIds = 'Selecione pelo menos um veículo';
    }

    if (!formData.dataInicio) {
      novosErros.dataInicio = 'Data início é obrigatória';
    }

    if (!formData.horaInicio) {
      novosErros.horaInicio = 'Hora início é obrigatória';
    }

    if (!formData.dataFim) {
      novosErros.dataFim = 'Data fim é obrigatória';
    }

    if (!formData.horaFim) {
      novosErros.horaFim = 'Hora fim é obrigatória';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const dataInicio = new Date(`${formData.dataInicio}T${formData.horaInicio}:00`).toISOString();
      const dataFim = new Date(`${formData.dataFim}T${formData.horaFim}:59`).toISOString();
      const res = await reportsService.movimentacao({
        dataInicio,
        dataFim,
        clienteId: formData.clienteId,
        veiculosIds: veiculosSelecionados,
        velocidadeMinima: 5
      });
      setResultado(res.data);
      showSuccess('Relatório de movimentação gerado');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportarMovimentacao = async (tipo: 'pdf' | 'xlsx') => {
    if (!resultado) return;
    const rows = resultado.relatorios.map((r) => ({
      rastreador: r.rastreadorId,
      distanciaKm: r.distanciaKm,
      movimentoMin: r.tempoMovimentoMinutos,
      paradoMin: r.tempoParadoMinutos,
      velMax: r.velocidadeMaxima
    }));
    const cols = [
      { key: 'rastreador', label: 'Rastreador' },
      { key: 'distanciaKm', label: 'Distância (km)' },
      { key: 'movimentoMin', label: 'Em movimento (min)' },
      { key: 'paradoMin', label: 'Parado (min)' },
      { key: 'velMax', label: 'Vel. máx' }
    ];
    if (tipo === 'xlsx') await exportToXLSX(rows, 'movimentacao', cols);
    else await exportToPDF(rows, 'movimentacao', 'Parada e Deslocamento', cols);
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>RELATÓRIO - PARADA E DESLOCAMENTO</h1>
      </div>

      <div className="relatorio-content">
        {/* Seção de Filtros */}
        <div className="filtros-section">
          <h2 className="filtros-title">Filtros</h2>

          <form onSubmit={handleSubmit} className="relatorio-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clienteId">
                  Cliente<span className="required">*</span>
                </label>
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  className={`form-select ${errors.clienteId ? 'error' : ''}`}
                >
                  <option value="">[Selecione o Cliente]</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.empresa}
                    </option>
                  ))}
                </select>
                {errors.clienteId && (
                  <span className="error-message">{errors.clienteId}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="veiculos">
                  Veículo<span className="required">*</span>
                </label>
                <div className="veiculos-selector">
                  <div
                    className="veiculos-selected"
                    onClick={() => formData.clienteId && veiculos.length > 0 && setVeiculosDropdownOpen(!veiculosDropdownOpen)}
                  >
                    {veiculosSelecionados.length > 0
                      ? `${veiculosSelecionados.length} Selecionados`
                      : formData.clienteId
                        ? 'Selecione os veículos'
                        : 'Selecione um cliente primeiro'}
                  </div>
                  {formData.clienteId && veiculos.length > 0 && veiculosDropdownOpen && (
                    <div className="veiculos-dropdown">
                      {veiculos.map(veiculo => (
                        <label key={veiculo.id} className="veiculo-checkbox">
                          <input
                            type="checkbox"
                            checked={veiculosSelecionados.includes(veiculo.id)}
                            onChange={() => handleVeiculoToggle(veiculo.id)}
                          />
                          <span>{veiculo.nome || veiculo.placa || veiculo.codigo}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.veiculosIds && (
                  <span className="error-message">{errors.veiculosIds}</span>
                )}
              </div>
            </div>

            {/* Período */}
            <div className="periodo-section">
              <label>Período</label>
              <div className="periodo-rapido-buttons">
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'hoje' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('hoje')}
                >
                  Hoje
                </button>
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'ontem' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('ontem')}
                >
                  Ontem
                </button>
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'dois-dias' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('dois-dias')}
                >
                  Dois dias
                </button>
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'tres-dias' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('tres-dias')}
                >
                  Três dias
                </button>
              </div>

              <div className="periodo-datas">
                <div className="form-group">
                  <label htmlFor="dataInicio">
                    Data Início<span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Calendar className="input-icon" size={18} />
                    <input
                      type="text"
                      id="dataInicio"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      placeholder="DD/MM/AAAA"
                      className={`form-input ${errors.dataInicio ? 'error' : ''}`}
                    />
                  </div>
                  {errors.dataInicio && (
                    <span className="error-message">{errors.dataInicio}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="horaInicio">
                    Hora Início<span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Clock className="input-icon" size={18} />
                    <input
                      type="text"
                      id="horaInicio"
                      name="horaInicio"
                      value={formData.horaInicio}
                      onChange={handleChange}
                      placeholder="HH:MM"
                      className={`form-input ${errors.horaInicio ? 'error' : ''}`}
                    />
                  </div>
                  {errors.horaInicio && (
                    <span className="error-message">{errors.horaInicio}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="dataFim">
                    Data Fim<span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Calendar className="input-icon" size={18} />
                    <input
                      type="text"
                      id="dataFim"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleChange}
                      placeholder="DD/MM/AAAA"
                      className={`form-input ${errors.dataFim ? 'error' : ''}`}
                    />
                  </div>
                  {errors.dataFim && (
                    <span className="error-message">{errors.dataFim}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="horaFim">
                    Hora Fim<span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Clock className="input-icon" size={18} />
                    <input
                      type="text"
                      id="horaFim"
                      name="horaFim"
                      value={formData.horaFim}
                      onChange={handleChange}
                      placeholder="HH:MM"
                      className={`form-input ${errors.horaFim ? 'error' : ''}`}
                    />
                  </div>
                  {errors.horaFim && (
                    <span className="error-message">{errors.horaFim}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Consumo e Custo */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="consumo">Consumo (km/L)</label>
                <input
                  type="text"
                  id="consumo"
                  name="consumo"
                  value={formData.consumo}
                  onChange={handleChange}
                  placeholder="Consumo (km/L)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="custo">Custo (R$/L)</label>
                <div className="input-with-icon">
                  <DollarSign className="input-icon" size={18} />
                  <input
                    type="text"
                    id="custo"
                    name="custo"
                    value={formData.custo}
                    onChange={handleChange}
                    placeholder="Custo (R$/L)"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Opções de Movimento/Parada */}
            <div className="opcoes-movimento">
              <label>Opções de Movimento/Parada</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="movimento"
                    checked={formData.movimento}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Movimento</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="parado"
                    checked={formData.parado}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Parado</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="paradoIgnLigada"
                    checked={formData.paradoIgnLigada}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Parado (IGN. ligada)</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="buscaRuas"
                    checked={formData.buscaRuas}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Busca RUAS</span>
                </label>
              </div>
            </div>

            {/* Observação */}
            <div className="observacao">
              <p>
                <strong>OBS:</strong> todos os campos com (*) são obrigatórios para realizar uma pesquisa!
              </p>
            </div>

            {/* Tipo de Pesquisa */}
            <div className="tipo-pesquisa">
              <label>Pesquisa por:</label>
              <div className="tipo-pesquisa-buttons">
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'analitico' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'analitico' }))}
                >
                  Analítico
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'resumido' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'resumido' }))}
                >
                  Resumido
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'dia-a-dia' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'dia-a-dia' }))}
                >
                  Dia a Dia
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'pontos' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'pontos' }))}
                >
                  Pontos
                </button>
              </div>
            </div>

            {/* Botão Pesquisar */}
            <div className="form-actions">
              <button type="submit" className="btn-pesquisar" disabled={loading}>
                <Search size={20} />
                {loading ? 'GERANDO...' : 'PESQUISAR'}
              </button>
            </div>
          </form>
        </div>

        {/* Seção de Descrição do Relatório */}
        <div className="descricao-relatorio">
          <div className="descricao-icon">
            <Search size={64} />
          </div>
          {resultado ? (
            <>
              <h2>Resultado — Movimentação</h2>
              <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                <button type="button" className="btn-secondary" onClick={() => exportarMovimentacao('xlsx')}>Excel</button>
                <button type="button" className="btn-secondary" onClick={() => exportarMovimentacao('pdf')}>PDF</button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rastreador</th>
                    <th>Distância</th>
                    <th>Movimento (min)</th>
                    <th>Parado (min)</th>
                    <th>Vel. máx</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.relatorios.map((r) => (
                    <tr key={r.rastreadorId}>
                      <td>{r.rastreadorId.slice(0, 8)}…</td>
                      <td>{r.distanciaKm} km</td>
                      <td>{r.tempoMovimentoMinutos}</td>
                      <td>{r.tempoParadoMinutos}</td>
                      <td>{r.velocidadeMaxima}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
          <h2>Relatório de Parada e Deslocamento</h2>
          <p>Análise de tempo em movimento vs parado com base em velocidade GPS real.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioParadaDeslocamento;
