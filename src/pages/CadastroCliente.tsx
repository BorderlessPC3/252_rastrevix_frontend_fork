"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ClienteModal from "../components/ClienteModal"
import ClienteDetalhesModal from "../components/ClienteDetalhesModal"
import ClienteEditarModal from "../components/ClienteEditarModal"
import ConfirmModal from "../components/ConfirmModal"
import ImportExportButtons from "../components/ImportExportButtons"
import { useAuth } from "../contexts/AuthContext"
import { clienteService } from "../services/clienteService"
import { showSuccess, showError, showWarning } from "../utils/toast"
import "../styles/dashboard-pages.css"
import "../styles/import-export.css"

// Interfaces locais para evitar problemas de importação
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

interface ClienteCreateData {
  nome: string;
  email: string;
  telefone?: string;
  empresa: string;
  status?: 'ativo' | 'inativo' | 'pendente';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cnpj?: string;
  observacoes?: string;
  contatoResponsavel?: string;
  telefoneResponsavel?: string;
}

const CadastroCliente: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const userName = user?.name || "Usuário"
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isExcluirTodosModalOpen, setIsExcluirTodosModalOpen] = useState(false)
  const [confirmacaoTexto, setConfirmacaoTexto] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(null)

  // Estados para dados reais
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    pendentes: 0
  })

  // Carregar dados dos clientes
  const carregarClientes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await clienteService.listarClientes({
        search: searchTerm || undefined,
        status: statusFilter !== "todos" ? statusFilter : undefined,
        limit: 100 // Carregar mais clientes para demonstração
      })

      setClientes(response.data.clientes)
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
      setError('Erro ao carregar clientes. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  const carregarEstatisticas = async () => {
    try {
      const response = await clienteService.obterEstatisticas()
      setStats(response.data)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  // Carregar dados quando o componente monta
  useEffect(() => {
    carregarClientes()
    carregarEstatisticas()
  }, [])

  // Recarregar quando filtros mudam
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarClientes()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  // Filtrar clientes localmente (já vem filtrado da API, mas mantemos para consistência)
  const clientesFiltrados = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || cliente.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'status-ativo'
      case 'inativo':
        return 'status-inativo'
      case 'pendente':
        return 'status-pendente'
      default:
        return ''
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'ATIVO'
      case 'inativo':
        return 'INATIVO'
      case 'pendente':
        return 'PENDENTE'
      default:
        return status.toUpperCase()
    }
  }

  const handleSaveCliente = async (novoCliente: ClienteCreateData) => {
    try {
      await clienteService.criarCliente(novoCliente)

      // Recarregar lista de clientes e estatísticas
      await carregarClientes()
      await carregarEstatisticas()

      showSuccess(`Cliente ${novoCliente.nome} cadastrado com sucesso!`)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      showError('Erro ao cadastrar cliente. Tente novamente.')
    }
  }

  const handleVerDetalhes = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setIsDetalhesModalOpen(true)
  }

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setIsEditarModalOpen(true)
  }

  const handleSalvarEdicao = async (clienteAtualizado: Cliente) => {
    try {
      // Preparar dados para envio, removendo campos vazios
      const dadosParaEnvio = {
        id: clienteAtualizado.id,
        nome: clienteAtualizado.nome,
        email: clienteAtualizado.email,
        telefone: clienteAtualizado.telefone,
        empresa: clienteAtualizado.empresa,
        status: clienteAtualizado.status,
        endereco: clienteAtualizado.endereco || undefined,
        cidade: clienteAtualizado.cidade || undefined,
        estado: clienteAtualizado.estado || undefined,
        cep: clienteAtualizado.cep || undefined,
        cnpj: clienteAtualizado.cnpj || undefined,
        observacoes: clienteAtualizado.observacoes || undefined,
        contatoResponsavel: clienteAtualizado.contatoResponsavel || undefined,
        telefoneResponsavel: clienteAtualizado.telefoneResponsavel || undefined
      }

      console.log('Dados sendo enviados para atualização:', dadosParaEnvio)

      await clienteService.atualizarCliente(dadosParaEnvio)

      // Recarregar lista de clientes e estatísticas
      await carregarClientes()
      await carregarEstatisticas()

      showSuccess(`Cliente ${clienteAtualizado.nome} atualizado com sucesso!`)
      setIsEditarModalOpen(false)
    } catch (err) {
      console.error('Erro ao atualizar cliente:', err)
      showError('Erro ao atualizar cliente. Tente novamente.')
    }
  }

  const handleExcluirCliente = (cliente: Cliente) => {
    setClienteParaExcluir(cliente)
    setIsConfirmModalOpen(true)
  }

  const confirmarExclusao = async () => {
    if (!clienteParaExcluir) return

    try {
      await clienteService.deletarCliente(clienteParaExcluir.id)

      // Recarregar lista de clientes e estatísticas
      await carregarClientes()
      await carregarEstatisticas()

      showSuccess(`Cliente ${clienteParaExcluir.nome} excluído com sucesso!`)
      setClienteParaExcluir(null)
    } catch (err) {
      console.error('Erro ao excluir cliente:', err)
      if (err instanceof Error && err.message.includes('não encontrado')) {
        showWarning('Este cliente já foi excluído ou não existe mais. A lista será atualizada.')
        await carregarClientes()
      } else {
        showError('Erro ao excluir cliente. Tente novamente.')
      }
      setClienteParaExcluir(null)
    }
  }

  const handleExcluirTodosClientes = () => {
    setConfirmacaoTexto('')
    setIsExcluirTodosModalOpen(true)
  }

  const confirmarExclusaoTodos = async () => {
    if (confirmacaoTexto !== 'EXCLUIR TUDO') {
      showWarning('Operação cancelada. Digite "EXCLUIR TUDO" exatamente como mostrado.')
      return
    }

    try {
      setIsExcluirTodosModalOpen(false)
      setConfirmacaoTexto('')

      const resultado = await clienteService.deletarTodosClientes()

      // Recarregar lista de clientes e estatísticas
      await carregarClientes()
      await carregarEstatisticas()

      showSuccess(`${resultado.data.deletedCount} cliente(s) foram excluídos com sucesso!`)
    } catch (err) {
      console.error('Erro ao excluir todos os clientes:', err)
      showError('Erro ao excluir clientes. Tente novamente ou verifique suas permissões.')
    }
  }

  const handleImport = async (importedData: any[]) => {
    try {
      console.log('Dados importados:', importedData)
      console.log('Total de registros:', importedData.length)

      if (!importedData || importedData.length === 0) {
        showError('Nenhum dado encontrado no arquivo. Verifique o formato do arquivo.')
        return
      }

      // Log do primeiro item para debug
      if (importedData.length > 0) {
        const firstItem = importedData[0]
        console.log('=== DEBUG: PRIMEIRO ITEM IMPORTADO ===')
        console.log('Objeto completo:', firstItem)
        console.log('Chaves disponíveis:', Object.keys(firstItem))
        console.log('Todas as chaves de todos os itens:', [...new Set(importedData.flatMap(item => Object.keys(item)))])
        console.log('Mapeamento completo (chave: valor):')
        Object.entries(firstItem).forEach(([key, value]) => {
          console.log(`  "${key}": ${value} (tipo: ${typeof value})`)
        })
        console.log('=====================================')
      }

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (let i = 0; i < importedData.length; i++) {
        const item = importedData[i]

        // Declarar variáveis fora do try para acessar no catch
        let nomeValue = ''
        let emailValue = ''
        let telefoneValue = ''
        let cleanedTelefoneValue = ''
        let formattedTelefone = ''
        let clienteData: ClienteCreateData | undefined

        try {
          // Função auxiliar para buscar valor - APENAS BUSCA EXATA por chaves conhecidas
          const getValue = (keys: string[]): string => {
            // Busca exata apenas - sem fuzzy matching
            for (const key of keys) {
              if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                const value = String(item[key]).trim()
                if (value) {
                  return value
                }
              }
            }
            return ''
          }

          // Log das chaves disponíveis no primeiro item para debug
          if (i === 0) {
            console.log('Chaves disponíveis no item:', Object.keys(item))
            console.log('Tentando mapear campos obrigatórios...')
          }

          // Preparar dados do cliente com mapeamento flexível
          // Mapear baseado nos valores que vimos nos logs: CLIENTE, EMAIL, TELEFONE
          // Os headers normalizados serão: cliente, email, telefone, cpfcnpj, cep, logradouro, etc.
          nomeValue = getValue(['cliente', 'nome', 'name', 'client', 'pessoa', 'person', 'nome_completo', 'nomecompleto'])
          emailValue = getValue(['email', 'e-mail', 'mail', 'correio', 'correio_eletronico', 'e_mail', 'email1'])

          // Tentar celular primeiro (maioria dos dados está nesse campo), depois telefone como fallback
          telefoneValue = getValue(['celular', 'mobile', 'cell', 'cel'])
          if (!telefoneValue) {
            telefoneValue = getValue(['telefone', 'phone', 'tel', 'fone', 'telefone1', 'telefone_1'])
          }
          // Se não encontrar empresa, usar o nome do cliente como empresa
          let empresaValue = getValue(['empresa', 'company', 'companhia', 'razao_social', 'razaosocial', 'razao social'])
          if (!empresaValue) {
            empresaValue = nomeValue || 'Não informado'
          }

          // Limpar e formatar telefone - remover TODOS os caracteres especiais primeiro
          if (telefoneValue) {
            // Primeiro, extrair apenas números
            const cleanTelefone = telefoneValue.replace(/[^\d]/g, '')

            // Validar se tem pelo menos 10 dígitos (DDD + telefone)
            if (cleanTelefone.length >= 10 && cleanTelefone.length <= 11) {
              cleanedTelefoneValue = cleanTelefone

              // Formatar: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
              const ddd = cleanTelefone.substring(0, 2)
              const resto = cleanTelefone.substring(2)

              if (resto.length === 9) {
                // Telefone celular com 9 dígitos
                formattedTelefone = `(${ddd}) ${resto.substring(0, 5)}-${resto.substring(5, 9)}`
              } else if (resto.length === 8) {
                // Telefone fixo com 8 dígitos
                formattedTelefone = `(${ddd}) ${resto.substring(0, 4)}-${resto.substring(4, 8)}`
              } else {
                // Se não tiver 8 ou 9 dígitos após o DDD, rejeitar
                formattedTelefone = ''
              }
            } else {
              // Telefone inválido (muito curto ou muito longo)
              formattedTelefone = ''
              cleanedTelefoneValue = ''
            }
          }

          // Limpar CNPJ (remover pontos, barras e hífens)
          const cnpjValue = getValue(['cnpj', 'cpfcnpj', 'cpf_cnpj', 'documento', 'document'])
          const cleanCnpj = cnpjValue ? cnpjValue.replace(/[^\d]/g, '') : undefined

          clienteData = {
            nome: nomeValue,
            email: emailValue.toLowerCase().trim(),
            telefone: formattedTelefone,
            empresa: empresaValue,
            status: (getValue(['status', 'situacao', 'situação']) || 'ativo').toLowerCase() as 'ativo' | 'inativo' | 'pendente',
            endereco: getValue(['endereco', 'endereço', 'address', 'rua', 'logradouro']) || undefined,
            cidade: getValue(['cidade', 'city', 'municipio', 'município']) || undefined,
            estado: getValue(['estado', 'state', 'uf', 'sigla']) || undefined,
            cep: getValue(['cep', 'postal', 'codigo_postal', 'codigopostal', 'código postal']) || undefined,
            cnpj: cleanCnpj,
            observacoes: getValue(['observacoes', 'observações', 'obs', 'observacao', 'observação', 'notes', 'notas']) || undefined,
            contatoResponsavel: getValue(['contato_responsavel', 'contatoresponsavel', 'contato responsavel', 'responsavel', 'responsável', 'contact', 'contato']) || undefined,
            telefoneResponsavel: getValue(['telefone_responsavel', 'telefoneresponsavel', 'telefone responsavel', 'telefone_contato', 'telefonecontato']) || undefined
          }

          // Log detalhado para o primeiro item
          if (i === 0) {
            console.log('Mapeamento do primeiro item:', {
              nomeEncontrado: nomeValue,
              emailEncontrado: emailValue,
              telefoneOriginal: telefoneValue,
              telefoneLimpo: cleanedTelefoneValue,
              telefoneFormatado: formattedTelefone,
              empresaEncontrada: empresaValue,
              clienteDataFinal: clienteData
            })
          }

          // Log para debug
          console.log(`Processando item ${i + 1}:`, {
            original: item,
            mapped: clienteData
          })

          // ===== APLICAR VALORES PADRÃO PARA CAMPOS OBRIGATÓRIOS =====

          // 1. Nome
          if (!clienteData.nome || clienteData.nome.trim() === '') {
            console.warn(`Item ${i + 1}: Nome vazio - usando valor padrão`)
            clienteData.nome = `Cliente Importado ${i + 1}`
          }

          // 2. Email
          if (!clienteData.email || clienteData.email.trim() === '') {
            // Gerar email único baseado no timestamp e índice
            const timestamp = Date.now()
            const randomSuffix = Math.floor(Math.random() * 10000)
            clienteData.email = `cliente_${i + 1}_${timestamp}_${randomSuffix}@importado.temp`
            console.warn(`Item ${i + 1}: Email vazio - gerado email temporário: ${clienteData.email}`)
          } else {
            // Validar formato de email básico apenas se foi fornecido
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(clienteData.email)) {
              // Email inválido, gerar um novo
              const timestamp = Date.now()
              const randomSuffix = Math.floor(Math.random() * 10000)
              const oldEmail = clienteData.email
              clienteData.email = `cliente_${i + 1}_${timestamp}_${randomSuffix}@importado.temp`
              console.warn(`Item ${i + 1}: Email inválido "${oldEmail}" - gerado email temporário: ${clienteData.email}`)
            }
          }

          // 3. Telefone - VERIFICAR SE ESTÁ VAZIO (string vazia, null, undefined)
          const telefoneEstaVazio = !clienteData.telefone ||
            clienteData.telefone === '' ||
            clienteData.telefone.trim() === ''

          if (telefoneEstaVazio) {
            // Não enviar telefone se estiver vazio (deixar como undefined para ser opcional no backend)
            clienteData.telefone = undefined
            console.warn(`Item ${i + 1}: Telefone vazio/inválido - será omitido do cadastro`)
          }

          // 4. Empresa - não é obrigatório, mas usar nome como fallback
          if (!clienteData.empresa || clienteData.empresa.trim() === '') {
            clienteData.empresa = clienteData.nome || 'Empresa Não Informada'
          }

          await clienteService.criarCliente(clienteData)
          successCount++
          console.log(`Cliente ${i + 1} importado com sucesso:`, clienteData.nome)
        } catch (err) {
          const errorMsg = `Item ${i + 1}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          console.error('Erro ao importar cliente:', err, {
            itemOriginal: item,
            dadosEnviados: clienteData || {},
            telefoneRaw: telefoneValue || '',
            telefoneLimpo: cleanedTelefoneValue || '',
            telefoneFormatado: formattedTelefone || '',
            emailRaw: emailValue || ''
          })
          errors.push(errorMsg)
          errorCount++
        }
      }

      await carregarClientes()
      await carregarEstatisticas()

      if (successCount > 0) {
        showSuccess(`${successCount} cliente(s) importado(s) com sucesso!${errorCount > 0 ? ` ${errorCount} erro(s).` : ''}`)
        if (errors.length > 0 && errors.length <= 5) {
          console.warn('Erros detalhados:', errors)
        }
      } else {
        const errorMessage = errorCount > 0
          ? `Nenhum cliente foi importado. ${errorCount} erro(s) encontrado(s). Verifique o formato do arquivo e os campos obrigatórios (nome, email, telefone, empresa).`
          : 'Nenhum cliente foi importado. Verifique o formato do arquivo.'
        showError(errorMessage)
        if (errors.length > 0) {
          console.error('Todos os erros:', errors)
        }
      }
    } catch (err) {
      console.error('Erro ao processar importação:', err)
      showError('Erro ao processar importação de clientes. Verifique o console para mais detalhes.')
    }
  }

  const getColumns = () => [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'empresa', label: 'Empresa' },
    { key: 'status', label: 'Status' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado' },
    { key: 'cnpj', label: 'CNPJ' }
  ]

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Lista de Clientes, {userName}!</h2>
            <p>Visualize e gerencie todos os clientes cadastrados</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <ImportExportButtons
              data={clientesFiltrados}
              filename="clientes"
              title="Lista de Clientes"
              columns={getColumns()}
              onImport={handleImport}
            />
            {isAdmin && (
            <button
              onClick={handleExcluirTodosClientes}
              className="btn-danger"
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: '#dc3545',
                color: 'white',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              title="Excluir TODOS os clientes (requer confirmação)"
            >
              🗑️ Excluir Todos
            </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="dashboard-grid">
        <div className="card card-elevated">
          <div className="stats-content">
            <h3>TOTAL DE CLIENTES</h3>
            <p className="stats-number">{stats.total}</p>
            <span className="stats-change positive">+{stats.ativos} ativos</span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="stats-content">
            <h3>CLIENTES ATIVOS</h3>
            <p className="stats-number">{stats.ativos}</p>
            <span className="stats-change positive">Ativos no sistema</span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="stats-content">
            <h3>PENDENTES</h3>
            <p className="stats-number">{stats.pendentes}</p>
            <span className="stats-change warning">Aguardando aprovação</span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="stats-content">
            <h3>INATIVOS</h3>
            <p className="stats-number">{stats.inativos}</p>
            <span className="stats-change negative">Clientes inativos</span>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card card-elevated">
        <div className="filters-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nome, empresa ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Pendentes</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="clientes-list-container">
        <div className="add-cliente-section">
          <h2>Clientes Cadastrados ({clientesFiltrados.length})</h2>
          <button
            className="btn-add-cliente"
            onClick={() => setIsModalOpen(true)}
          >
            Adicionar Cliente
          </button>
        </div>
        <div className="clientes-list">
          {loading ? (
            <div className="loading-state">
              <p>Carregando clientes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={carregarClientes} className="btn btn-primary">
                Tentar Novamente
              </button>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="no-results">
              <p>Nenhum cliente encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="cliente-item">
                <div className="cliente-info">
                  <div className="cliente-header">
                    <h3>{cliente.nome}</h3>
                    <span className={`status-badge ${getStatusClass(cliente.status)}`}>
                      {getStatusText(cliente.status)}
                    </span>
                  </div>
                  <div className="cliente-details">
                    <div className="detail-group">
                      <span className="detail-label">Empresa:</span>
                      <span className="detail-value">{cliente.empresa}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{cliente.email}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Telefone:</span>
                      <span className="detail-value">{cliente.telefone}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Cadastrado em:</span>
                      <span className="detail-value">{new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="detail-group">
                      <span className="detail-label">Última atualização:</span>
                      <span className="detail-value">{new Date(cliente.ultimaAtualizacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="cliente-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditarCliente(cliente)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleExcluirCliente(cliente)}
                    style={{ background: '#ff4757', color: '#fff' }}
                  >
                    Excluir
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleVerDetalhes(cliente)}
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modais */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
      />

      <ClienteDetalhesModal
        isOpen={isDetalhesModalOpen}
        onClose={() => setIsDetalhesModalOpen(false)}
        cliente={clienteSelecionado}
      />

      <ClienteEditarModal
        isOpen={isEditarModalOpen}
        onClose={() => setIsEditarModalOpen(false)}
        cliente={clienteSelecionado}
        onSave={handleSalvarEdicao}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setClienteParaExcluir(null)
        }}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o cliente "${clienteParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Confirmar Exclusão"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Confirmação para Excluir Todos */}
      {isExcluirTodosModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExcluirTodosModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ color: '#dc3545', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ ATENÇÃO! Ação Irreversível
              </h2>
              <button className="modal-close" onClick={() => setIsExcluirTodosModalOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                color: '#856404'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🚨 Você está prestes a excluir TODOS os clientes cadastrados!
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Esta ação não pode ser desfeita e todos os dados serão permanentemente removidos.
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
                  Para confirmar, digite exatamente: <strong style={{ color: '#dc3545' }}>EXCLUIR TUDO</strong>
                </p>
                <input
                  type="text"
                  value={confirmacaoTexto}
                  onChange={(e) => setConfirmacaoTexto(e.target.value)}
                  placeholder="Digite: EXCLUIR TUDO"
                  className="input-field"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    setIsExcluirTodosModalOpen(false)
                    setConfirmacaoTexto('')
                  }}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    fontWeight: '500'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusaoTodos}
                  disabled={confirmacaoTexto !== 'EXCLUIR TUDO'}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: confirmacaoTexto !== 'EXCLUIR TUDO' ? 'not-allowed' : 'pointer',
                    backgroundColor: confirmacaoTexto !== 'EXCLUIR TUDO' ? '#ccc' : '#dc3545',
                    color: 'white',
                    fontWeight: '500',
                    opacity: confirmacaoTexto !== 'EXCLUIR TUDO' ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  🗑️ Excluir Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CadastroCliente
