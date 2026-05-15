"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import "../styles/dashboard-pages.css"

const Perfil: React.FC = () => {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    company: "",
    position: "",
    department: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as alterações
    console.log("Salvando dados do perfil:", formData)
    setIsEditing(false)
    // Simular sucesso
    alert("Perfil atualizado com sucesso!")
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      company: "",
      position: "",
      department: ""
    })
    setIsEditing(false)
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <h2>Meu Perfil</h2>
        <p>Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="profile-container">
        <div className="card card-elevated">
          <div className="profile-header">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
            <div className="profile-info">
              <h3>{user?.name || "Usuário"}</h3>
              <p>{user?.email || "usuario@exemplo.com"}</p>
              <span className="profile-role">{user?.role || 'user'}</span>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Editar Perfil
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    Salvar
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="card card-elevated">
            <h3>Informações Pessoais</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Telefone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="card card-elevated">
            <h3>Informações Profissionais</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="company">Empresa</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="position">Cargo</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Departamento</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                >
                  <option value="">Selecione um departamento</option>
                  <option value="ti">Tecnologia da Informação</option>
                  <option value="rh">Recursos Humanos</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="operacoes">Operações</option>
                  <option value="comercial">Comercial</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card card-elevated">
            <h3>Preferências de Conta</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Notificações por E-mail</h4>
                  <p>Receber notificações importantes por e-mail</p>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="email-notifications" defaultChecked />
                  <label htmlFor="email-notifications"></label>
                </div>
              </div>
              
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Modo Escuro</h4>
                  <p>Usar tema escuro na interface</p>
                </div>
                <div className="toggle-switch">
                  <input type="checkbox" id="dark-mode" defaultChecked />
                  <label htmlFor="dark-mode"></label>
                </div>
              </div>
              
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Idioma</h4>
                  <p>Selecionar idioma da interface</p>
                </div>
                <select className="form-input" style={{ width: "200px" }}>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
