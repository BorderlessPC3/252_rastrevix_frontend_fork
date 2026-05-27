import React, { useState } from 'react'
import type { Rastreador } from '../types'

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

interface RastreadorCriarModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (rastreador: Partial<Rastreador>) => void
}

const RastreadorCriarModal: React.FC<RastreadorCriarModalProps> = ({ isOpen, onClose, onSave }) => {
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

  const [errors, setErrors] = useState<Partial<RastreadorFormData>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Limpar erro quando o usuário começar a digitar
    if (errors[name as keyof RastreadorFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<RastreadorFormData> = {}

    if (!formData.numeroSerial.trim()) {
      newErrors.numeroSerial = 'Número serial é obrigatório'
    }

    if (!formData.imei.trim()) {
      newErrors.imei = 'IMEI é obrigatório'
    } else if (formData.imei.length !== 15) {
      newErrors.imei = 'IMEI deve ter exatamente 15 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Converter dados do formulário para o formato esperado
      const rastreadorData: Partial<Rastreador> = {
        numeroSerial: formData.numeroSerial,
        imei: formData.imei,
        status: formData.status,
        modelo: formData.modelo || undefined,
        fabricante: formData.fabricante || undefined,
        versaoFirmware: formData.versaoFirmware || undefined,
        placa: formData.placa || undefined,
        nome: formData.nome || undefined,
        condutor: formData.condutor || undefined,
        tipoVeiculo: formData.tipoVeiculo || undefined,
        bloqueado: formData.bloqueado,
        tipoTransmissao: formData.tipoTransmissao || undefined,
        observacoes: formData.observacoes || undefined
      }

      onSave(rastreadorData)

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
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setErrors({})
    // Limpar formulário ao fechar
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
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-large">
        <div className="modal-header">
          <h2>Adicionar Novo Equipamento</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numeroSerial">Número Serial *</label>
              <input
                type="text"
                id="numeroSerial"
                name="numeroSerial"
                value={formData.numeroSerial}
                onChange={handleInputChange}
                className={errors.numeroSerial ? 'error' : ''}
                placeholder="Ex: 357073298627072"
                required
              />
              {errors.numeroSerial && <span className="error-message">{errors.numeroSerial}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="imei">IMEI *</label>
              <input
                type="text"
                id="imei"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                className={errors.imei ? 'error' : ''}
                placeholder="Ex: 123456789012345"
                maxLength={15}
                required
              />
              {errors.imei && <span className="error-message">{errors.imei}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="manutencao">Em Manutenção</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipoVeiculo">Tipo de Veículo</label>
              <select
                id="tipoVeiculo"
                name="tipoVeiculo"
                value={formData.tipoVeiculo}
                onChange={handleInputChange}
              >
                <option value="carro">Carro</option>
                <option value="caminhao">Caminhão</option>
                <option value="onibus">Ônibus</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fabricante">Fabricante</label>
              <input
                type="text"
                id="fabricante"
                name="fabricante"
                value={formData.fabricante}
                onChange={handleInputChange}
                placeholder="Ex: Fabricante X"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modelo">Modelo</label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleInputChange}
                placeholder="Ex: Modelo A"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="versaoFirmware">Versão do Firmware</label>
              <input
                type="text"
                id="versaoFirmware"
                name="versaoFirmware"
                value={formData.versaoFirmware}
                onChange={handleInputChange}
                placeholder="Ex: v1.0.0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoTransmissao">Tipo de Transmissão</label>
              <select
                id="tipoTransmissao"
                name="tipoTransmissao"
                value={formData.tipoTransmissao}
                onChange={handleInputChange}
              >
                <option value="GPRS">GPRS</option>
                <option value="TCP">TCP</option>
                <option value="4G">4G</option>
                <option value="3G">3G</option>
                <option value="2G">2G</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="placa">Placa do Veículo</label>
              <input
                type="text"
                id="placa"
                name="placa"
                value={formData.placa}
                onChange={handleInputChange}
                placeholder="Ex: ABC1234"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome do Veículo</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Ex: FIAT DUCATO"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="condutor">Condutor</label>
              <input
                type="text"
                id="condutor"
                name="condutor"
                value={formData.condutor}
                onChange={handleInputChange}
                placeholder="Nome do condutor"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bloqueado" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="bloqueado"
                  name="bloqueado"
                  checked={formData.bloqueado}
                  onChange={handleInputChange}
                />
                <span>Bloqueado</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Adicionar Equipamento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RastreadorCriarModal
