import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { Search, Calendar, Clock } from 'lucide-react';
import '../styles/dashboard-pages.css';
import '../styles/relatorios.css';

interface RelatorioMotoristaJornadaFormData {
  clienteId: string;
  motoristaId: string;
  periodoRapido: 'esse-mes' | 'mes-anterior' | 'dois-meses' | 'tres-meses';
  dataInicio: string;
  horaInicio: string;
  dataFim: string;
  horaFim: string;
  horasDescanso: {
    cargaDescarga: boolean;
    intervalo: boolean;
    almocoJanta: boolean;
  };
  tipoRelatorio: 'analitico' | 'resumido';
  tipoPesquisa: 'motorista' | 'veiculo' | 'viagem' | 'diario';
}

const RelatorioMotoristaJornada: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RelatorioMotoristaJornadaFormData, string>>>({});

  const [formData, setFormData] = useState<RelatorioMotoristaJornadaFormData>({
    clienteId: '',
    motoristaId: '',
    periodoRapido: 'esse-mes',
    dataInicio: '',
    horaInicio: '00:00',
    dataFim: '',
    horaFim: '23:59',
    horasDescanso: {
      cargaDescarga: true,
      intervalo: true,
      almocoJanta: true
    },
    tipoRelatorio: 'analitico',
    tipoPesquisa: 'motorista'
  });

  useEffect(() => {
    carregarClientes();
    definirPeriodoEsseMes();
  }, []);

  const definirPeriodoEsseMes = () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const formatarData = (data: Date) => {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    };

    setFormData(prev => ({
      ...prev,
      dataInicio: formatarData(primeiroDia),
      dataFim: formatarData(ultimoDia),
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

  const handlePeriodoRapido = (periodo: 'esse-mes' | 'mes-anterior' | 'dois-meses' | 'tres-meses') => {
    const hoje = new Date();
    let dataInicio = new Date();
    let dataFim = new Date();

    switch (periodo) {
      case 'esse-mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'mes-anterior':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        break;
      case 'dois-meses':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        break;
      case 'tres-meses':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
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
      horaInicio: '00:00',
      horaFim: '23:59'
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof RelatorioMotoristaJornadaFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCheckboxChange = (field: keyof RelatorioMotoristaJornadaFormData['horasDescanso']) => {
    setFormData(prev => ({
      ...prev,
      horasDescanso: {
        ...prev.horasDescanso,
        [field]: !prev.horasDescanso[field]
      }
    }));
  };

  const validarFormulario = (): boolean => {
    const novosErros: Partial<Record<keyof RelatorioMotoristaJornadaFormData, string>> = {};

    if (!formData.clienteId) {
      novosErros.clienteId = 'Cliente é obrigatório';
    }

    if (!formData.motoristaId) {
      novosErros.motoristaId = 'Motorista é obrigatório';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    console.log('Dados do relatório motorista/jornada:', formData);
    alert('Relatório Motorista/Jornada gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>RELATÓRIO • MOTO./JORNADA</h1>
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
                <label htmlFor="motoristaId">
                  Motorista<span className="required">*</span>
                </label>
                <select
                  id="motoristaId"
                  name="motoristaId"
                  value={formData.motoristaId}
                  onChange={handleChange}
                  className={`form-select ${errors.motoristaId ? 'error' : ''}`}
                >
                  <option value="">[Selecione o Motorista]</option>
                </select>
                {errors.motoristaId && (
                  <span className="error-message">{errors.motoristaId}</span>
                )}
              </div>
            </div>

            <div className="periodo-section">
              <label>Período</label>
              <div className="periodo-rapido-buttons">
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'esse-mes' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('esse-mes')}
                >
                  Esse mês
                </button>
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'mes-anterior' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('mes-anterior')}
                >
                  Mês Anterior
                </button>
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'dois-meses' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('dois-meses')}
                >
                  Dois Meses
                </button>
                <button
                  type="button"
                  className={`periodo-btn ${formData.periodoRapido === 'tres-meses' ? 'active' : ''}`}
                  onClick={() => handlePeriodoRapido('tres-meses')}
                >
                  Três Meses
                </button>
              </div>

              <div className="periodo-datas">
                <div className="form-group">
                  <label htmlFor="dataInicio">
                    Data Inicio<span className="required">*</span>
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
                    Hora Inicio<span className="required">*</span>
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

            {/* Horas de Descanso */}
            <div className="opcoes-movimento">
              <label>Horas de Descanso</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Campos marcados serão horas de descanso.
              </p>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.horasDescanso.cargaDescarga}
                    onChange={() => handleCheckboxChange('cargaDescarga')}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Carga/Descarga</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.horasDescanso.intervalo}
                    onChange={() => handleCheckboxChange('intervalo')}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Intervalo</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.horasDescanso.almocoJanta}
                    onChange={() => handleCheckboxChange('almocoJanta')}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Almoço/Janta</span>
                </label>
              </div>
            </div>

            {/* Tipo de relatório */}
            <div className="tipo-pesquisa">
              <label>Tipo de relatório</label>
              <div className="tipo-pesquisa-buttons">
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoRelatorio === 'analitico' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoRelatorio: 'analitico' }))}
                >
                  Analítico
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoRelatorio === 'resumido' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoRelatorio: 'resumido' }))}
                >
                  Resumido
                </button>
              </div>
            </div>

            {/* Tipo de Pesquisa */}
            <div className="tipo-pesquisa">
              <label>Tipo de Pesquisa</label>
              <div className="tipo-pesquisa-buttons">
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'motorista' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'motorista' }))}
                >
                  Motorista
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'veiculo' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'veiculo' }))}
                >
                  Veículo
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'viagem' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'viagem' }))}
                >
                  Viagem
                </button>
                <button
                  type="button"
                  className={`tipo-btn ${formData.tipoPesquisa === 'diario' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, tipoPesquisa: 'diario' }))}
                >
                  Diario
                </button>
              </div>
            </div>

            <div className="observacao">
              <p>
                <strong>OBS:</strong> todos os campos com (*) são obrigatórios para realizar uma pesquisa!
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-pesquisar">
                <Search size={20} />
                PESQUISAR
              </button>
            </div>
          </form>
        </div>

        <div className="descricao-relatorio">
          <div className="descricao-icon">
            <Search size={64} />
          </div>
          <h2>Relatório de Jornada do Motorista/Operador</h2>
          <p>
            Esse é o Relatório de Jornada e Motorista/Operador. Acima selecione o Cliente, o Período e se quiser um relatório mais detalhado faça os Filtros desejados, após clique no botão Pesquisar para gerar as informações.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioMotoristaJornada;
