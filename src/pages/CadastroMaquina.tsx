"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { maquinaService } from "../services/maquinaService"
import { rastreadorService } from "../services/rastreadorService"
import type { Rastreador } from "../types"
import { clienteService, type Cliente } from "../services/clienteService"
import ImportExportButtons from "../components/ImportExportButtons"
import { showSuccess, showError } from "../utils/toast"
import "../styles/dashboard-pages.css"
import "../styles/import-export.css"

interface Maquina {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'torno' | 'fresa' | 'soldadora' | 'prensa' | 'cnc' | 'outras';
  status: 'ativa' | 'inativa' | 'manutencao' | 'calibracao';
  fabricante?: string;
  modelo?: string;
  numeroSerie?: string;
  placa?: string;
  grupo?: string;
  equipamento?: string;
  equipamentoNumero?: string;
  dataInstalacaoEquipamento?: string;
  clienteId?: string;
  rastreadorId?: string;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

interface MaquinaFormData {
  codigo: string;
  nome: string;
  tipo: 'torno' | 'fresa' | 'soldadora' | 'prensa' | 'cnc' | 'outras';
  status: 'ativa' | 'inativa' | 'manutencao' | 'calibracao';
  fabricante: string;
  modelo: string;
  placa: string;
  grupo: string;
  equipamento: string;
  equipamentoNumero: string;
  clienteId: string;
  rastreadorId: string;
}

const CadastroMaquina: React.FC = () => {

  // Estados
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [maquinas, setMaquinas] = useState<Maquina[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaVeiculo, setBuscaVeiculo] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingVeiculos, setLoadingVeiculos] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [maquinaSelecionada, setMaquinaSelecionada] = useState<Maquina | null>(null)
  const [rastreadores, setRastreadores] = useState<Rastreador[]>([])
  const [formData, setFormData] = useState<MaquinaFormData>({
    codigo: '',
    nome: '',
    tipo: 'outras',
    status: 'ativa',
    fabricante: '',
    modelo: '',
    placa: '',
    grupo: '',
    equipamento: '',
    equipamentoNumero: '',
    clienteId: '',
    rastreadorId: ''
  })

  const carregarRastreadores = async () => {
    try {
      const res = await rastreadorService.listarRastreadores({ limit: 500, status: 'ativo' })
      setRastreadores(res.data.rastreadores)
    } catch {
      setRastreadores([])
    }
  }

