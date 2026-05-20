import React, { useState, useEffect } from 'react';
import { clienteService, type Cliente } from '../services/clienteService';
import { Search, Route } from 'lucide-react';
import '../styles/dashboard-pages.css';
import '../styles/relatorios.css';

const PerimetrosRota: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    if (busca.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
        cliente.empresa.toLowerCase().includes(busca.toLowerCase())
      );
      setClientesFiltrados(filtrados);
    }
  }, [busca, clientes]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const response = await clienteService.listarClientes({ limit: 1000 });
      setClientes(response.data.clientes);
      setClientesFiltrados(response.data.clientes);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteClick = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <h1>PERÍMETROS ROTA</h1>
      </div>

      <div className="perimetros-content">
        <div className="perimetros-clientes-column">
          <div className="search-box">
            <div className="input-with-icon">
              <Search className="input-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Procurar Cliente"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="clientes-list">
            {loading ? (
              <div className="loading-state">Carregando clientes...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="no-results">Nenhum cliente encontrado</div>
            ) : (
              clientesFiltrados.map(cliente => (
                <div
                  key={cliente.id}
                  className={`cliente-item ${clienteSelecionado?.id === cliente.id ? 'selected' : ''}`}
                  onClick={() => handleClienteClick(cliente)}
                >
                  <div className="cliente-nome">{cliente.nome}</div>
                  <div className="cliente-abrev">ABREV. NOME: {cliente.empresa || cliente.nome}</div>
                  {cliente.status === 'inativo' && (
                    <div className="cliente-bloqueado">[Bloqueado]</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="perimetros-info-column">
          <div className="perimetros-info-section">
            <h2>Rotas</h2>
            <p>
              Esta é a sua lista de rotas. Clique no nome desejado à esquerda para ver e alterar informações, ou clique no botão acima para adicionar uma novo.
            </p>
            <div className="perimetros-icon">
              <Route size={120} color="#ef4444" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerimetrosRota;
