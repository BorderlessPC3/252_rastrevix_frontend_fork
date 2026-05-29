"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Trash2 } from "lucide-react"
import { chipGsmService, type ChipGSM } from "../services/chipGsmService"
import { showSuccess, showError } from "../utils/toast"
import ChipGsmForm from "../components/ChipGsmForm"
import PageFeedback from "../components/PageFeedback"
import { useAuth } from "../contexts/AuthContext"
import { canManageCadastros } from "../utils/rbac"
import "../styles/dashboard-pages.css"
import "../styles/estoque.css"

const EstoqueChipGSM: React.FC = () => {
  const { user } = useAuth()
  const canManage = canManageCadastros(user?.role)
  const [chips, setChips] = useState<ChipGSM[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChip, setSelectedChip] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    carregarChips()
  }, [page, searchTerm])

  const carregarChips = async () => {
    try {
      setIsLoading(true)
      const response = await chipGsmService.listarChipsGsm({
        page,
        limit: 100,
        search: searchTerm || undefined
      })
      setChips(response.data.chips)
    } catch (error) {
      console.error("Erro ao carregar chips GSM:", error)
      showError("Erro ao carregar chips GSM. Tente novamente.")
      setChips([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChip = () => {
    carregarChips()
    showSuccess("Chip GMS cadastrado com sucesso!")
  }

  const handleExcluir = async (chip: ChipGSM) => {
    if (window.confirm(`Tem certeza que deseja excluir o chip ${chip.numero}?`)) {
      try {
        await chipGsmService.excluirChipGsm(chip.id)
        showSuccess("Chip GSM excluído com sucesso!")
        carregarChips()
      } catch (error) {
        console.error("Erro ao excluir chip GSM:", error)
        showError("Erro ao excluir chip GSM. Tente novamente.")
      }
    }
  }

  return (
    <div className="dashboard-page estoque-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">ESTOQUE · Chip GSM</h1>
          <p className="page-subtitle">Cadastro e listagem de chips GSM do estoque</p>
        </div>
      </div>

      {canManage && (
        <section className="chip-gsm-cadastro-card">
          <div className="chip-gsm-cadastro-header">
            <h2>Cadastrar Chip GMS</h2>
            <p className="chip-gsm-required-hint">
              Todos os campos com (*) são obrigatórios para fazer o cadastro
            </p>
          </div>
          <ChipGsmForm onSuccess={handleSaveChip} />
        </section>
      )}

      <div className="page-content">
        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Procurar Chip GSM"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <PageFeedback
          loading={isLoading}
          loadingMessage="Carregando chips GSM…"
          empty={!isLoading && chips.length === 0}
          emptyMessage="Nenhum chip GSM encontrado."
        >
          <div className="chip-gsm-table-container">
            <div className="chip-gsm-table">
              {chips.map((chip, index) => (
                <div
                  key={chip.id}
                  className={`chip-gsm-row ${selectedChip === chip.id ? "selected" : ""}`}
                  onClick={() => setSelectedChip(chip.id)}
                >
                  <div className="chip-gsm-number">{index + 1}</div>
                  <div className="chip-gsm-numero">{chip.iccid || chip.numero}</div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">STATUS:</span>
                    <span className={`status-badge status-${chip.status}`}>
                      {chip.status.charAt(0).toUpperCase() + chip.status.slice(1)}
                    </span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">CLIENTE:</span>
                    <span className="chip-gsm-value">{chip.cliente || "---"}</span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">TELEFONE:</span>
                    <span className="chip-gsm-value">{chip.telefone || "---"}</span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">OPERADORA:</span>
                    <span className="chip-gsm-value">{chip.operadora || "---"}</span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">VEIC. INSTAL.:</span>
                    <span className="chip-gsm-value">{chip.veiculoInstalado || "---"}</span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">EQUIP.:</span>
                    <span className="chip-gsm-value">{chip.equipamento || "---"}</span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">FORNECEDOR:</span>
                    <span className="chip-gsm-value">{chip.fornecedor || "---"}</span>
                  </div>
                  <div className="chip-gsm-field">
                    <span className="chip-gsm-label">MATRIZ/FRANQUIA:</span>
                    <span className="chip-gsm-value">{chip.matrizFranquia || "---"}</span>
                  </div>
                  {canManage && (
                    <div className="chip-gsm-actions">
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExcluir(chip)
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PageFeedback>
      </div>
    </div>
  )
}

export default EstoqueChipGSM