  // Carregar clientes
  const carregarClientes = async () => {
    try {
      setLoading(true)
      const response = await clienteService.listarClientes({
        limit: 1000
      })
      setClientes(response.data.clientes)
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
      showError('Erro ao carregar clientes. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  // Carregar veículos do cliente selecionado
  const carregarVeiculos = async (clienteId: string) => {
    try {
      setLoadingVeiculos(true)
      const response = await maquinaService.listarMaquinas({
        limit: 1000,
        clienteId: clienteId
      })
      setMaquinas(response.data.maquinas)
    } catch (err) {
      console.error('Erro ao carregar veículos:', err)
      showError('Erro ao carregar veículos. Verifique sua conexão.')
    } finally {
      setLoadingVeiculos(false)
    }
  }

  useEffect(() => {
    carregarClientes()
    carregarRastreadores()
  }, [])

  // Quando um cliente é selecionado, carregar seus veículos
  useEffect(() => {
    if (clienteSelecionado) {
      carregarVeiculos(clienteSelecionado.id)
    } else {
      setMaquinas([])
    }
  }, [clienteSelecionado])

  // Filtrar clientes por busca
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    cliente.empresa.toLowerCase().includes(buscaCliente.toLowerCase())
  )

  // Filtrar veículos por busca
  const veiculosFiltrados = maquinas.filter(maquina =>
    maquina.placa?.toLowerCase().includes(buscaVeiculo.toLowerCase()) ||
    maquina.nome.toLowerCase().includes(buscaVeiculo.toLowerCase()) ||
    maquina.modelo?.toLowerCase().includes(buscaVeiculo.toLowerCase())
  )

  // Abreviar nome do cliente
  const abreviarNome = (nome: string): string => {
    const palavras = nome.split(' ')
    if (palavras.length <= 2) return nome
    return palavras.slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dadosParaEnvio: any = {
        codigo: formData.codigo,
        nome: formData.nome,
        tipo: formData.tipo,
        status: formData.status,
        fabricante: formData.fabricante || undefined,
        modelo: formData.modelo || undefined,
        placa: formData.placa || undefined,
        grupo: formData.grupo || undefined,
        equipamento: formData.equipamento || undefined,
        equipamentoNumero: formData.equipamentoNumero || undefined,
        clienteId: formData.clienteId || undefined,
        rastreadorId: formData.rastreadorId || undefined
      }

      if (maquinaSelecionada) {
        // Atualizar
        await maquinaService.atualizarMaquina({
          id: maquinaSelecionada.id,
          ...dadosParaEnvio
        })
        showSuccess(`Veículo ${formData.nome || formData.placa} atualizado com sucesso!`)
        setIsEditarModalOpen(false)
      } else {
        // Criar
        await maquinaService.criarMaquina(dadosParaEnvio)
        showSuccess(`Veículo ${formData.nome || formData.placa} cadastrado com sucesso!`)
        setIsModalOpen(false)
      }

      // Limpar formulário
      setFormData({
        codigo: '',
        nome: '',
        tipo: 'outras',
        status: 'ativa',
        fabricante: '',
        modelo: '',
        placa: '',
        grupo: '',
        equipamento: '',
        equipamentoNumero: '',
        clienteId: clienteSelecionado?.id || '',
        rastreadorId: ''
      })
      setMaquinaSelecionada(null)

      // Recarregar veículos
      if (clienteSelecionado) {
        await carregarVeiculos(clienteSelecionado.id)
      }
    } catch (err) {
      console.error('Erro ao salvar veículo:', err)
      showError(err instanceof Error ? err.message : 'Erro ao cadastrar veículo. Tente novamente.')
    }
  }

  const handleEditar = (maquina: Maquina) => {
    setMaquinaSelecionada(maquina)
    setFormData({
      codigo: maquina.codigo,
      nome: maquina.nome,
      tipo: maquina.tipo,
      status: maquina.status,
      fabricante: maquina.fabricante || '',
      modelo: maquina.modelo || '',
      placa: maquina.placa || '',
      grupo: maquina.grupo || '',
      equipamento: maquina.equipamento || '',
      equipamentoNumero: maquina.equipamentoNumero || '',
      clienteId: maquina.clienteId || clienteSelecionado?.id || '',
      rastreadorId: maquina.rastreadorId || ''
    })
    setIsEditarModalOpen(true)
  }

  const handleExcluir = async (maquina: Maquina) => {
    if (window.confirm(`Tem certeza que deseja excluir o veículo ${maquina.nome || maquina.placa}?`)) {
      try {
        await maquinaService.deletarMaquina(maquina.id)
        showSuccess(`Veículo ${maquina.nome || maquina.placa} excluído com sucesso!`)
        if (clienteSelecionado) {
          await carregarVeiculos(clienteSelecionado.id)
        }
      } catch (err) {
        console.error('Erro ao excluir veículo:', err)
        showError('Erro ao excluir veículo. Tente novamente.')
      }
    }
  }

  const formatarData = (data?: string) => {
    if (!data) return '--'
    try {
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR')
    } catch {
      return '--'
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>CADASTRO • MÁQUINA/VEÍCULO</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {clienteSelecionado && veiculosFiltrados.length > 0 && (
            <ImportExportButtons
              data={veiculosFiltrados}
              filename={`maquinas-${clienteSelecionado.nome}`}
              title={`Máquinas/Veículos - ${clienteSelecionado.nome}`}
              columns={[
                { key: 'placa', label: 'Placa' },
                { key: 'codigo', label: 'Código' },
                { key: 'nome', label: 'Nome' },
                { key: 'grupo', label: 'Grupo' },
                { key: 'fabricante', label: 'Marca' },
                { key: 'modelo', label: 'Modelo' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'status', label: 'Status' }
              ]}
              importEnabled={false}
            />
          )}
          {clienteSelecionado && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setMaquinaSelecionada(null)
                setFormData({
                  codigo: '',
                  nome: '',
                  tipo: 'outras',
                  status: 'ativa',
                  fabricante: '',
                  modelo: '',
                  placa: '',
                  grupo: '',
                  equipamento: '',
                  equipamentoNumero: '',
                  clienteId: clienteSelecionado.id,
                  rastreadorId: ''
                })
                setIsModalOpen(true)
              }}
            >
              + NOVO
            </button>
          )}
        </div>
      </div>

