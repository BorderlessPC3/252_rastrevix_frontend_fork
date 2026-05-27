"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { maquinaService } from "../services/maquinaService"
import { clienteService } from "../services/clienteService"
import { colaboradorService } from "../services/colaboradorService"
import PageFeedback from "../components/PageFeedback"
import { showError } from "../utils/toast"
import "../styles/dashboard-pages.css"

interface DashboardStats {
  totalMaquinas: number
  maquinasAtivas: number
  totalClientes: number
  clientesAtivos: number
  totalColaboradores: number
  colaboradoresAtivos: number
  eficienciaMedia: number
  loading: boolean
  error: string | null
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const userName = user?.name || "Usuário"

  const [stats, setStats] = useState<DashboardStats>({
    totalMaquinas: 0,
    maquinasAtivas: 0,
    totalClientes: 0,
    clientesAtivos: 0,
    totalColaboradores: 0,
    colaboradoresAtivos: 0,
    eficienciaMedia: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))

      // Carregar estatísticas de máquinas
      const maquinasStats = await maquinaService.obterEstatisticas()

      // Carregar estatísticas de clientes
      const clientesStats = await clienteService.obterEstatisticas()

      // Carregar estatísticas de colaboradores
      const colaboradoresStats = await colaboradorService.obterEstatisticas()

      setStats({
        totalMaquinas: maquinasStats.data.total,
        maquinasAtivas: maquinasStats.data.ativas,
        totalClientes: clientesStats.data.total,
        clientesAtivos: clientesStats.data.ativos,
        totalColaboradores: colaboradoresStats.data.total,
        colaboradoresAtivos: colaboradoresStats.data.ativos,
        eficienciaMedia: maquinasStats.data.eficienciaMedia,
        loading: false,
        error: null
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      const msg = err instanceof Error ? err.message : 'Erro ao carregar o dashboard'
      showError(msg)
      setStats(prev => ({ ...prev, loading: false, error: msg }))
    }
  }

  const getMensalData = () => {
    // Calcular baseado nos dados reais
    const totalItens = stats.totalMaquinas + stats.totalClientes + stats.totalColaboradores
    const itensAtivos = stats.maquinasAtivas + stats.clientesAtivos + stats.colaboradoresAtivos

    // Meta: manter 80% dos itens ativos
    const meta = 80
    const porcentagemAtual = totalItens > 0 ? (itensAtivos / totalItens) * 100 : 0

    return {
      porcentagem: Math.min(100, Math.round(porcentagemAtual)),
      meta,
      diffSemana: totalItens > 0 ? Math.round(porcentagemAtual - meta) : 0
    }
  }

  const mensalData = getMensalData()

  if (stats.loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Bem-vindo de volta, {userName}!</h2>
        </div>
        <PageFeedback loading loadingMessage="Carregando resumo da frota…" />
      </div>
    )
  }

  if (stats.error) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Bem-vindo de volta, {userName}!</h2>
        </div>
        <PageFeedback error={stats.error} onRetry={carregarEstatisticas} />
      </div>
    )
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-welcome">
        <h2>Bem-vindo de volta, {userName}!</h2>
        <p>Aqui está um resumo das suas atividades</p>
      </div>

      <div className="dashboard-grid">
        <div className="card card-elevated">
          <div className="stats-content">
            <h3>TOTAL DE RECURSOS</h3>
            <p className="stats-number">{stats.totalMaquinas + stats.totalClientes + stats.totalColaboradores}</p>
            <span className="stats-change positive">
              {stats.totalMaquinas} máquinas, {stats.totalClientes} clientes, {stats.totalColaboradores} colaboradores
            </span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="stats-content">
            <h3>ATIVOS NO SISTEMA</h3>
            <p className="stats-number">
              {stats.maquinasAtivas + stats.clientesAtivos + stats.colaboradoresAtivos}
            </p>
            <span className="stats-change positive">
              {stats.maquinasAtivas} máq., {stats.clientesAtivos} client., {stats.colaboradoresAtivos} colabor.
            </span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="stats-content">
            <h3>EFICIÊNCIA MÉDIA</h3>
            <p className="stats-number">
              {stats.eficienciaMedia > 0 ? `${Math.round(stats.eficienciaMedia)}%` : 'N/A'}
            </p>
            <span className="stats-change positive">
              Máquinas {stats.eficienciaMedia > 0 ? 'operacionais' : 'sem dados'}
            </span>
          </div>
        </div>

        <div className="card card-elevated">
          <div className="stats-content">
            <h3>PERFORMANCE</h3>
            <p className="stats-number">{mensalData.porcentagem}%</p>
            <span className="stats-change positive">
              {mensalData.diffSemana >= 0 ? '+' : ''}{mensalData.diffSemana}% desta semana
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-sections">
        <div className="card card-elevated">
          <h2>Resumo Atual</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-content">
                <p><strong>Máquinas:</strong> {stats.totalMaquinas} total ({stats.maquinasAtivas} ativas)</p>
                <span className="activity-time">Última atualização: hoje</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-content">
                <p><strong>Clientes:</strong> {stats.totalClientes} total ({stats.clientesAtivos} ativos)</p>
                <span className="activity-time">Última atualização: hoje</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-content">
                <p><strong>Colaboradores:</strong> {stats.totalColaboradores} total ({stats.colaboradoresAtivos} ativos)</p>
                <span className="activity-time">Última atualização: hoje</span>
              </div>
            </div>
            {stats.eficienciaMedia > 0 && (
              <div className="activity-item">
                <div className="activity-content">
                  <p><strong>Eficiência média das máquinas:</strong> {Math.round(stats.eficienciaMedia)}%</p>
                  <span className="activity-time">Baseado em dados reais</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card card-elevated">
          <h2>Status do Sistema</h2>
          <div className="project-list">
            <div className="project-item">
              <div className="project-header">
                <h3>Rastrevix - Rastreamento Industrial</h3>
                <span className="project-status in-progress">OPERACIONAL</span>
              </div>
              <div className="project-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${stats.totalMaquinas > 0 ? Math.min(100, (stats.maquinasAtivas / stats.totalMaquinas) * 100) : 0}%` }}
                  ></div>
                </div>
                <span className="progress-text">
                  {stats.totalMaquinas > 0
                    ? `${Math.round((stats.maquinasAtivas / stats.totalMaquinas) * 100)}% das máquinas ativas`
                    : 'Sem máquinas cadastradas'
                  }
                </span>
              </div>
              <div className="project-meta">
                <span>{stats.maquinasAtivas} máquinas em operação</span>
                <span>{stats.clientesAtivos} clientes ativos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

