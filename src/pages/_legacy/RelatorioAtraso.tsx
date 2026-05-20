import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { Search } from 'lucide-react';
import '../styles/dashboard-pages.css';
import '../styles/relatorios.css';

interface RelatorioAtrasoFormData {
  clienteId: string;
  tipo: string;
}

const RelatorioAtraso: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RelatorioAtrasoFormData, string>>>({});

  const [formData, setFormData] = useState<RelatorioAtrasoFormData>({
    clienteId: '',
    tipo: 'todos'
  });

  useEffect(() => {
    carregarClientes();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof RelatorioAtrasoFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Partial<Record<keyof RelatorioAtrasoFormData, string>> = {};

    if (!formData.clienteId) {
      novosErros.clienteId = 'Cliente é obrigatório';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    console.log('Dados do relatório atraso:', formData);
    alert('Relatório Atraso gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>RELATÓRIO • ATRASO</h1>
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
                  <option value="">[Todos os clientes]</option>
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
                <label htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="todos">Todos</option>
                </select>
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
          <h2>Relatório de Veículo - Todos</h2>
          <p>
            Esse é o Relatório de Atraso. Acima selecione o Cliente e o Tipo, após clique no botão Pesquisar para gerar as informações.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioAtraso;