      <div className="maquina-veiculo-container">
        {/* Coluna Esquerda - Lista de Clientes */}
        <div className="clientes-column">
          <div className="search-box">
            <input
              type="text"
              placeholder="Procurar Cliente"
              value={buscaCliente}
              onChange={(e) => setBuscaCliente(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="clientes-list">
            {loading ? (
              <div className="loading">Carregando clientes...</div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="empty-state">Nenhum cliente encontrado</div>
            ) : (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className={`cliente-item ${clienteSelecionado?.id === cliente.id ? 'selected' : ''}`}
                  onClick={() => setClienteSelecionado(cliente)}
                >
                  <div className="cliente-nome">{cliente.nome}</div>
                  <div className="cliente-abrev">ABREV. NOME {abreviarNome(cliente.nome)}</div>
                  {cliente.status === 'inativo' && (
                    <span className="cliente-bloqueado">[Bloqueado]</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita - Lista de Veículos */}
        <div className="veiculos-column">
          {!clienteSelecionado ? (
            <div className="empty-state-large">
              <h2>Máquina/Veículo</h2>
              <p>
                Esta é a sua lista de máquina/veículo. Clique no nome do cliente desejado à esquerda para ver e alterar informações ou adicionar um novo registro.
              </p>
              <div className="illustration">🚗</div>
            </div>
          ) : (
            <>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Procurar Veículo"
                  value={buscaVeiculo}
                  onChange={(e) => setBuscaVeiculo(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>

              {loadingVeiculos ? (
                <div className="loading">Carregando veículos...</div>
              ) : veiculosFiltrados.length === 0 ? (
                <div className="empty-state">
                  Nenhum veículo encontrado para {clienteSelecionado.nome}. Clique em "+ NOVO" para adicionar.
                </div>
              ) : (
                <div className="veiculos-table-container">
                  <table className="veiculos-table">
                    <thead>
                      <tr>
                        <th>PLACA</th>
                        <th>GRUPO</th>
                        <th>MARCA</th>
                        <th>MODELO</th>
                        <th>EQUIP.</th>
                        <th>EQUIP. Nº</th>
                        <th>DT. INSTAL</th>
                        <th>AÇÕES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veiculosFiltrados.map((maquina) => (
                        <tr key={maquina.id}>
                          <td>{maquina.placa || '--'}</td>
                          <td>{maquina.grupo || '--'}</td>
                          <td>{maquina.fabricante || '--'}</td>
                          <td>{maquina.modelo || '--'}</td>
                          <td>{maquina.equipamento || '--'}</td>
                          <td>{maquina.equipamentoNumero || '--'}</td>
                          <td>{formatarData(maquina.dataInstalacaoEquipamento)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon"
                                onClick={() => handleEditar(maquina)}
                                title="Editar"
                              >
                                {maquina.tipo === 'outras' ? '🚗' : '🚛'}
                              </button>
                              <button
                                className="btn-icon btn-danger"
                                onClick={() => handleExcluir(maquina)}
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && clienteSelecionado && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Veículo</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="veiculo-form">
                {/* Seção: Informações Básicas */}
                <div className="form-section">
                  <h3 className="form-section-title">Informações Básicas</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="placa">Placa *</label>
                      <input
                        type="text"
                        id="placa"
                        name="placa"
                        value={formData.placa}
                        onChange={handleChange}
                        required
                        placeholder="Ex: ABC-1234"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="rastreadorId">Rastreador GPS</label>
                      <select
                        id="rastreadorId"
                        name="rastreadorId"
                        value={formData.rastreadorId}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Nenhum</option>
                        {rastreadores.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.placa || r.nome || r.numeroSerial}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="codigo">Código *</label>
                      <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        required
                        placeholder="Código único"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nome">Nome *</label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        placeholder="Nome do veículo"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="grupo">Grupo</label>
                      <input
                        type="text"
                        id="grupo"
                        name="grupo"
                        value={formData.grupo}
                        onChange={handleChange}
                        placeholder="Ex: Ônibus, Caminhão"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Veículo */}
                <div className="form-section">
                  <h3 className="form-section-title">Dados do Veículo</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="fabricante">Marca</label>
                      <input
                        type="text"
                        id="fabricante"
                        name="fabricante"
                        value={formData.fabricante}
                        onChange={handleChange}
                        placeholder="Ex: Mercedes, Volvo"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="modelo">Modelo</label>
                      <input
                        type="text"
                        id="modelo"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        placeholder="Ex: Sprinter, FH"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Equipamento de Rastreamento */}
                <div className="form-section">
                  <h3 className="form-section-title">Equipamento de Rastreamento</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="equipamento">Equipamento</label>
                      <input
                        type="text"
                        id="equipamento"
                        name="equipamento"
                        value={formData.equipamento}
                        onChange={handleChange}
                        placeholder="Ex: ST340"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="equipamentoNumero">Nº Equipamento</label>
                      <input
                        type="text"
                        id="equipamentoNumero"
                        name="equipamentoNumero"
                        value={formData.equipamentoNumero}
                        onChange={handleChange}
                        placeholder="Ex: 807394967"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Status e Configurações */}
                <div className="form-section">
                  <h3 className="form-section-title">Status e Configurações</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="tipo">Tipo</label>
                      <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="outras">Outras</option>
                        <option value="torno">Torno</option>
                        <option value="fresa">Fresa</option>
                        <option value="soldadora">Soldadora</option>
                        <option value="prensa">Prensa</option>
                        <option value="cnc">CNC</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="ativa">Ativa</option>
                        <option value="inativa">Inativa</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="calibracao">Calibração</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Cadastrar Veículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditarModalOpen && maquinaSelecionada && (
        <div className="modal-overlay" onClick={() => setIsEditarModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Veículo</h2>
              <button className="modal-close" onClick={() => setIsEditarModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="veiculo-form">
                {/* Seção: Informações Básicas */}
                <div className="form-section">
                  <h3 className="form-section-title">Informações Básicas</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="placa">Placa *</label>
                      <input
                        type="text"
                        id="placa"
                        name="placa"
                        value={formData.placa}
                        onChange={handleChange}
                        required
                        placeholder="Ex: ABC-1234"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="rastreadorId">Rastreador GPS</label>
                      <select
                        id="rastreadorId"
                        name="rastreadorId"
                        value={formData.rastreadorId}
                        onChange={handleChange}
                        className="form-input"
                      >
                        <option value="">Nenhum</option>
                        {rastreadores.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.placa || r.nome || r.numeroSerial}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="codigo">Código *</label>
                      <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        required
                        placeholder="Código único"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nome">Nome *</label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        placeholder="Nome do veículo"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="grupo">Grupo</label>
                      <input
                        type="text"
                        id="grupo"
                        name="grupo"
                        value={formData.grupo}
                        onChange={handleChange}
                        placeholder="Ex: Ônibus, Caminhão"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Dados do Veículo */}
                <div className="form-section">
                  <h3 className="form-section-title">Dados do Veículo</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="fabricante">Marca</label>
                      <input
                        type="text"
                        id="fabricante"
                        name="fabricante"
                        value={formData.fabricante}
                        onChange={handleChange}
                        placeholder="Ex: Mercedes, Volvo"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="modelo">Modelo</label>
                      <input
                        type="text"
                        id="modelo"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        placeholder="Ex: Sprinter, FH"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Equipamento de Rastreamento */}
                <div className="form-section">
                  <h3 className="form-section-title">Equipamento de Rastreamento</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="equipamento">Equipamento</label>
                      <input
                        type="text"
                        id="equipamento"
                        name="equipamento"
                        value={formData.equipamento}
                        onChange={handleChange}
                        placeholder="Ex: ST340"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="equipamentoNumero">Nº Equipamento</label>
                      <input
                        type="text"
                        id="equipamentoNumero"
                        name="equipamentoNumero"
                        value={formData.equipamentoNumero}
                        onChange={handleChange}
                        placeholder="Ex: 807394967"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção: Status e Configurações */}
                <div className="form-section">
                  <h3 className="form-section-title">Status e Configurações</h3>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label htmlFor="tipo">Tipo</label>
                      <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="outras">Outras</option>
                        <option value="torno">Torno</option>
                        <option value="fresa">Fresa</option>
                        <option value="soldadora">Soldadora</option>
                        <option value="prensa">Prensa</option>
                        <option value="cnc">CNC</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="ativa">Ativa</option>
                        <option value="inativa">Inativa</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="calibracao">Calibração</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setIsEditarModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Atualizar Veículo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CadastroMaquina
