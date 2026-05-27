"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { userService } from "../services/userService"
import { tenantService } from "../services/tenantService"
import { canManageCadastros } from "../utils/rbac"
import { showError, showSuccess } from "../utils/toast"
import PageFeedback from "../components/PageFeedback"
import "../styles/dashboard-pages.css"

const MAX_LOGO_BYTES = 400_000

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
    reader.readAsDataURL(file)
  })

const Perfil: React.FC = () => {
  const { user } = useAuth()
  const { branding, loading: brandingLoading, refreshBranding } = useTheme()
  const canEditBranding = canManageCadastros(user?.role)

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingBranding, setSavingBranding] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    position: user?.position || "",
    department: user?.department || ""
  })
  const [brandingForm, setBrandingForm] = useState({
    name: "",
    primaryColor: "#00d9ff",
    secondaryColor: "#0f172a",
    logoUrl: "" as string | undefined
  })

  useEffect(() => {
    if (!user) return
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      company: user.company || "",
      position: user.position || "",
      department: user.department || ""
    })
  }, [user])

  useEffect(() => {
    if (!branding) return
    setBrandingForm({
      name: branding.name || "",
      primaryColor: branding.primaryColor || "#00d9ff",
      secondaryColor: branding.secondaryColor || "#0f172a",
      logoUrl: branding.logoUrl
    })
  }, [branding])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBrandingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      showError("Envie um arquivo de imagem (PNG ou JPEG).")
      e.target.value = ""
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      showError("A imagem deve ter no máximo 400 KB.")
      e.target.value = ""
      return
    }
    try {
      const dataUrl = await readFileAsDataUrl(file)
      setBrandingForm(prev => ({ ...prev, logoUrl: dataUrl }))
    } catch {
      showError("Não foi possível carregar a imagem.")
    }
    e.target.value = ""
  }

  const handleSaveBranding = async () => {
    if (!canEditBranding) return
    if (!brandingForm.name.trim()) {
      showError("Informe o nome da marca.")
      return
    }
    try {
      setSavingBranding(true)
      await tenantService.updateBranding({
        name: brandingForm.name.trim(),
        primaryColor: brandingForm.primaryColor,
        secondaryColor: brandingForm.secondaryColor,
        logoUrl: brandingForm.logoUrl || null,
        faviconUrl: brandingForm.logoUrl || null
      })
      await refreshBranding()
      showSuccess("Whitelabel salvo. O logo aparecerá nos PDFs exportados.")
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao salvar whitelabel")
    } finally {
      setSavingBranding(false)
    }
  }

  const handleRemoveLogo = () => {
    setBrandingForm(prev => ({ ...prev, logoUrl: undefined }))
  }

  const handleSave = async () => {
    if (!user?.id) return
    try {
      setSaving(true)
      await userService.updateProfile(user.id, {
        name: formData.name,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        position: formData.position || undefined,
        department: formData.department || undefined
      })
      setIsEditing(false)
      showSuccess("Perfil atualizado com sucesso")
    } catch (e) {
      showError(e instanceof Error ? e.message : "Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || "",
      position: user?.position || "",
      department: user?.department || ""
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
                    disabled={saving}
                  >
                    {saving ? "Salvando…" : "Salvar"}
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
                  disabled
                  className="form-input"
                  title="O e-mail não pode ser alterado aqui"
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
            <h3>Whitelabel (marca)</h3>
            <p className="profile-branding-hint">
              Ícone e cores da sua marca. O logo é aplicado automaticamente em todos os PDFs exportados dos relatórios.
            </p>
            {brandingLoading ? (
              <PageFeedback loading loadingMessage="Carregando branding…" />
            ) : canEditBranding ? (
              <div className="profile-branding-form">
                <div className="form-group">
                  <label htmlFor="brandLogo">Ícone / logo da marca</label>
                  <div className="profile-branding-logo-row">
                    <div className="profile-branding-logo">
                      {brandingForm.logoUrl ? (
                        <img src={brandingForm.logoUrl} alt="" style={{ maxHeight: 64, maxWidth: 160 }} />
                      ) : (
                        <span className="profile-branding-placeholder">Sem logo</span>
                      )}
                    </div>
                    <div className="profile-branding-logo-actions">
                      <input
                        id="brandLogo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => void handleLogoFile(e)}
                        className="form-input"
                      />
                      {brandingForm.logoUrl && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleRemoveLogo}
                        >
                          Remover logo
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="profile-branding-hint">PNG ou JPEG, até 400 KB.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="brandName">Nome exibido</label>
                    <input
                      id="brandName"
                      name="name"
                      type="text"
                      className="form-input"
                      value={brandingForm.name}
                      onChange={handleBrandingChange}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="primaryColor">Cor primária</label>
                    <input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      className="form-input profile-color-input"
                      value={brandingForm.primaryColor}
                      onChange={handleBrandingChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="secondaryColor">Cor secundária</label>
                    <input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      className="form-input profile-color-input"
                      value={brandingForm.secondaryColor}
                      onChange={handleBrandingChange}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={savingBranding}
                  onClick={() => void handleSaveBranding()}
                >
                  {savingBranding ? "Salvando whitelabel…" : "Salvar whitelabel"}
                </button>
              </div>
            ) : branding ? (
              <div className="profile-branding-preview">
                <div className="profile-branding-logo">
                  {branding.logoUrl ? (
                    <img src={branding.logoUrl} alt="" style={{ maxHeight: 48 }} />
                  ) : (
                    <span className="profile-branding-placeholder">Sem logo</span>
                  )}
                </div>
                <dl className="profile-branding-meta">
                  <div>
                    <dt>Nome exibido</dt>
                    <dd>{branding.name}</dd>
                  </div>
                  <div>
                    <dt>Cor primária</dt>
                    <dd>
                      <span
                        className="profile-color-swatch"
                        style={{ background: branding.primaryColor }}
                      />
                      {branding.primaryColor}
                    </dd>
                  </div>
                </dl>
                <p className="profile-branding-hint">
                  Apenas administradores e gestores podem alterar o whitelabel.
                </p>
              </div>
            ) : (
              <p className="profile-branding-hint">Usando identidade padrão Rastrevix.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
