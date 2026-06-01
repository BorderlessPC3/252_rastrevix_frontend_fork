"use client"

import type React from "react"
import {
  ToggleLeft,
  ToggleRight,
  Wrench,
  WifiOff,
  Clock,
  X,
  Menu,
} from "lucide-react"
import MonitoringSemiDonut, {
  type DonutSegment,
} from "../components/MonitoringSemiDonut"
import "../styles/monitoring-dashboard.css"

const MOCK_TOTAL_INSTALACOES = 377
const MOCK_TOTAL_ATIVAS = 370

const MOCK_STATUS = {
  ligado: 62,
  desligado: 166,
  manutencao: 0,
  downtime: 90,
  atraso: 49,
  semPosicao: 7,
  ocultos: 0,
} as const

const STATUS_CARDS: {
  key: keyof typeof MOCK_STATUS
  label: string
  className: string
  icon: React.ReactNode
}[] = [
  {
    key: "ligado",
    label: "Ligado",
    className: "monitoring-status-card--ligado",
    icon: <ToggleRight size={22} strokeWidth={2} />,
  },
  {
    key: "desligado",
    label: "Desligado",
    className: "monitoring-status-card--desligado",
    icon: <ToggleLeft size={22} strokeWidth={2} />,
  },
  {
    key: "manutencao",
    label: "Manutenção",
    className: "monitoring-status-card--manutencao",
    icon: <Wrench size={22} strokeWidth={2} />,
  },
  {
    key: "downtime",
    label: "Downtime",
    className: "monitoring-status-card--downtime",
    icon: <WifiOff size={22} strokeWidth={2} />,
  },
  {
    key: "atraso",
    label: "Atraso",
    className: "monitoring-status-card--atraso",
    icon: <Clock size={22} strokeWidth={2} />,
  },
  {
    key: "semPosicao",
    label: "Sem Posição",
    className: "monitoring-status-card--sem-posicao",
    icon: <X size={24} strokeWidth={2.5} />,
  },
  {
    key: "ocultos",
    label: "Ocultos",
    className: "monitoring-status-card--ocultos",
    icon: <X size={24} strokeWidth={2.5} />,
  },
]

interface InstalacaoRow {
  cliente: string
  instalacao: string
  dataHora: string
  ultTrans: string
  status: string
}

const MOCK_TABLE: InstalacaoRow[] = [
  {
    cliente: "ARITUR TRANSPORTE E TURISMO LTDA",
    instalacao: "ESTOQUE 1",
    dataHora: "---",
    ultTrans: "---",
    status: "---",
  },
  {
    cliente: "rastrevix",
    instalacao: "teste motorista",
    dataHora: "---",
    ultTrans: "---",
    status: "---",
  },
  {
    cliente: "rastrevix",
    instalacao: "3333",
    dataHora: "---",
    ultTrans: "---",
    status: "---",
  },
  {
    cliente: "PM-MUCURICI/ES",
    instalacao: "ESTOQUE 139",
    dataHora: "---",
    ultTrans: "---",
    status: "---",
  },
  {
    cliente: "PM-MUCURICI/ES",
    instalacao: "ESTOQUE 140",
    dataHora: "---",
    ultTrans: "---",
    status: "---",
  },
  {
    cliente: "TRANSPORTADORA NORDESTE S.A.",
    instalacao: "CAMINHÃO 204",
    dataHora: "01/06/2026 08:42",
    ultTrans: "há 12 min",
    status: "Ligado",
  },
  {
    cliente: "LOGÍSTICA CENTRO OESTE",
    instalacao: "VAN 18",
    dataHora: "01/06/2026 07:15",
    ultTrans: "há 1 h 38 min",
    status: "Downtime",
  },
  {
    cliente: "FROTA RÁPIDA LTDA",
    instalacao: "PICKUP 09",
    dataHora: "31/05/2026 22:03",
    ultTrans: "há 10 h 51 min",
    status: "Atraso",
  },
]

const CHART_SEGMENTS: DonutSegment[] = [
  { label: "Ligado", value: MOCK_STATUS.ligado, color: "#2ecc71" },
  { label: "Desligado", value: MOCK_STATUS.desligado, color: "#3498db" },
  { label: "Downtime", value: MOCK_STATUS.downtime, color: "#e67e22" },
  { label: "Atraso", value: MOCK_STATUS.atraso, color: "#e74c3c" },
  { label: "Sem Posição", value: MOCK_STATUS.semPosicao, color: "#34495e" },
]

const Dashboard: React.FC = () => {
  return (
    <div className="monitoring-dashboard">
      <h1 className="monitoring-dashboard__title">Dashboard</h1>

      <div className="monitoring-dashboard__totals">
        <div className="monitoring-dashboard__total-item">
          <span className="monitoring-dashboard__total-value">
            {MOCK_TOTAL_INSTALACOES}
          </span>
          <span className="monitoring-dashboard__total-label">
            Total de Instalação
          </span>
        </div>
        <div className="monitoring-dashboard__total-item">
          <span className="monitoring-dashboard__total-value">
            {MOCK_TOTAL_ATIVAS}
          </span>
          <span className="monitoring-dashboard__total-label">
            Total de Instalação (Ativo)
          </span>
        </div>
      </div>

      <div className="monitoring-dashboard__status-row">
        {STATUS_CARDS.map((card) => (
          <div
            key={card.key}
            className={`monitoring-status-card ${card.className}`}
          >
            <span className="monitoring-status-card__value">
              {MOCK_STATUS[card.key]}
            </span>
            <span className="monitoring-status-card__label">{card.label}</span>
            <span className="monitoring-status-card__icon">{card.icon}</span>
          </div>
        ))}
      </div>

      <div className="monitoring-dashboard__bottom">
        <div className="monitoring-dashboard__table-panel">
          <div className="monitoring-dashboard__table-wrap">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th className="monitoring-table__num">#</th>
                  <th>Cliente</th>
                  <th>Instalação</th>
                  <th>Data/Hora</th>
                  <th>Últ. Trans.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TABLE.map((row, index) => (
                  <tr key={`${row.cliente}-${row.instalacao}-${index}`}>
                    <td className="monitoring-table__num">{index + 1}</td>
                    <td>{row.cliente}</td>
                    <td>{row.instalacao}</td>
                    <td
                      className={
                        row.dataHora === "---"
                          ? "monitoring-table__empty"
                          : undefined
                      }
                    >
                      {row.dataHora}
                    </td>
                    <td
                      className={
                        row.ultTrans === "---"
                          ? "monitoring-table__empty"
                          : undefined
                      }
                    >
                      {row.ultTrans}
                    </td>
                    <td
                      className={
                        row.status === "---"
                          ? "monitoring-table__empty"
                          : undefined
                      }
                    >
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="monitoring-dashboard__chart-panel">
          <button
            type="button"
            className="monitoring-dashboard__chart-menu"
            aria-label="Opções do gráfico"
          >
            <Menu size={18} />
          </button>
          <MonitoringSemiDonut segments={CHART_SEGMENTS} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
