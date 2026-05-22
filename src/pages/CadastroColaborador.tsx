"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Pencil, Trash2 } from "lucide-react"
import ColaboradorModal from "../components/ColaboradorModal"
import ColaboradorDetalhesModal from "../components/ColaboradorDetalhesModal"
import ColaboradorEditarModal from "../components/ColaboradorEditarModal"
import ConfirmModal from "../components/ConfirmModal"
import ImportExportButtons from "../components/ImportExportButtons"
import PageFeedback from "../components/PageFeedback"
import { useAuth } from "../contexts/AuthContext"
import { canManageCadastros } from "../utils/rbac"
import { colaboradorService } from "../services/colaboradorService"
import { clienteService } from "../services/clienteService"
import { showSuccess, showError, showWarning } from "../utils/toast"
import "../styles/colaboradores.css"
import "../styles/dashboard-pages.css"
import "../styles/import-export.css"

// Interfaces locais
interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
  status: 'ativo' | 'inativo' | 'treinamento';
  salario?: number;
  dataContratacao: string;
  dataDemissao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  observacoes?: string;
  supervisorId?: string;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  status: 'ativo' | 'inativo' | 'pendente';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cnpj?: string;
  observacoes?: string;
  contatoResponsavel?: string;
  telefoneResponsavel?: string;
  dataCadastro: string;
  ultimaAtualizacao: string;
}

interface ColaboradorFormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
  salario: string;
  status: 'ativo' | 'inativo' | 'treinamento';
  dataContratacao: string;
  dataDemissao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  observacoes?: string;
  supervisorId?: string;
}

interface ColaboradorCreateData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
  status?: 'ativo' | 'inativo' | 'treinamento';
  salario?: number;
  dataContratacao: string;
  dataDemissao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  observacoes?: string;
  supervisorId?: string;
}

