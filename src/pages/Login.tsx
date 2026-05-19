"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { isPublicRegisterEnabled } from "../config/env"

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError("Por favor, preencha todos os campos")
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Por favor, insira um endereço de email válido")
        return
      }

      // Call login API
      await login({
        email: formData.email,
        password: formData.password
      })
      
      navigate("/")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha no login. Tente novamente."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="auth-card">
        <h1>Bem-vindo de Volta</h1>
        <p>Faça login em sua conta para continuar no Rastrevix</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {isPublicRegisterEnabled && (
          <div className="auth-links">
            <p>
              Não tem uma conta? <Link to="/register">Crie uma aqui</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
