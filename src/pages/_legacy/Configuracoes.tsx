"use client"

import type React from "react"
import { useState } from "react"
import { 
  Settings, 
  Bell, 
  Shield, 
  Link as LinkIcon 
} from "lucide-react"
import "../styles/dashboard-pages.css"

const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState("geral")
  const [settings, setSettings] = useState({
    // Configurações Gerais
    appName: "Rastrevix",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    
    // Configurações de Notificação
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    
    // Configurações de Segurança
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    
    // Configurações de Integração
    apiEnabled: true,
    webhookUrl: "",
    syncInterval: 15
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    console.log("Salvando configurações:", settings)
    alert("Configurações salvas com sucesso!")
  }

  const tabs = [
    { id: "geral", label: "Geral", icon: Settings },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "integracao", label: "Integração", icon: LinkIcon }
  ]

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>Configurações Gerais</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="appName">Nome da Aplicação</label>
          <input
            type="text"
            id="appName"
            value={settings.appName}
            onChange={(e) => handleSettingChange("appName", e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="timezone">Fuso Horário</label>
          <select
            id="timezone"
            value={settings.timezone}
            onChange={(e) => handleSettingChange("timezone", e.target.value)}
            className="form-input"
          >
            <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
            <option value="America/New_York">Nova York (GMT-5)</option>
            <option value="Europe/London">Londres (GMT+0)</option>
            <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dateFormat">Formato de Data</label>
          <select
            id="dateFormat"
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
            className="form-input"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="currency">Moeda</label>
          <select
            id="currency"
            value={settings.currency}
            onChange={(e) => handleSettingChange("currency", e.target.value)}
            className="form-input"
          >
            <option value="BRL">Real Brasileiro (R$)</option>
            <option value="USD">Dólar Americano ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Configurações de Notificação</h3>
      
      <div className="preferences-grid">
        <div className="preference-item">
          <div className="preference-info">
            <h4>Notificações por E-mail</h4>
            <p>Receber alertas e relatórios por e-mail</p>
          </div>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
            />
            <label htmlFor="emailNotifications"></label>
          </div>
        </div>
        
        <div className="preference-item">
          <div className="preference-info">
            <h4>Notificações Push</h4>
            <p>Receber notificações em tempo real no navegador</p>
          </div>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="pushNotifications"
              checked={settings.pushNotifications}
              onChange={(e) => handleSettingChange("pushNotifications", e.target.checked)}
            />
            <label htmlFor="pushNotifications"></label>
          </div>
        </div>
        
        <div className="preference-item">
          <div className="preference-info">
            <h4>Notificações SMS</h4>
            <p>Receber alertas críticos por SMS</p>
          </div>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="smsNotifications"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange("smsNotifications", e.target.checked)}
            />
            <label htmlFor="smsNotifications"></label>
          </div>
        </div>
        
        <div className="preference-item">
          <div className="preference-info">
            <h4>Relatórios Semanais</h4>
            <p>Receber resumos semanais de atividades</p>
          </div>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="weeklyReports"
              checked={settings.weeklyReports}
              onChange={(e) => handleSettingChange("weeklyReports", e.target.checked)}
            />
            <label htmlFor="weeklyReports"></label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Configurações de Segurança</h3>
      
      <div className="preferences-grid">
        <div className="preference-item">
          <div className="preference-info">
            <h4>Autenticação de Dois Fatores</h4>
            <p>Adicionar uma camada extra de segurança à sua conta</p>
          </div>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleSettingChange("twoFactorAuth", e.target.checked)}
            />
            <label htmlFor="twoFactorAuth"></label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</label>
          <select
            id="sessionTimeout"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
            className="form-input"
          >
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={120}>2 horas</option>
            <option value={480}>8 horas</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="passwordExpiry">Expiração da Senha (dias)</label>
          <select
            id="passwordExpiry"
            value={settings.passwordExpiry}
            onChange={(e) => handleSettingChange("passwordExpiry", parseInt(e.target.value))}
            className="form-input"
          >
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
            <option value={180}>180 dias</option>
            <option value={365}>1 ano</option>
            <option value={0}>Nunca</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderIntegrationSettings = () => (
    <div className="settings-section">
      <h3>Configurações de Integração</h3>
      
      <div className="preferences-grid">
        <div className="preference-item">
          <div className="preference-info">
            <h4>API Habilitada</h4>
            <p>Permitir acesso via API para integrações externas</p>
          </div>
          <div className="toggle-switch">
            <input 
              type="checkbox" 
              id="apiEnabled"
              checked={settings.apiEnabled}
              onChange={(e) => handleSettingChange("apiEnabled", e.target.checked)}
            />
            <label htmlFor="apiEnabled"></label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="webhookUrl">URL do Webhook</label>
          <input
            type="url"
            id="webhookUrl"
            value={settings.webhookUrl}
            onChange={(e) => handleSettingChange("webhookUrl", e.target.value)}
            className="form-input"
            placeholder="https://exemplo.com/webhook"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="syncInterval">Intervalo de Sincronização (minutos)</label>
          <select
            id="syncInterval"
            value={settings.syncInterval}
            onChange={(e) => handleSettingChange("syncInterval", parseInt(e.target.value))}
            className="form-input"
          >
            <option value={5}>5 minutos</option>
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={240}>4 horas</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <h2>Configurações</h2>
        <p>Gerencie as configurações do sistema e suas preferências</p>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          {tabs.map(tab => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">
                  <IconComponent size={20} />
                </span>
                <span className="tab-label">{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="settings-content">
          <div className="card card-elevated">
            {activeTab === "geral" && renderGeneralSettings()}
            {activeTab === "notificacoes" && renderNotificationSettings()}
            {activeTab === "seguranca" && renderSecuritySettings()}
            {activeTab === "integracao" && renderIntegrationSettings()}
            
            <div className="settings-actions">
              <button className="btn btn-primary" onClick={handleSaveSettings}>
                Salvar Configurações
              </button>
              <button className="btn btn-secondary">
                Restaurar Padrões
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
