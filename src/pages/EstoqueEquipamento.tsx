"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Search, Plus, Download, Trash2 } from "lucide-react"
import { showSuccess } from "../utils/toast"
import { useAuth } from "../contexts/AuthContext"
import { canManageCadastros } from "../utils/rbac"
import "../styles/dashboard-pages.css"
import "../styles/estoque.css"

interface EquipamentoItem {
  id: string
  serial: string
  cliente: string
  veicInstal: string
  tipoEquip: string
  gsm: string
  numeroGsm: string
  matrizFranquia: string
}

const MOCK_EQUIPAMENTOS: EquipamentoItem[] = [
  {
    id: "1",
    serial: "205716003",
    cliente: "PM-MUCURICI/ES",
    veicInstal: "ESTOQUE 108",
    tipoEquip: "ST300HD",
    gsm: "89551805670303652088",
    numeroGsm: "5531910137109",
    matrizFranquia: "---",
  },
  {
    id: "2",
    serial: "205735722",
    cliente: "PM PINHEIROS/ES",
    veicInstal: "FIESTA-OCY-5A83-CULTURA",
    tipoEquip: "ST300HD",
    gsm: "89551805670303652101",
    numeroGsm: "5531999887766",
    matrizFranquia: "---",
  },
  {
    id: "3",
    serial: "205735728",
    cliente: "ARITUR TRANSPORTE E TURISMO LTDA",
    veicInstal: "ESTOQUE 12",
    tipoEquip: "ST300HD",
    gsm: "89551805670303652118",
    numeroGsm: "5531988776655",
    matrizFranquia: "---",
  },
  {
    id: "4",
    serial: "205735736",
    cliente: "EXPRESSA TRANSPORTES LTDA",
    veicInstal: "ESTOQUE 06",
    tipoEquip: "ST300HD",
    gsm: "89551805670303652125",
    numeroGsm: "5531977665544",
    matrizFranquia: "---",
  },
  {
    id: "5",
    serial: "205735747",
    cliente: "PM PINHEIROS/ES",
    veicInstal: "SPIN-RBE-0B93-SAUDE",
    tipoEquip: "ST300HD",
    gsm: "89551805670303652132",
    numeroGsm: "5531966554433",
    matrizFranquia: "---",
  },
  {
    id: "6",
    serial: "205735751",
    cliente: "rastrevix",
    veicInstal: "teste motorista",
    tipoEquip: "ST310U",
    gsm: "89551805670303652149",
    numeroGsm: "5531955443322",
    matrizFranquia: "MATRIZ SP",
  },
]

function matchesSearch(item: EquipamentoItem, term: string): boolean {
  const q = term.trim().toLowerCase()
  if (!q) return true
  return [
    item.serial,
    item.cliente,
    item.veicInstal,
    item.tipoEquip,
    item.gsm,
    item.numeroGsm,
    item.matrizFranquia,
  ].some((v) => v.toLowerCase().includes(q))
}

const EstoqueEquipamento: React.FC = () => {
  const { user } = useAuth()
  const canManage = canManageCadastros(user?.role)
  const [equipamentos, setEquipamentos] = useState(MOCK_EQUIPAMENTOS)
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = useMemo(
    () => equipamentos.filter((e) => matchesSearch(e, searchTerm)),
    [equipamentos, searchTerm],
  )

  const handleExcluir = (item: EquipamentoItem) => {
    if (!window.confirm(`Excluir o equipamento ${item.serial}?`)) return
    setEquipamentos((prev) => prev.filter((e) => e.id !== item.id))
    showSuccess("Equipamento removido da lista.")
  }

  const handleExportar = () => {
    const header =
      "Serial;Cliente;Veic. Instal.;Tipo Equip.;GSM;Nº GSM;Matriz/Franquia"
    const rows = filtered.map(
      (e) =>
        `${e.serial};${e.cliente};${e.veicInstal};${e.tipoEquip};${e.gsm};${e.numeroGsm};${e.matrizFranquia}`,
    )
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "equipamentos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="dashboard-page estoque-page equipamento-page">
      <div className="page-header">
        <h1 className="page-title">ESTOQUE · EQUIPAMENTO</h1>
      </div>

      <div className="page-content">
        <div className="search-section equipamento-toolbar">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Procurar Equipamento"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="equipamento-toolbar__actions">
            {canManage && (
              <button
                type="button"
                className="btn-equipamento-novo"
                onClick={() => showSuccess("Cadastro de equipamento em breve.")}
              >
                <Plus size={18} />
                Novo
              </button>
            )}
            <button
              type="button"
              className="btn-equipamento-download"
              onClick={handleExportar}
              title="Exportar lista"
              aria-label="Exportar lista"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="equipamento-table-container">
          {filtered.length === 0 ? (
            <div className="no-results">
              <p>Nenhum equipamento encontrado.</p>
            </div>
          ) : (
            <div className="equipamento-table">
              {filtered.map((item, index) => (
                <div key={item.id} className="equipamento-row">
                  <div className="equipamento-row__index">{index + 1}</div>
                  <div className="equipamento-row__serial">{item.serial}</div>

                  <div className="equipamento-row__fields">
                    <div className="equip-field">
                      <span className="equip-field__label">Cliente</span>
                      <span className="equip-field__value">{item.cliente}</span>
                    </div>
                    <div className="equip-field">
                      <span className="equip-field__label">Veic. Instal.</span>
                      <span className="equip-field__value">
                        {item.veicInstal}
                      </span>
                    </div>
                    <div className="equip-field">
                      <span className="equip-field__label">Tipo Equip.</span>
                      <span className="equip-field__value">
                        {item.tipoEquip}
                      </span>
                    </div>
                    <div className="equip-field">
                      <span className="equip-field__label">GSM</span>
                      <span className="equip-field__value equip-field__value--mono">
                        {item.gsm}
                      </span>
                    </div>
                    <div className="equip-field">
                      <span className="equip-field__label">Nº GSM</span>
                      <span className="equip-field__value equip-field__value--mono">
                        {item.numeroGsm}
                      </span>
                    </div>
                    <div className="equip-field">
                      <span className="equip-field__label">Matriz/Franquia</span>
                      <span className="equip-field__value equip-field__value--muted">
                        {item.matrizFranquia}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="equipamento-row__actions">
                      <button
                        type="button"
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleExcluir(item)}
                        title="Excluir"
                        aria-label={`Excluir equipamento ${item.serial}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EstoqueEquipamento