const CadastroColaborador: React.FC = () => {
  const { user } = useAuth()
  const canManage = canManageCadastros(user?.role)
  // Estados para clientes
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [searchCliente, setSearchCliente] = useState("")
  const [loadingClientes, setLoadingClientes] = useState(true)

  // Estados para colaboradores
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [searchColaborador, setSearchColaborador] = useState("")
  const [loadingColaboradores, setLoadingColaboradores] = useState(false)

  // Estados para modais
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<Colaborador | null>(null)
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState<Colaborador | null>(null)

  // Carregar clientes
  const carregarClientes = async () => {
    try {
      setLoadingClientes(true)
      const response = await clienteService.listarClientes({
        search: searchCliente || undefined,
        limit: 100
      })
      setClientes(response.data.clientes)
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
      showError('Erro ao carregar clientes. Verifique sua conexão.')
    } finally {
      setLoadingClientes(false)
    }
  }

  // Carregar colaboradores do cliente selecionado
  const carregarColaboradores = async () => {
    if (!clienteSelecionado) {
      setColaboradores([])
      return
    }

    try {
      setLoadingColaboradores(true)

      // Carregar colaboradores do cliente
      const response = await colaboradorService.listarColaboradoresDoCliente(clienteSelecionado.id)
      setColaboradores(response.data.colaboradores || [])
    } catch (err) {
      console.error('Erro ao carregar colaboradores:', err)
      showError('Erro ao carregar colaboradores. Verifique sua conexão.')
    } finally {
      setLoadingColaboradores(false)
    }
  }

  // Carregar dados quando o componente monta
  useEffect(() => {
    carregarClientes()
  }, [])

  // Recarregar clientes quando busca muda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarClientes()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchCliente])

  // Carregar colaboradores quando cliente é selecionado
  useEffect(() => {
    carregarColaboradores()
  }, [clienteSelecionado])

  // Filtrar clientes localmente
  const clientesFiltrados = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(searchCliente.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchCliente.toLowerCase())
    return matchesSearch
  })

  // Filtrar colaboradores localmente
  const colaboradoresFiltrados = colaboradores.filter(colaborador => {
    const matchesSearch = colaborador.nome.toLowerCase().includes(searchColaborador.toLowerCase()) ||
      colaborador.cargo.toLowerCase().includes(searchColaborador.toLowerCase()) ||
      colaborador.departamento.toLowerCase().includes(searchColaborador.toLowerCase())
    return matchesSearch
  })

  // Remover colaborador do cliente (excluir relacionamento)
  const handleRemoverColaborador = async (colaborador: Colaborador) => {
    if (!clienteSelecionado) return

    try {
      await colaboradorService.removerColaboradorDoCliente(clienteSelecionado.id, colaborador.id)
      showSuccess(`Colaborador ${colaborador.nome} removido do cliente ${clienteSelecionado.nome} com sucesso!`)
      await carregarColaboradores()
    } catch (err) {
      console.error('Erro ao remover colaborador:', err)
      showError('Erro ao remover colaborador. Tente novamente.')
    }
  }

  // Funções de CRUD de colaboradores
  const handleSaveColaborador = async (novoColaborador: ColaboradorFormData) => {
    if (!clienteSelecionado) {
      showWarning('Por favor, selecione um cliente antes de cadastrar um colaborador.')
      return
    }

    try {
      const dadosParaEnvio: ColaboradorCreateData & { clienteId?: string } = {
        nome: novoColaborador.nome,
        email: novoColaborador.email,
        telefone: novoColaborador.telefone,
        cargo: novoColaborador.cargo,
        departamento: novoColaborador.departamento,
        status: novoColaborador.status || 'treinamento',
        salario: novoColaborador.salario ? Number(novoColaborador.salario.toString().replace(/[^\d,.-]/g, '').replace(',', '.')) : undefined,
        dataContratacao: novoColaborador.dataContratacao,
        dataDemissao: novoColaborador.dataDemissao,
        endereco: novoColaborador.endereco,
        cidade: novoColaborador.cidade,
        estado: novoColaborador.estado,
        cep: novoColaborador.cep,
        cpf: novoColaborador.cpf,
        rg: novoColaborador.rg,
        dataNascimento: novoColaborador.dataNascimento,
        observacoes: novoColaborador.observacoes,
        supervisorId: novoColaborador.supervisorId,
        clienteId: clienteSelecionado.id // Incluir clienteId para atribuição automática
      }

      await colaboradorService.criarColaborador(dadosParaEnvio)
      showSuccess(`Colaborador ${novoColaborador.nome} cadastrado e atribuído ao cliente ${clienteSelecionado.nome} com sucesso!`)
      setIsModalOpen(false)

      // Recarregar colaboradores
      await carregarColaboradores()
    } catch (err) {
      console.error('Erro ao salvar colaborador:', err)
      showError('Erro ao cadastrar colaborador. Tente novamente.')
    }
  }

  const handleEditarColaborador = (colaborador: Colaborador) => {
    setColaboradorSelecionado(colaborador)
    setIsEditarModalOpen(true)
  }

  const handleSalvarEdicao = async (colaboradorAtualizado: Colaborador) => {
    try {
      const dadosParaEnvio = {
        id: colaboradorAtualizado.id,
        nome: colaboradorAtualizado.nome,
        email: colaboradorAtualizado.email,
        telefone: colaboradorAtualizado.telefone,
        cargo: colaboradorAtualizado.cargo,
        departamento: colaboradorAtualizado.departamento,
        status: colaboradorAtualizado.status,
        salario: colaboradorAtualizado.salario || undefined,
        dataContratacao: colaboradorAtualizado.dataContratacao,
        dataDemissao: colaboradorAtualizado.dataDemissao || undefined,
        endereco: colaboradorAtualizado.endereco || undefined,
        cidade: colaboradorAtualizado.cidade || undefined,
        estado: colaboradorAtualizado.estado || undefined,
        cep: colaboradorAtualizado.cep || undefined,
        cpf: colaboradorAtualizado.cpf || undefined,
        rg: colaboradorAtualizado.rg || undefined,
        dataNascimento: colaboradorAtualizado.dataNascimento || undefined,
        observacoes: colaboradorAtualizado.observacoes || undefined,
        supervisorId: colaboradorAtualizado.supervisorId || undefined
      }

      await colaboradorService.atualizarColaborador(dadosParaEnvio)
      showSuccess(`Colaborador ${colaboradorAtualizado.nome} atualizado com sucesso!`)
      setIsEditarModalOpen(false)

      // Recarregar colaboradores se houver cliente selecionado
      if (clienteSelecionado) {
        await carregarColaboradores()
      }
    } catch (err) {
      console.error('Erro ao atualizar colaborador:', err)
      showError('Erro ao atualizar colaborador. Tente novamente.')
    }
  }

  const confirmarExclusao = async () => {
    if (!colaboradorParaExcluir || !clienteSelecionado) return

    try {
      // Remover colaborador do cliente (não deletar o colaborador, apenas o relacionamento)
      await colaboradorService.removerColaboradorDoCliente(clienteSelecionado.id, colaboradorParaExcluir.id)
      showSuccess(`Colaborador ${colaboradorParaExcluir.nome} removido do cliente ${clienteSelecionado.nome} com sucesso!`)
      setColaboradorParaExcluir(null)

      // Recarregar colaboradores
      await carregarColaboradores()
    } catch (err) {
      console.error('Erro ao remover colaborador:', err)
      if (err instanceof Error && err.message.includes('não encontrado')) {
        showWarning('Este colaborador já foi removido ou não existe mais.')
        await carregarColaboradores()
      } else {
        showError('Erro ao remover colaborador. Tente novamente.')
      }
      setColaboradorParaExcluir(null)
    }
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>CADASTRO • COLABORADOR</h2>
            <p>Selecione um cliente para gerenciar seus colaboradores</p>
          </div>
          {clienteSelecionado && colaboradoresFiltrados.length > 0 && (
            <ImportExportButtons
              data={colaboradoresFiltrados}
              filename={`colaboradores-${clienteSelecionado.nome}`}
              title={`Colaboradores - ${clienteSelecionado.nome}`}
              columns={[
                { key: 'nome', label: 'Nome' },
                { key: 'email', label: 'Email' },
                { key: 'telefone', label: 'Telefone' },
                { key: 'cargo', label: 'Cargo' },
                { key: 'departamento', label: 'Departamento' },
                { key: 'status', label: 'Status' }
              ]}
              importEnabled={false}
            />
          )}
        </div>
      </div>

      {/* Layout de dois painéis */}
      <div className="colaborador-two-panel-layout">
        {/* Painel Esquerdo - Lista de Clientes */}
        <div className="colaborador-left-panel">
          <div className="panel-header">
            <h3>Procurar Cliente</h3>
          </div>
          <div className="panel-search">
            <input
              type="text"
              placeholder="Procurar Cliente"
              value={searchCliente}
              onChange={(e) => setSearchCliente(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="panel-list">
            {loadingClientes ? (
              <PageFeedback loading loadingMessage="Carregando clientes…" />
            ) : clientesFiltrados.length === 0 ? (
              <div className="no-results">
                <p>Nenhum cliente encontrado.</p>
              </div>
            ) : (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className={`cliente-list-item ${clienteSelecionado?.id === cliente.id ? 'selected' : ''}`}
                  onClick={() => setClienteSelecionado(cliente)}
                >
                  <div className="cliente-list-item-content">
                    <div className="cliente-list-item-name">{cliente.nome}</div>
                    <div className="cliente-list-item-abbr">{cliente.empresa.substring(0, 2).toUpperCase()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel Direito - Lista de Colaboradores */}
        <div className="colaborador-right-panel">
          <div className="panel-header">
            <h3>Procurar Colaborador</h3>
            {canManage && (
              <div className="panel-header-actions">
                <button
                  className="btn-icon"
                  onClick={() => {
                    if (!clienteSelecionado) {
                      showWarning('Por favor, selecione um cliente antes de cadastrar um colaborador.')
                      return
                    }
                    setIsModalOpen(true)
                  }}
                  title="Novo Colaborador"
                  disabled={!clienteSelecionado}
                >
                  ➕
                </button>
              </div>
            )}
          </div>
          <div className="panel-search">
            <input
              type="text"
              placeholder="Procurar Colaborador"
              value={searchColaborador}
              onChange={(e) => setSearchColaborador(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="panel-list">
            {!clienteSelecionado ? (
              <div className="no-results">
                <p>Selecione um cliente para visualizar seus colaboradores</p>
              </div>
            ) : loadingColaboradores ? (
              <PageFeedback loading loadingMessage="Carregando colaboradores…" />
            ) : (
              <>
                {/* Lista de Colaboradores do Cliente */}
                {colaboradoresFiltrados.length > 0 ? (
                  <div className="colaboradores-section">
                    <h4 className="section-title">Colaboradores ({colaboradoresFiltrados.length})</h4>
                    {colaboradoresFiltrados.map((colaborador, index) => (
                      <div key={colaborador.id} className="colaborador-list-item">
                        <div className="colaborador-list-item-number">{index + 1}</div>
                        <div className="colaborador-list-item-info">
                          <div className="colaborador-list-item-name">{colaborador.nome}</div>
                          <div className="colaborador-list-item-details">
                            <span>Colab. Tipo: {colaborador.cargo}</span>
                            <span>Periférico: {colaborador.id.substring(0, 7)}</span>
                          </div>
                        </div>
                        {canManage && (
                          <div className="colaborador-list-item-actions">
                            <button
                              className="btn-icon"
                              onClick={() => handleEditarColaborador(colaborador)}
                              title="Editar colaborador"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              className="btn-icon-danger"
                              onClick={() => handleRemoverColaborador(colaborador)}
                              title="Remover colaborador"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>Nenhum colaborador cadastrado para este cliente.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <ColaboradorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveColaborador}
      />

      <ColaboradorDetalhesModal
        isOpen={isDetalhesModalOpen}
        onClose={() => setIsDetalhesModalOpen(false)}
        colaborador={colaboradorSelecionado}
      />

      <ColaboradorEditarModal
        isOpen={isEditarModalOpen}
        onClose={() => setIsEditarModalOpen(false)}
        colaborador={colaboradorSelecionado}
        onSave={handleSalvarEdicao}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setColaboradorParaExcluir(null)
        }}
        onConfirm={confirmarExclusao}
        title="Confirmar Remoção"
        message={`Tem certeza que deseja remover o colaborador "${colaboradorParaExcluir?.nome}" do cliente "${clienteSelecionado?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Confirmar Remoção"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}

export default CadastroColaborador
