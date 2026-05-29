import React, { useState, useEffect } from 'react'
import { chipGsmService, type ChipGSMCreateData } from '../services/chipGsmService'
import { clienteService } from '../services/clienteService'
import { fornecedorChipGsmService } from '../services/fornecedorChipGsmService'
import { showError } from '../utils/toast'

interface ChipGsmFormData {
  numero: string
  status: 'ativo' | 'inativo' | 'bloqueado'
  clienteId: string
  operadora: string
  iccid: string
  fornecedorId: string
  telefone: string
  planoGsm: string
  quantidadeMB: string
  valorMensal: string
  dataAtivacao: string
  observacoes: string
}

const INITIAL_FORM: ChipGsmFormData = {
  numero: '',
  status: 'ativo',
  clienteId: '',
  operadora: '',
  iccid: '',
  fornecedorId: '',
  telefone: '',
  planoGsm: '',
  quantidadeMB: '',
  valorMensal: '',
  dataAtivacao: '',
  observacoes: ''
}

const OPERADORAS = [
  'TIM',
  'CLARO',
  'VIVO',
  'OI',
  'OPTIMUS',
  'OUTRA',
  'TERAPAR',
  'VODAFONE',
  'PORTO',
  'ESEYE',
  'ALGAR',
  'TM DATA',
  'PORTO CONE',
  'NLT',
  'ARQIA',
  'CLARO-VIVO',
  'ADEQUA',
  'Vivo-Esim',
  'NEO MULTI'
]

const PLANOS_GSM = ['DADOS', 'DADOS/VOZ', 'PRÉ', 'VOZ']

interface ChipGsmFormProps {
  onSuccess?: () => void
}

