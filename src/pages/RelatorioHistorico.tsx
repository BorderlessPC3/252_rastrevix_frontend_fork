import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { maquinaService, type Maquina } from '../services/maquinaService';
import { reportsService, type RelatorioHistoricoResult } from '../services/reportsService';
import { exportToPDF, exportToXLSX } from '../utils/exportUtils';
import { showError, showSuccess } from '../utils/toast';
import { Search, Calendar, Clock } from 'lucide-react';
import '../styles/dashboard-pages.css';
import '../styles/relatorios.css';

interface RelatorioHistoricoFormData {
  clienteId: string;
  veiculosIds: string[];
  periodoRapido: 'hoje' | 'ontem' | 'dois-dias' | 'tres-dias';
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  transmissao: 'todas-gps' | 'todas' | '1h' | '3h' | '6h' | '12h';
  velocidadeMin: number;
  velocidadeMax: number;
  tipoPesquisa: 'analitico' | 'dia-a-dia' | 'resumido';
  tipoLocal: 'ruas' | 'pontos';
  marcadores: 'lig' | 'deslig' | 'ambos';
}

const RelatorioHistorico: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Maquina[]>([]);
  const [veiculosSelecionados, setVeiculosSelecionados] = useState<string[]>([]);
  const [veiculosDropdownOpen, setVeiculosDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<RelatorioHistoricoResult | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof RelatorioHistoricoFormData, string>>>({});

  const [formData, setFormData] = useState<RelatorioHistoricoFormData>({
    clienteId: '',
    veiculosIds: [],
    periodoRapido: 'hoje',
    dataInicio: '',
    horaInicio: '00:00',
    dataFim: '',
    horaFim: '23:59',
    transmissao: 'todas-gps',
    velocidadeMin: 0,
    velocidadeMax: 300,
    tipoPesquisa: 'analitico',
    tipoLocal: 'ruas',
    marcadores: 'ambos'
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof RelatorioHistoricoFormData]) {
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

  const handleVelocidadeChange = (type: 'min' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      velocidadeMin: type === 'min' ? value : prev.velocidadeMin,
      velocidadeMax: type === 'max' ? value : prev.velocidadeMax
    }));
  };

  const validarFormulario = (): boolean => {
    const novosErros: Partial<Record<keyof RelatorioHistoricoFormData, string>> = {};

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

  const buildIsoRange = () => {
    const ini = `${formData.dataInicio}T${formData.horaInicio}:00`;
    const fim = `${formData.dataFim}T${formData.horaFim}:59`;
    return { dataInicio: new Date(ini).toISOString(), dataFim: new Date(fim).toISOString() };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    try {
      setLoading(true);
      const { dataInicio, dataFim } = buildIsoRange();
      const res = await reportsService.historico({
        dataInicio,
        dataFim,
        clienteId: formData.clienteId,
        veiculosIds: veiculosSelecionados
      });
      setResultado(res.data);
      showSuccess(`Relatório gerado: ${res.data.distanciaTotalKm} km em ${res.data.veiculos} veículo(s)`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportarResultado = async (tipo: 'pdf' | 'xlsx') => {
    if (!resultado) return;
    const rows = resultado.resultados.flatMap((r, idx) =>
      r.pontos.slice(0, 500).map((p, i) => ({
        veiculo: idx + 1,
        rastreadorId: r.rastreadorId,
        ordem: i + 1,
        lat: p.latitude,
        lng: p.longitude,
        ts: p.timestamp
      }))
    );
    const cols = [
      { key: 'veiculo', label: 'Veículo' },
      { key: 'rastreadorId', label: 'Rastreador' },
      { key: 'lat', label: 'Lat' },
      { key: 'lng', label: 'Lng' },
      { key: 'ts', label: 'Timestamp' }
    ];
    if (tipo === 'xlsx') {
      await exportToXLSX(rows, 'relatorio-historico', cols);
    } else {
      await exportToPDF(rows, 'relatorio-historico', 'Relatório Histórico', cols);
    }
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>RELATÓRIO • HISTÓRICO</h1>
      </div>

      <div className="relatorio-content">
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
                  Veículos<span className="required">*</span>
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

            {/* Transmissão */}
            <div className="opcoes-movimento">
              <label>Transmissão</label>
              <div className="tipo-pesquisa-buttons">
                <button
                  type="button"
                  className={`tipo-btn ${formData.transmissao === 'todas-gps' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, transmissao: 'todas-gps' }))}
                >
                  Todas com GPS
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.transmissao === 'todas' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, transmissao: 'todas' }))}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.transmissao === '1h' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, transmissao: '1h' }))}
                >
                  1h
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.transmissao === '3h' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, transmissao: '3h' }))}
                >
                  3h
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.transmissao === '6h' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, transmissao: '6h' }))}
                >
                  6h
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.transmissao === '12h' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, transmissao: '12h' }))}
                >
                  12h
                </button>
              </div>
            </div>

            {/* Velocidade */}
            <div className="form-group">
              <label>
                Velocidade: {formData.velocidadeMin} - {formData.velocidadeMax} km/h
              </label>
              <div className="velocidade-slider">
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={formData.velocidadeMin}
                  onChange={(e) => handleVelocidadeChange('min', parseInt(e.target.value))}
                  className="slider"
                />
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={formData.velocidadeMax}
                  onChange={(e) => handleVelocidadeChange('max', parseInt(e.target.value))}
                  className="slider"
                />
                <div className="slider-labels">
                  <span>0</span>
                  <span>300</span>
                </div>
              </div>
            </div>

            {/* Tipo de Pesquisa */}
            <div className="tipo-pesquisa">
              <label>Tipo de Pesquisa</label>
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
                  className={`tipo-btn ${formData.tipoPesquisa === 'dia-a-dia' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'dia-a-dia' }))}
                >
                  Dia a Dia
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'resumido' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'resumido' }))}
                >
                  Resumido
                </button>
              </div>
            </div>

            {/* Tipo do Local */}
            <div className="tipo-pesquisa">
              <label>Tipo do Local</label>
              <div className="tipo-pesquisa-buttons">
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoLocal === 'ruas' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoLocal: 'ruas' }))}
                >
                  Ruas
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoLocal === 'pontos' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoLocal: 'pontos' }))}
                >
                  Pontos
                </button>
              </div>
            </div>

            {/* Marcadores no Rastro */}
            <div className="tipo-pesquisa">
              <label>Marcadores no Rastro</label>
              <div className="tipo-pesquisa-buttons">
                <button
                  type="button"
                  className={`tipo-btn ${formData.marcadores === 'lig' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, marcadores: 'lig' }))}
                >
                  Lig.
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.marcadores === 'deslig' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, marcadores: 'deslig' }))}
                >
                  Deslig.
                </button>
              </div>
            </div>

            <div className="observacao">
              <p>
                <strong>OBS:</strong> todos os campos com (*) são obrigatórios para realizar uma pesquisa!
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-pesquisar" disabled={loading}>
                <Search size={20} />
                {loading ? 'GERANDO...' : 'PESQUISAR'}
              </button>
            </div>
          </form>
        </div>

        <div className="descricao-relatorio">
          <div className="descricao-icon">
            <Search size={64} />
          </div>
          {resultado ? (
            <>
              <h2>Resultado</h2>
              <p><strong>{resultado.veiculos}</strong> veículo(s) • <strong>{resultado.distanciaTotalKm} km</strong></p>
              <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                <button type="button" className="btn-secondary" onClick={() => exportarResultado('xlsx')}>Excel</button>
                <button type="button" className="btn-secondary" onClick={() => exportarResultado('pdf')}>PDF</button>
              </div>
              <ul style={{ textAlign: 'left' }}>
                {resultado.resultados.map((r) => (
                  <li key={r.rastreadorId}>{r.rastreadorId.slice(0, 8)}… — {r.distanciaKm} km — {r.duracaoMinutos} min</li>
                ))}
              </ul>
            </>
          ) : (
            <>
          <h2>Relatório de Histórico</h2>
          <p>Selecione cliente, veículos e período para gerar com dados GPS reais.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioHistorico;
