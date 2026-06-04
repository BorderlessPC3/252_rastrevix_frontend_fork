import type React from "react"
import {
  ToggleLeft,
  ToggleRight,
  Wrench,
  WifiOff,
  Clock,
  X,
  MoreHorizontal,
  Activity,
  Truck,
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
    icon: <ToggleRight size={20} strokeWidth={2} />,
  },
  {
    key: "desligado",
    label: "Desligado",
    className: "monitoring-status-card--desligado",
    icon: <ToggleLeft size={20} strokeWidth={2} />,
  },
  {
    key: "manutencao",
    label: "Manutenção",
    className: "monitoring-status-card--manutencao",
    icon: <Wrench size={20} strokeWidth={2} />,
  },
  {
    key: "downtime",
    label: "Downtime",
    className: "monitoring-status-card--downtime",
    icon: <WifiOff size={20} strokeWidth={2} />,
  },
  {
    key: "atraso",
    label: "Atraso",
    className: "monitoring-status-card--atraso",
    icon: <Clock size={20} strokeWidth={2} />,
  },
  {
    key: "semPosicao",
    label: "Sem Posição",
    className: "monitoring-status-card--sem-posicao",
    icon: <X size={20} strokeWidth={2.5} />,
  },
  {
    key: "ocultos",
    label: "Ocultos",
    className: "monitoring-status-card--ocultos",
    icon: <X size={20} strokeWidth={2.5} />,
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
  { label: "Ligado", value: MOCK_STATUS.ligado, color: "#22c55e" },
  { label: "Desligado", value: MOCK_STATUS.desligado, color: "#3b82f6" },
  { label: "Downtime", value: MOCK_STATUS.downtime, color: "#f97316" },
  { label: "Atraso", value: MOCK_STATUS.atraso, color: "#ef4444" },
  { label: "Sem Posição", value: MOCK_STATUS.semPosicao, color: "#475569" },
]

const STATUS_BADGE_CLASS: Record<string, string> = {
  Ligado: "ligado",
  Desligado: "desligado",
  Downtime: "downtime",
  Atraso: "atraso",
  "Sem Posição": "sem-posicao",
  Manutenção: "manutencao",
}

function TableStatusCell({ status }: { status: string }) {
  if (status === "---") {
    return <span className="monitoring-table__empty">—</span>
  }
  const variant = STATUS_BADGE_CLASS[status] ?? "neutral"
  return (
    <span className={`monitoring-table__badge monitoring-table__badge--${variant}`}>
      {status}
    </span>
  )
}

const Dashboard: React.FC = () => {
  const ativasPercent = Math.round((MOCK_TOTAL_ATIVAS / MOCK_TOTAL_INSTALACOES) * 100)

  return (
    <div className="monitoring-dashboard">
      <header className="monitoring-dashboard__header">
        <div className="monitoring-dashboard__header-text">
          <span className="monitoring-dashboard__eyebrow">Monitoramento em tempo real</span>
          <h1 className="monitoring-dashboard__title">Dashboard</h1>
        </div>
        <div className="monitoring-dashboard__header-meta">
          <span className="monitoring-dashboard__live">
            <span className="monitoring-dashboard__live-dot" aria-hidden />
            Frota ativa
          </span>
        </div>
      </header>

      <section className="monitoring-dashboard__kpis" aria-label="Totais">
        <article className="monitoring-kpi">
          <div className="monitoring-kpi__icon" aria-hidden>
            <Truck size={22} strokeWidth={1.75} />
          </div>
          <div className="monitoring-kpi__body">
            <span className="monitoring-kpi__value">{MOCK_TOTAL_INSTALACOES}</span>
            <span className="monitoring-kpi__label">Total de instalações</span>
          </div>
        </article>
        <article className="monitoring-kpi monitoring-kpi--accent">
          <div className="monitoring-kpi__icon" aria-hidden>
            <Activity size={22} strokeWidth={1.75} />
          </div>
          <div className="monitoring-kpi__body">
            <span className="monitoring-kpi__value">{MOCK_TOTAL_ATIVAS}</span>
            <span className="monitoring-kpi__label">
              Instalações ativas
              <span className="monitoring-kpi__chip">{ativasPercent}%</span>
            </span>
          </div>
        </article>
      </section>

      <section className="monitoring-dashboard__status-row" aria-label="Status da frota">
        {STATUS_CARDS.map((card, index) => (
          <div
            key={card.key}
            className={`monitoring-status-card ${card.className}`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="monitoring-status-card__icon" aria-hidden>
              {card.icon}
            </span>
            <span className="monitoring-status-card__value">
              {MOCK_STATUS[card.key]}
            </span>
            <span className="monitoring-status-card__label">{card.label}</span>
          </div>
        ))}
      </section>

      <div className="monitoring-dashboard__bottom">
        <section className="monitoring-dashboard__table-panel">
          <div className="monitoring-panel__head">
            <div>
              <h2 className="monitoring-panel__title">Instalações</h2>
              <p className="monitoring-panel__subtitle">
                {MOCK_TABLE.length} registros na visualização
              </p>
            </div>
          </div>
          <div className="monitoring-dashboard__table-wrap">
            <table className="monitoring-table">
              <thead>
                <tr>
                  <th className="monitoring-table__num">#</th>
                  <th>Cliente</th>
                  <th>Instalação</th>
                  <th>Data/Hora</th>
                  <th>Últ. trans.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TABLE.map((row, index) => (
                  <tr key={`${row.cliente}-${row.instalacao}-${index}`}>
                    <td className="monitoring-table__num">{index + 1}</td>
                    <td className="monitoring-table__cliente">{row.cliente}</td>
                    <td>
                      <span className="monitoring-table__instalacao">{row.instalacao}</span>
                    </td>
                    <td
                      className={
                        row.dataHora === "---"
                          ? "monitoring-table__empty"
                          : "monitoring-table__datetime"
                      }
                    >
                      {row.dataHora === "---" ? "—" : row.dataHora}
                    </td>
                    <td
                      className={
                        row.ultTrans === "---"
                          ? "monitoring-table__empty"
                          : "monitoring-table__trans"
                      }
                    >
                      {row.ultTrans === "---" ? "—" : row.ultTrans}
                    </td>
                    <td>
                      <TableStatusCell status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="monitoring-dashboard__chart-panel">
          <div className="monitoring-panel__head">
            <div>
              <h2 className="monitoring-panel__title">Distribuição</h2>
              <p className="monitoring-panel__subtitle">Por status operacional</p>
            </div>
            <button
              type="button"
              className="monitoring-dashboard__chart-menu"
              aria-label="Opções do gráfico"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
          <MonitoringSemiDonut segments={CHART_SEGMENTS} />
        </section>
      </div>
    </div>
  )
}

export default Dashboard
