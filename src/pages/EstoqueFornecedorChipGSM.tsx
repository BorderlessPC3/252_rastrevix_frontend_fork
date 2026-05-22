"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Plus, Trash2 } from "lucide-react"
import { fornecedorChipGsmService, type FornecedorChipGSM } from "../services/fornecedorChipGsmService"
import { showSuccess, showError } from "../utils/toast"
import FornecedorChipGSMModal from "../components/FornecedorChipGSMModal"
import PageFeedback from "../components/PageFeedback"
import { useAuth } from "../contexts/AuthContext"
import { canManageCadastros } from "../utils/rbac"
import "../styles/dashboard-pages.css"
import "../styles/estoque.css"

const EstoqueFornecedorChipGSM: React.FC = () => {
  const { user } = useAuth()
  const canManage = canManageCadastros(user?.role)
  const [fornecedores, setFornecedores] = useState<FornecedorChipGSM[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const carregarFornecedores = async () => {
    try {
      setIsLoading(true)
      const response = await fornecedorChipGsmService.listarFornecedores({
        limit: 1000
      })
      setFornecedores(response.data.fornecedores)
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err)
      showError('Erro ao carregar fornecedores. Verifique sua conexão.')
      setFornecedores([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarFornecedores()
  }, [])

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fornecedor.telefone && fornecedor.telefone.includes(searchTerm)) ||
    fornecedor.remetente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fornecedor.observacoes && fornecedor.observacoes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleNovo = () => {
    setIsModalOpen(true)
  }

  const handleSalvarNovo = async (fornecedorData: { nome: string; email: string; telefone: string; remetente: string; observacoes: string }) => {
    try {
      await fornecedorChipGsmService.criarFornecedor({
        nome: fornecedorData.nome,
        email: fornecedorData.email,
        telefone: fornecedorData.telefone || undefined,
        remetente: fornecedorData.remetente,
        observacoes: fornecedorData.observacoes || undefined
      })
      showSuccess('Fornecedor adicionado com sucesso!')
      setIsModalOpen(false)
      await carregarFornecedores()
    } catch (err) {
      console.error('Erro ao criar fornecedor:', err)
      showError('Erro ao criar fornecedor. Tente novamente.')
    }
  }

  const handleExcluir = async (fornecedor: FornecedorChipGSM) => {
    if (window.confirm(`Tem certeza que deseja excluir o fornecedor ${fornecedor.nome}?`)) {
      try {
        await fornecedorChipGsmService.excluirFornecedor(fornecedor.id)
        showSuccess('Fornecedor excluído com sucesso!')
        await carregarFornecedores()
      } catch (err) {
        console.error('Erro ao excluir fornecedor:', err)
        showError('Erro ao excluir fornecedor. Tente novamente.')
      }
    }
  }

  return (
    <div className="dashboard-page estoque-page">
      <div className="page-header">
        <h1 className="page-title">ESTOQUE · Forn. Chip GSM</h1>
      </div>

      <div className="page-content">
        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Procurar Fornecedor"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {canManage && (
            <div className="action-buttons-header">
              <button className="btn btn-secondary" onClick={handleNovo}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                Novo
              </button>
            </div>
          )}
        </div>

        <PageFeedback
          loading={isLoading}
          loadingMessage="Carregando fornecedores…"
          empty={!isLoading && filteredFornecedores.length === 0}
          emptyMessage="Nenhum fornecedor encontrado."
        >
          <div className="estoque-list">
            {filteredFornecedores.map((fornecedor, index) => (
              <div key={fornecedor.id} className="estoque-item">
                <div className="estoque-item-number">{index + 1}</div>
                <div className="estoque-item-content">
                  <div className="estoque-item-header">
                    <div className="estoque-item-id">{fornecedor.nome}</div>
                  </div>
                  <div className="estoque-item-details">
                    <div className="detail-row">
                      <span className="detail-label">EMAIL:</span>
                      <span className="detail-value">{fornecedor.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">TELEFONE:</span>
                      <span className="detail-value">{fornecedor.telefone || '---'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">REMETENTE:</span>
                      <span className="detail-value">{fornecedor.remetente}</span>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <div className="estoque-item-actions">
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleExcluir(fornecedor)}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PageFeedback>
      </div>

      <FornecedorChipGSMModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSalvarNovo}
      />
    </div>
  )
}

export default EstoqueFornecedorChipGSM