const ChipGsmForm: React.FC<ChipGsmFormProps> = ({ onSuccess }) => {
  const [clientes, setClientes] = useState<Array<{ id: string; nome: string; empresa: string }>>([])
  const [fornecedores, setFornecedores] = useState<Array<{ id: string; nome: string }>>([])
  const [formData, setFormData] = useState<ChipGsmFormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof ChipGsmFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      clienteService.listarClientes({ limit: 500, status: 'ativo' }),
      fornecedorChipGsmService.listarFornecedores({ limit: 200 })
    ])
      .then(([clientesRes, fornRes]) => {
        setClientes(
          clientesRes.data.clientes.map((c) => ({
            id: c.id,
            nome: c.nome,
            empresa: c.empresa
          }))
        )
        setFornecedores(
          fornRes.data.fornecedores.map((f) => ({ id: f.id, nome: f.nome }))
        )
      })
      .catch(() => {
        setClientes([])
        setFornecedores([])
        showError('Não foi possível carregar clientes ou fornecedores.')
      })
  }, [])

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === 'telefone') {
      setFormData((prev) => ({ ...prev, telefone: formatPhone(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    if (errors[name as keyof ChipGsmFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ChipGsmFormData, string>> = {}

    if (!formData.clienteId.trim()) newErrors.clienteId = 'Cliente é obrigatório'
    if (!formData.status.trim()) newErrors.status = 'Status é obrigatório'
    if (!formData.operadora.trim()) newErrors.operadora = 'Operadora é obrigatória'
    if (!formData.iccid.trim()) {
      newErrors.iccid = 'ICCID é obrigatório'
    } else if (formData.iccid.length < 10) {
      newErrors.iccid = 'ICCID deve ter pelo menos 10 caracteres'
    }
    if (!formData.fornecedorId.trim()) newErrors.fornecedorId = 'Fornecedor é obrigatório'
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório'
    if (!formData.planoGsm.trim()) newErrors.planoGsm = 'Plano GSM é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const dataToSave: ChipGSMCreateData = {
        numero: formData.iccid.trim(),
        status: formData.status,
        clienteId: formData.clienteId,
        operadora: formData.operadora.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        fornecedorId: formData.fornecedorId || undefined,
        iccid: formData.iccid.trim() || undefined,
        planoGsm: formData.planoGsm.trim() || undefined,
        quantidadeMB: formData.quantidadeMB
          ? parseFloat(formData.quantidadeMB.replace(/[^\d.,-]/g, '').replace(',', '.'))
          : undefined,
        valorMensal: formData.valorMensal
          ? parseFloat(formData.valorMensal.replace(/[^\d.,-]/g, '').replace(',', '.'))
          : undefined,
        dataAtivacao: formData.dataAtivacao || undefined,
        observacoes: formData.observacoes.trim() || undefined
      }

      await chipGsmService.criarChipGsm(dataToSave)
      resetForm()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao cadastrar chip GSM:', error)
      const msg = error instanceof Error ? error.message : 'Erro ao cadastrar chip GSM.'
      setErrors({ iccid: msg })
      showError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="chip-gsm-form">
      <h3 className="chip-gsm-form-section-title">Dados</h3>

      <div className="form-group">
        <label htmlFor="clienteId">Cliente *</label>
        <select
          id="clienteId"
          name="clienteId"
          value={formData.clienteId}
          onChange={handleInputChange}
          className={`form-select ${errors.clienteId ? 'error' : ''}`}
        >
          <option value="">[ Selecione o Cliente ]</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} — {c.empresa}
            </option>
          ))}
        </select>
        {errors.clienteId && <span className="error-message">{errors.clienteId}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className={`form-select ${errors.status ? 'error' : ''}`}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
        {errors.status && <span className="error-message">{errors.status}</span>}
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label htmlFor="operadora">Operadora *</label>
          <select
            id="operadora"
            name="operadora"
            value={formData.operadora}
            onChange={handleInputChange}
            className={`form-select ${errors.operadora ? 'error' : ''}`}
          >
            <option value="">[ Selecione a Operadora ]</option>
            {OPERADORAS.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          {errors.operadora && <span className="error-message">{errors.operadora}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="fornecedorId">Fornecedor *</label>
          <select
            id="fornecedorId"
            name="fornecedorId"
            value={formData.fornecedorId}
            onChange={handleInputChange}
            className={`form-select ${errors.fornecedorId ? 'error' : ''}`}
          >
            <option value="">[ Selecione o Fornecedor ]</option>
            {fornecedores.map((fornecedor) => (
              <option key={fornecedor.id} value={fornecedor.id}>
                {fornecedor.nome}
              </option>
            ))}
          </select>
          {errors.fornecedorId && <span className="error-message">{errors.fornecedorId}</span>}
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label htmlFor="iccid">ICCID *</label>
          <input
            type="text"
            id="iccid"
            name="iccid"
            value={formData.iccid}
            onChange={handleInputChange}
            className={`form-input ${errors.iccid ? 'error' : ''}`}
            placeholder="Número do ICCID"
            maxLength={20}
          />
          {errors.iccid && <span className="error-message">{errors.iccid}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone *</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            className={`form-input ${errors.telefone ? 'error' : ''}`}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
          {errors.telefone && <span className="error-message">{errors.telefone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="planoGsm">Plano GSM *</label>
        <select
          id="planoGsm"
          name="planoGsm"
          value={formData.planoGsm}
          onChange={handleInputChange}
          className={`form-select ${errors.planoGsm ? 'error' : ''}`}
        >
          <option value="">[ Selecione o Plano ]</option>
          {PLANOS_GSM.map((plano) => (
            <option key={plano} value={plano}>
              {plano}
            </option>
          ))}
        </select>
        {errors.planoGsm && <span className="error-message">{errors.planoGsm}</span>}
      </div>

      <div className="form-grid-3">
        <div className="form-group">
          <label htmlFor="quantidadeMB">Quantidade de MB</label>
          <input
            type="text"
            id="quantidadeMB"
            name="quantidadeMB"
            value={formData.quantidadeMB}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Quantidade de MB"
          />
        </div>

        <div className="form-group">
          <label htmlFor="valorMensal">Valor Mensal</label>
          <input
            type="text"
            id="valorMensal"
            name="valorMensal"
            value={formData.valorMensal}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Valor mensal"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dataAtivacao">Data Ativação</label>
          <input
            type="date"
            id="dataAtivacao"
            name="dataAtivacao"
            value={formData.dataAtivacao}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="observacoes">Observações</label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleInputChange}
          className="form-textarea"
          placeholder="Observações adicionais sobre o chip GSM"
          rows={4}
        />
      </div>

      <div className="chip-gsm-form-actions">
        <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={isLoading}>
          Limpar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Cadastrando…' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}

export default ChipGsmForm
