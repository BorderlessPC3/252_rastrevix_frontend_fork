"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Plus, Trash2, Pencil } from "lucide-react"
import { rastreadorService } from "../services/rastreadorService"
import { showSuccess, showError } from "../utils/toast"
import type { Rastreador } from "../types"
import RastreadorEditarModal from "../components/RastreadorEditarModal"
import RastreadorCriarModal from "../components/RastreadorCriarModal"
import PageFeedback from "../components/PageFeedback"
import { useAuth } from "../contexts/AuthContext"
import { canManageCadastros } from "../utils/rbac"
import "../styles/dashboard-pages.css"
import "../styles/estoque.css"

interface Equipamento {
  id: string;
  numeroSerie: string;
  modelo: string;
  fabricante: string;
  status: 'disponivel' | 'instalado' | 'manutencao' | 'inativo';
  cliente?: string;
  veiculoInstalado?: string;
  dataInstalacao?: string;
  fornecedor: string;
  rastreador?: Rastreador; // Referência ao rastreador original
}

// Função para mapear Rastreador para Equipamento
const mapRastreadorToEquipamento = (rastreador: Rastreador): Equipamento => {
  // Mapear status do rastreador para status do equipamento
  const statusMap: Record<string, 'disponivel' | 'instalado' | 'manutencao' | 'inativo'> = {
    'ativo': 'instalado',
    'inativo': 'inativo',
    'manutencao': 'manutencao',
    'bloqueado': 'inativo'
  }

  return {
    id: rastreador.id,
    numeroSerie: rastreador.numeroSerial,
    modelo: rastreador.modelo || 'N/A',
    fabricante: rastreador.fabricante || 'N/A',
    status: statusMap[rastreador.status] || 'inativo',
    veiculoInstalado: rastreador.placa && rastreador.nome
      ? `${rastreador.nome} - ${rastreador.placa}`
      : rastreador.placa || rastreador.nome || undefined,
    dataInstalacao: rastreador.dataCadastro ? new Date(rastreador.dataCadastro).toISOString().split('T')[0] : undefined,
    fornecedor: rastreador.fabricante || 'N/A',
    rastreador: rastreador
  }
}

const EstoqueEquipamento: React.FC = () => {
  const { user } = useAuth()
  const canManage = canManageCadastros(user?.role)
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [isCriarModalOpen, setIsCriarModalOpen] = useState(false)
  const [rastreadorSelecionado, setRastreadorSelecionado] = useState<Rastreador | null>(null)

  const carregarEquipamentos = async () => {
    try {
      setIsLoading(true)
      const response = await rastreadorService.listarRastreadores({
        limit: 1000
      })

      const equipamentosMapeados = response.data.rastreadores.map(mapRastreadorToEquipamento)
      setEquipamentos(equipamentosMapeados)
    } catch (err) {
      console.error('Erro ao carregar equipamentos:', err)
      showError('Erro ao carregar equipamentos. Verifique sua conexão.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    carregarEquipamentos()
  }, [])

  const filteredEquipamentos = equipamentos.filter(equip =>
    equip.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equip.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equip.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (equip.cliente && equip.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleNovo = () => {
    setIsCriarModalOpen(true)
  }

  const handleSalvarNovo = async (rastreadorData: Partial<Rastreador>) => {
    try {
      await rastreadorService.criarRastreador(rastreadorData)
      showSuccess('Equipamento adicionado com sucesso!')
      setIsCriarModalOpen(false)
      await carregarEquipamentos()
    } catch (err) {
      console.error('Erro ao criar equipamento:', err)
      showError('Erro ao criar equipamento. Tente novamente.')
    }
  }

  const handleEditar = (equip: Equipamento) => {
    if (equip.rastreador) {
      setRastreadorSelecionado(equip.rastreador)
      setIsEditarModalOpen(true)
    }
  }

  const handleSalvarEdicao = async (rastreadorAtualizado: Rastreador) => {
    try {
      await rastreadorService.atualizarRastreador(rastreadorAtualizado.id, rastreadorAtualizado)
      showSuccess('Equipamento atualizado com sucesso!')
      setIsEditarModalOpen(false)
      setRastreadorSelecionado(null)
      await carregarEquipamentos()
    } catch (err) {
      console.error('Erro ao atualizar equipamento:', err)
      showError('Erro ao atualizar equipamento. Tente novamente.')
    }
  }

  const handleExcluir = async (equip: Equipamento) => {
    if (window.confirm(`Tem certeza que deseja excluir o equipamento ${equip.numeroSerie}?`)) {
      try {
        await rastreadorService.deletarRastreador(equip.id)
        showSuccess('Equipamento excluído com sucesso!')
        await carregarEquipamentos()
      } catch (err) {
        console.error('Erro ao excluir equipamento:', err)
        showError('Erro ao excluir equipamento. Tente novamente.')
      }
    }
  }

  return (
    <div className="dashboard-page estoque-page">
      <div className="page-header">
        <h1 className="page-title">ESTOQUE · Equipamento</h1>
      </div>

      <div className="page-content">
        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Procurar Equipamento"
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
          loadingMessage="Carregando equipamentos…"
          empty={!isLoading && filteredEquipamentos.length === 0}
          emptyMessage="Nenhum equipamento encontrado."
        >
          <div className="estoque-list">
            {filteredEquipamentos.map((equip, index) => (
              <div key={equip.id} className="estoque-item">
                <div className="estoque-item-number">{index + 1}</div>
                <div className="estoque-item-content">
                  <div className="estoque-item-header">
                    <div className="estoque-item-id">{equip.numeroSerie}</div>
                  </div>
                  <div className="estoque-item-details">
                    <div className="detail-row">
                      <span className="detail-label">STATUS:</span>
                      <span className={`status-badge status-${equip.status}`}>
                        {equip.status.charAt(0).toUpperCase() + equip.status.slice(1)}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">MODELO:</span>
                      <span className="detail-value">{equip.modelo}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">FABRICANTE:</span>
                      <span className="detail-value">{equip.fabricante}</span>
                    </div>
                    {equip.cliente && (
                      <div className="detail-row">
                        <span className="detail-label">CLIENTE:</span>
                        <span className="detail-value">{equip.cliente}</span>
                      </div>
                    )}
                    {equip.veiculoInstalado && (
                      <div className="detail-row">
                        <span className="detail-label">VEIC. INSTAL.:</span>
                        <span className="detail-value">{equip.veiculoInstalado}</span>
                      </div>
                    )}
                    {equip.dataInstalacao && (
                      <div className="detail-row">
                        <span className="detail-label">DATA INSTALAÇÃO:</span>
                        <span className="detail-value">{equip.dataInstalacao}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">FORNECEDOR:</span>
                      <span className="detail-value">{equip.fornecedor}</span>
                    </div>
                  </div>
                </div>
                {canManage && (
                  <div className="estoque-item-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEditar(equip)}
                      title="Editar"
                      style={{ marginRight: '8px' }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleExcluir(equip)}
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

      <RastreadorEditarModal
        isOpen={isEditarModalOpen}
        onClose={() => {
          setIsEditarModalOpen(false)
          setRastreadorSelecionado(null)
        }}
        onSave={handleSalvarEdicao}
        rastreador={rastreadorSelecionado}
      />

      <RastreadorCriarModal
        isOpen={isCriarModalOpen}
        onClose={() => setIsCriarModalOpen(false)}
        onSave={handleSalvarNovo}
      />
    </div>
  )
}

export default EstoqueEquipamento
