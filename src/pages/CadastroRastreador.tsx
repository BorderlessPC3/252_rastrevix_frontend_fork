"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { rastreadorService } from "../services/rastreadorService"
import { maquinaService } from "../services/maquinaService"
import ImportExportButtons from "../components/ImportExportButtons"
import { showSuccess, showError } from "../utils/toast"
import type { Rastreador } from "../types"
import "../styles/dashboard-pages.css"
import "../styles/import-export.css"

interface RastreadorFormData {
  numeroSerial: string
  imei: string
  status: 'ativo' | 'inativo' | 'manutencao' | 'bloqueado'
  modelo: string
  fabricante: string
  versaoFirmware: string
  placa: string
  nome: string
  condutor: string
  tipoVeiculo: 'onibus' | 'caminhao' | 'carro'
  bloqueado: boolean
  tipoTransmissao: string
  observacoes: string
}

const CadastroRastreador: React.FC = () => {
  const [rastreadores, setRastreadores] = useState<Rastreador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditarModalOpen, setIsEditarModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [rastreadorSelecionado, setRastreadorSelecionado] = useState<Rastreador | null>(null)
  const [rastreadorParaExcluir, setRastreadorParaExcluir] = useState<Rastreador | null>(null)
  const [maquinasDisponiveis, setMaquinasDisponiveis] = useState<Array<{ id: string; codigo: string; nome: string; placa?: string }>>([])
  const [maquinaId, setMaquinaId] = useState('')
  const [formData, setFormData] = useState<RastreadorFormData>({
    numeroSerial: '',
    imei: '',
    status: 'ativo',
    modelo: '',
    fabricante: '',
    versaoFirmware: '',
    placa: '',
    nome: '',
    condutor: '',
    tipoVeiculo: 'carro',
    bloqueado: false,
    tipoTransmissao: 'GPRS',
    observacoes: ''
  })

  // Carregar dados dos rastreadores
  const carregarRastreadores = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await rastreadorService.listarRastreadores({
        limit: 100
      })

      setRastreadores(response.data.rastreadores)
    } catch (err) {
      console.error('Erro ao carregar rastreadores:', err)
      setError('Erro ao carregar rastreadores. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarRastreadores()
  }, [])

  const carregarMaquinasSemRastreador = async () => {
    try {
      const res = await maquinaService.listarMaquinas({ limit: 500 })
      const lista = res.data.maquinas.filter(
        (m) => !(m as { rastreadorId?: string }).rastreadorId
      )
      setMaquinasDisponiveis(
        lista.map((m) => ({
          id: m.id,
          codigo: m.codigo,
          nome: m.nome,
          placa: (m as { placa?: string }).placa
        }))
      )
    } catch {
      setMaquinasDisponiveis([])
      showError('Não foi possível carregar veículos para vínculo.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dadosParaEnvio: Partial<Rastreador> = {
        numeroSerial: formData.numeroSerial,
        imei: formData.imei,
        status: formData.status,
        modelo: formData.modelo || undefined,
        fabricante: formData.fabricante || undefined,
        versaoFirmware: formData.versaoFirmware || undefined,
        placa: formData.placa || undefined,
        nome: formData.nome || undefined,
        condutor: formData.condutor || undefined,
        tipoVeiculo: formData.tipoVeiculo,
        bloqueado: formData.bloqueado,
        tipoTransmissao: formData.tipoTransmissao || undefined,
        observacoes: formData.observacoes || undefined
      }

      if (rastreadorSelecionado) {
        // Atualizar
        await rastreadorService.atualizarRastreador(rastreadorSelecionado.id, dadosParaEnvio)
        showSuccess(`Rastreador ${formData.nome || formData.numeroSerial} atualizado com sucesso!`)
        setIsEditarModalOpen(false)
      } else {
        if (!maquinaId) {
          showError('Selecione o veículo ao qual o rastreador será vinculado.')
          return
        }
        await rastreadorService.criarRastreador({
          ...dadosParaEnvio,
          maquinaId
        } as Partial<Rastreador> & { maquinaId: string })
        showSuccess(`Rastreador ${formData.nome || formData.numeroSerial} cadastrado e vinculado ao veículo!`)
        setIsModalOpen(false)
        setMaquinaId('')
      }

      // Limpar formulário
      setFormData({
        numeroSerial: '',
        imei: '',
        status: 'ativo',
        modelo: '',
        fabricante: '',
        versaoFirmware: '',
        placa: '',
        nome: '',
        condutor: '',
        tipoVeiculo: 'carro',
        bloqueado: false,
        tipoTransmissao: 'GPRS',
        observacoes: ''
      })
      setRastreadorSelecionado(null)

      // Recarregar lista
      await carregarRastreadores()
    } catch (err) {
      console.error('Erro ao salvar rastreador:', err)
      showError(err instanceof Error ? err.message : 'Erro ao cadastrar rastreador. Tente novamente.')
    }
  }

  const handleEditar = (rastreador: Rastreador) => {
    setRastreadorSelecionado(rastreador)
    setFormData({
      numeroSerial: rastreador.numeroSerial,
      imei: rastreador.imei,
      status: rastreador.status,
      modelo: rastreador.modelo || '',
      fabricante: rastreador.fabricante || '',
      versaoFirmware: rastreador.versaoFirmware || '',
      placa: rastreador.placa || '',
      nome: rastreador.nome || '',
      condutor: rastreador.condutor || '',
      tipoVeiculo: rastreador.tipoVeiculo || 'carro',
      bloqueado: rastreador.bloqueado || false,
      tipoTransmissao: rastreador.tipoTransmissao || 'GPRS',
      observacoes: rastreador.observacoes || ''
    })
    setIsEditarModalOpen(true)
  }

  const handleExcluir = (rastreador: Rastreador) => {
    setRastreadorParaExcluir(rastreador)
    setIsConfirmModalOpen(true)
  }

  const confirmarExclusao = async () => {
    if (!rastreadorParaExcluir) return

    try {
      await rastreadorService.deletarRastreador(rastreadorParaExcluir.id)
      showSuccess(`Rastreador ${rastreadorParaExcluir.nome || rastreadorParaExcluir.numeroSerial} excluído com sucesso!`)
      setRastreadorParaExcluir(null)
      await carregarRastreadores()
    } catch (err) {
      console.error('Erro ao excluir rastreador:', err)
      showError('Erro ao excluir rastreador. Tente novamente.')
      setRastreadorParaExcluir(null)
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'status-ativo'
      case 'inativo':
        return 'status-inativo'
      case 'manutencao':
        return 'status-manutencao'
      case 'bloqueado':
        return 'status-bloqueado'
      default:
        return ''
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo'
      case 'inativo':
        return 'Inativo'
      case 'manutencao':
        return 'Manutenção'
      case 'bloqueado':
        return 'Bloqueado'
      default:
        return status
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="rastreador-form">
      {!rastreadorSelecionado && (
        <div className="form-section">
          <h3 className="form-section-title">🔗 Vínculo obrigatório</h3>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
            Todo rastreador deve ser cadastrado já vinculado a um veículo (máquina) do cliente.
          </p>
          <div className="form-group">
            <label htmlFor="maquinaId">
              Veículo <span className="required">*</span>
            </label>
            <select
              id="maquinaId"
              value={maquinaId}
              onChange={(e) => setMaquinaId(e.target.value)}
              required
              className="form-select"
            >
              <option value="">Selecione um veículo sem rastreador</option>
              {maquinasDisponiveis.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codigo} — {m.nome}{m.placa ? ` (${m.placa})` : ''}
                </option>
              ))}
            </select>
            {maquinasDisponiveis.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                Cadastre um veículo em Cadastro → Máquina antes de incluir o rastreador.
              </p>
            )}
          </div>
        </div>
      )}
      {/* Seção: Informações Básicas do Rastreador */}
      <div className="form-section">
        <h3 className="form-section-title">📡 Informações Básicas do Rastreador</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="numeroSerial">
              Número Serial <span className="required">*</span>
            </label>
            <input
              type="text"
              id="numeroSerial"
              name="numeroSerial"
              value={formData.numeroSerial}
              onChange={handleChange}
              required
              placeholder="Ex: SN123456"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imei">
              IMEI <span className="required">*</span>
            </label>
            <input
              type="text"
              id="imei"
              name="imei"
              value={formData.imei}
              onChange={handleChange}
              required
              maxLength={15}
              placeholder="15 dígitos"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fabricante">Fabricante</label>
            <input
              type="text"
              id="fabricante"
              name="fabricante"
              value={formData.fabricante}
              onChange={handleChange}
              placeholder="Ex: J-R12"
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
              placeholder="Ex: Rastreador GPS"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="versaoFirmware">Versão do Firmware</label>
            <input
              type="text"
              id="versaoFirmware"
              name="versaoFirmware"
              value={formData.versaoFirmware}
              onChange={handleChange}
              placeholder="Ex: 1.0.0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoTransmissao">Tipo de Transmissão</label>
            <select
              id="tipoTransmissao"
              name="tipoTransmissao"
              value={formData.tipoTransmissao}
              onChange={handleChange}
              className="form-select"
            >
              <option value="GPRS">GPRS</option>
              <option value="4G">4G</option>
              <option value="3G">3G</option>
              <option value="2G">2G</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seção: Dados do Veículo */}
      <div className="form-section">
        <h3 className="form-section-title">🚗 Dados do Veículo</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="placa">Placa do Veículo</label>
            <input
              type="text"
              id="placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              placeholder="Ex: ABC-1234"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="nome">Nome/Identificador</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: PMM-MUCURICI - 72641"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="condutor">Condutor/Cliente</label>
            <input
              type="text"
              id="condutor"
              name="condutor"
              value={formData.condutor}
              onChange={handleChange}
              placeholder="Ex: BRUNO SANTOS VIEIRA"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoVeiculo">Tipo de Veículo</label>
            <select
              id="tipoVeiculo"
              name="tipoVeiculo"
              value={formData.tipoVeiculo}
              onChange={handleChange}
              className="form-select"
            >
              <option value="carro">🚗 Carro</option>
              <option value="onibus">🚌 Ônibus</option>
              <option value="caminhao">🚛 Caminhão</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seção: Status e Configurações */}
      <div className="form-section">
        <h3 className="form-section-title">⚙️ Status e Configurações</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="ativo">✅ Ativo</option>
              <option value="inativo">⏸️ Inativo</option>
              <option value="manutencao">🔧 Manutenção</option>
              <option value="bloqueado">🚫 Bloqueado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bloqueado" className="checkbox-label">
              <input
                type="checkbox"
                id="bloqueado"
                name="bloqueado"
                checked={formData.bloqueado}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">🔒 Rastreador Bloqueado</span>
            </label>
          </div>
        </div>
      </div>

      {/* Seção: Observações */}
      <div className="form-section">
        <h3 className="form-section-title">📝 Observações</h3>
        <div className="form-group">
          <label htmlFor="observacoes">Observações Adicionais</label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={4}
            placeholder="Observações adicionais sobre o rastreador..."
            className="form-textarea"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(false)
            setIsEditarModalOpen(false)
            setRastreadorSelecionado(null)
            setFormData({
              numeroSerial: '',
              imei: '',
              status: 'ativo',
              modelo: '',
              fabricante: '',
              versaoFirmware: '',
              placa: '',
              nome: '',
              condutor: '',
              tipoVeiculo: 'carro',
              bloqueado: false,
              tipoTransmissao: 'GPRS',
              observacoes: ''
            })
          }}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          {rastreadorSelecionado ? '💾 Atualizar' : '➕ Cadastrar'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Cadastro de Rastreadores</h1>
          <p>Gerencie os rastreadores veiculares do sistema</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {rastreadores.length > 0 && (
            <ImportExportButtons
              data={rastreadores}
              filename="rastreadores"
              title="Lista de Rastreadores"
              columns={[
                { key: 'numeroSerial', label: 'Nº Serial' },
                { key: 'imei', label: 'IMEI' },
                { key: 'placa', label: 'Placa' },
                { key: 'nome', label: 'Nome' },
                { key: 'condutor', label: 'Condutor' },
                { key: 'tipoVeiculo', label: 'Tipo Veículo' },
                { key: 'status', label: 'Status' },
                { key: 'fabricante', label: 'Fabricante' },
                { key: 'modelo', label: 'Modelo' }
              ]}
              importEnabled={false}
            />
          )}
          <button
            className="btn btn-primary"
            onClick={() => {
              setRastreadorSelecionado(null)
              setFormData({
                numeroSerial: '',
                imei: '',
                status: 'ativo',
                modelo: '',
                fabricante: '',
                versaoFirmware: '',
                placa: '',
                nome: '',
                condutor: '',
                tipoVeiculo: 'carro',
                bloqueado: false,
                tipoTransmissao: 'GPRS',
                observacoes: ''
              })
              setMaquinaId('')
              void carregarMaquinasSemRastreador()
              setIsModalOpen(true)
            }}
          >
            + Novo Rastreador
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Carregando rastreadores...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Serial</th>
                <th>IMEI</th>
                <th>Placa</th>
                <th>Nome</th>
                <th>Condutor</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Bloqueado</th>
                <th>Transmissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rastreadores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="empty-state">
                    Nenhum rastreador cadastrado. Clique em "Novo Rastreador" para começar.
                  </td>
                </tr>
              ) : (
                rastreadores.map((rastreador) => (
                  <tr key={rastreador.id}>
                    <td>{rastreador.numeroSerial}</td>
                    <td>{rastreador.imei}</td>
                    <td>{rastreador.placa || 'N/A'}</td>
                    <td>{rastreador.nome || rastreador.numeroSerial}</td>
                    <td>{rastreador.condutor || 'N/A'}</td>
                    <td>
                      {rastreador.tipoVeiculo === 'onibus' ? '🚌' : rastreador.tipoVeiculo === 'caminhao' ? '🚛' : '🚗'}
                      {' '}
                      {rastreador.tipoVeiculo || 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(rastreador.status)}`}>
                        {getStatusLabel(rastreador.status)}
                      </span>
                    </td>
                    <td>{rastreador.bloqueado ? '🔒 Sim' : '🔓 Não'}</td>
                    <td>{rastreador.tipoTransmissao || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditar(rastreador)}
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleExcluir(rastreador)}
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📡 Novo Rastreador</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {renderForm()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditarModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditarModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><Pencil size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} /> Editar Rastreador</h2>
              <button className="modal-close" onClick={() => setIsEditarModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {renderForm()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isConfirmModalOpen && rastreadorParaExcluir && (
        <div className="modal-overlay" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <button className="modal-close" onClick={() => setIsConfirmModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o rastreador{' '}
                <strong>{rastreadorParaExcluir.nome || rastreadorParaExcluir.numeroSerial}</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={confirmarExclusao}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CadastroRastreador
