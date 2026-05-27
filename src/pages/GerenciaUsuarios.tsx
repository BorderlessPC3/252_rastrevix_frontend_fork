"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useFirebaseDirect } from "../config/firebase"
import PageFeedback from "../components/PageFeedback"
import { adminUserService } from "../services/adminUserService"
import type { AppUser } from "../firebase/auth"
import { canManagePlatformUsers } from "../utils/rbac"
import { showError, showSuccess } from "../utils/toast"
import "../styles/dashboard-pages.css"

const GerenciaUsuarios: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const firebaseMode = useFirebaseDirect()

  const [loading, setLoading] = useState(true)
  const [hasAdmin, setHasAdmin] = useState(true)
  const [usuarios, setUsuarios] = useState<AppUser[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "manager",
  })

  const isAdmin = canManagePlatformUsers(user?.role)
  const bootstrapMode = !hasAdmin
  const canUsePage = isAdmin || bootstrapMode

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      const adminExists = await adminUserService.hasPlatformAdmin()
      setHasAdmin(adminExists)
      if (adminExists && canManagePlatformUsers(user?.role)) {
        const lista = await adminUserService.listUsers()
        setUsuarios(lista)
      } else {
        setUsuarios([])
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePromoteSelf = async () => {
    if (!user?.id) return
    if (!firebaseMode) {
      showError("Promoção rápida só está disponível com Firebase direto.")
      return
    }
    try {
      setSubmitting(true)
      await adminUserService.promoteToAdmin(user.id)
      await refreshUser()
      showSuccess("Sua conta agora é administrador. Atualize a página se o menu não mudar.")
      await carregar()
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao promover usuário")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canUsePage) return
    if (!firebaseMode) {
      showError("Criação de usuários requer VITE_USE_FIREBASE=true.")
      return
    }
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      showError("Preencha nome, e-mail e senha (mín. 6 caracteres).")
      return
    }

    try {
      setSubmitting(true)
      await adminUserService.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: bootstrapMode ? "admin" : form.role,
      })
      showSuccess("Usuário criado com sucesso.")
      setForm({ name: "", email: "", password: "", role: "admin" })
      await carregar()
    } catch (err) {
      showError(err instanceof Error ? err.message : "Erro ao criar usuário")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <PageFeedback loading loadingMessage="Carregando…" />
      </div>
    )
  }

  if (!canUsePage) {
    return (
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Usuários do sistema</h1>
        </div>
        <PageFeedback
          empty
          emptyMessage="Apenas administradores podem gerenciar usuários. Peça a um admin para elevar seu perfil."
        />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Usuários do sistema</h1>
        <p className="page-subtitle">
          Cadastro de veículos e estoque exige perfil <strong>manager</strong> ou{" "}
          <strong>admin</strong>. Usuários com perfil <strong>user</strong> não acessam essas rotas.
        </p>
      </div>

      {bootstrapMode && (
        <div className="maquina-item" style={{ marginBottom: "1.5rem", flexDirection: "column", alignItems: "stretch" }}>
          <p style={{ margin: "0 0 1rem", color: "var(--text-secondary)" }}>
            Nenhum administrador ativo no sistema. Crie o primeiro admin abaixo ou promova sua conta atual.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={submitting}
            onClick={() => void handlePromoteSelf()}
          >
            Tornar minha conta administrador
          </button>
        </div>
      )}

      <div className="maquina-item" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginTop: 0 }}>Novo usuário</h2>
        <form onSubmit={handleSubmit} className="rastreador-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="form-input"
              />
            </div>
            {isAdmin && !bootstrapMode && (
              <div className="form-group">
                <label htmlFor="role">Perfil</label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="admin">Admin (acesso total)</option>
                  <option value="manager">Manager (cadastros e estoque)</option>
                </select>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Salvando…" : "Criar usuário"}
          </button>
        </form>
      </div>

      {isAdmin && usuarios.length > 0 && (
        <div className="maquinas-list">
          <h2>Usuários cadastrados</h2>
          {usuarios.map((u) => (
            <div key={u.id} className="maquina-item">
              <div className="maquina-info">
                <strong>{u.name}</strong>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {u.email} · {u.role} · {u.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default GerenciaUsuarios
