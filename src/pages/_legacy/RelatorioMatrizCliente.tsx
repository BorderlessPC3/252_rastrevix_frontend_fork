import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { Search, Users } from 'lucide-react';
import '../styles/dashboard-pages.css';
import '../styles/relatorios.css';

interface RelatorioMatrizClienteFormData {
  matrizId: string;
  clienteId: string;
}

const RelatorioMatrizCliente: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [matrizes] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RelatorioMatrizClienteFormData, string>>>({});

  const [formData, setFormData] = useState<RelatorioMatrizClienteFormData>({
    matrizId: '',
    clienteId: ''
  });

  useEffect(() => {
    carregarClientes();
    // TODO: Carregar matrizes/grupos quando a API estiver disponível
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

    if (errors[name as keyof RelatorioMatrizClienteFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Partial<Record<keyof RelatorioMatrizClienteFormData, string>> = {};

    if (!formData.matrizId) {
      novosErros.matrizId = 'Matriz é obrigatória';
    }

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

    console.log('Dados do relatório matriz/cliente:', formData);
    alert('Relatório Matriz/Cliente gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>RELATÓRIO • MATRIZ - CLIENTE</h1>
      </div>

      <div className="relatorio-content">
        <div className="filtros-section">
          <h2 className="filtros-title">Filtros</h2>

          <form onSubmit={handleSubmit} className="relatorio-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="matrizId">
                  Matriz<span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <Users className="input-icon" size={18} />
                  <select
                    id="matrizId"
                    name="matrizId"
                    value={formData.matrizId}
                    onChange={handleChange}
                    className={`form-select ${errors.matrizId ? 'error' : ''}`}
                  >
                    <option value="">[ Selecione o Matriz/Grupo ]</option>
                    {matrizes.map(matriz => (
                      <option key={matriz.id} value={matriz.id}>
                        {matriz.nome}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.matrizId && (
                  <span className="error-message">{errors.matrizId}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="clienteId">
                  Cliente<span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <Users className="input-icon" size={18} />
                  <select
                    id="clienteId"
                    name="clienteId"
                    value={formData.clienteId}
                    onChange={handleChange}
                    className={`form-select ${errors.clienteId ? 'error' : ''}`}
                  >
                    <option value="">[ Selecione o Cliente ]</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.empresa}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.clienteId && (
                  <span className="error-message">{errors.clienteId}</span>
                )}
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
          <h2>Relatório de Matriz/Grupo e Clientes</h2>
          <p>
            Esse é o o Relatório de Matrizes e suas filiais. Acima selecione o Cliente e o Período, após clique no botão Pesquisar para gerar as informações.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioMatrizCliente;
