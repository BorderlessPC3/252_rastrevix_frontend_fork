"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { frotaService, type VeiculoFrota } from "../services/frotaService"
import { clienteService, type Cliente } from "../services/clienteService"
import { exportToPDF, exportToXLSX } from "../utils/exportUtils"
import { showError, showSuccess } from "../utils/toast"
import "../styles/maps.css"
import "../styles/dashboard-pages.css"

const HistoricoRotas: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)
  const replayMarkerRef = useRef<L.CircleMarker | null>(null)
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [veiculos, setVeiculos] = useState<VeiculoFrota[]>([])
  const [clienteId, setClienteId] = useState("")
  const [veiculoId, setVeiculoId] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [horaInicio, setHoraInicio] = useState("00:00")
  const [dataFim, setDataFim] = useState("")
  const [horaFim, setHoraFim] = useState("23:59")
  const [loading, setLoading] = useState(false)
  const [distanciaKm, setDistanciaKm] = useState(0)
  const [duracaoMinutos, setDuracaoMinutos] = useState(0)
  const [pontos, setPontos] = useState<Array<{ lat: number; lng: number; ts: string }>>([])
  const [replaying, setReplaying] = useState(false)
  const [replayIndex, setReplayIndex] = useState(0)

  useEffect(() => {
    const hoje = new Date()
    const iso = hoje.toISOString().split("T")[0]
    setDataInicio(iso)
    setDataFim(iso)
    clienteService.listarClientes({ limit: 500 }).then((r) => setClientes(r.data.clientes))
  }, [])

  useEffect(() => {
    if (!clienteId) {
      setVeiculos([])
      return
    }
    frotaService.listar({ clienteId }).then((r) => setVeiculos(r.veiculos))
  }, [clienteId])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    const map = L.map(mapRef.current).setView([-14.235, -51.9253], 5)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OSM",
    }).addTo(map)
    mapInstanceRef.current = map
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  const buildIsoRange = () => {
    const ini = `${dataInicio}T${horaInicio}:00`
    const fim = `${dataFim}T${horaFim}:59`
    return { dataInicio: new Date(ini).toISOString(), dataFim: new Date(fim).toISOString() }
  }

  const desenharRota = useCallback((coords: Array<[number, number]>) => {
    const map = mapInstanceRef.current
    if (!map) return
    if (polylineRef.current) map.removeLayer(polylineRef.current)
    if (replayMarkerRef.current) map.removeLayer(replayMarkerRef.current)
    if (coords.length === 0) return

    polylineRef.current = L.polyline(coords, { color: "#00d9ff", weight: 4, opacity: 0.85 }).addTo(map)
    map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] })

    replayMarkerRef.current = L.circleMarker(coords[0], {
      radius: 8,
      fillColor: "#10b981",
      color: "#fff",
      weight: 2,
      fillOpacity: 1,
    }).addTo(map)
  }, [])

  const carregarRota = async () => {
    if (!veiculoId || !dataInicio || !dataFim) {
      showError("Selecione veículo e período")
      return
    }
    try {
      setLoading(true)
      pararReplay()
      const { dataInicio: di, dataFim: df } = buildIsoRange()
      const rota = await frotaService.obterRota(veiculoId, di, df)
      const pts = rota.pontos
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({
          lat: p.latitude!,
          lng: p.longitude!,
          ts: p.timestamp,
        }))
      setPontos(pts)
      setDistanciaKm(rota.distanciaKm)
      setDuracaoMinutos(rota.duracaoMinutos)
      desenharRota(pts.map((p) => [p.lat, p.lng] as [number, number]))
      showSuccess(`Rota carregada: ${pts.length} pontos`)
    } catch (e) {
      showError(e instanceof Error ? e.message : "Erro ao carregar rota")
    } finally {
      setLoading(false)
    }
  }

  const pararReplay = () => {
    if (replayTimerRef.current) clearInterval(replayTimerRef.current)
    replayTimerRef.current = null
    setReplaying(false)
    setReplayIndex(0)
  }

  const iniciarReplay = () => {
    if (pontos.length < 2) {
      showError("Carregue uma rota com pelo menos 2 pontos")
      return
    }
    pararReplay()
    setReplaying(true)
    let idx = 0
    replayTimerRef.current = setInterval(() => {
      idx += 1
      if (idx >= pontos.length) {
        pararReplay()
        return
      }
      setReplayIndex(idx)
      const p = pontos[idx]
      replayMarkerRef.current?.setLatLng([p.lat, p.lng])
      mapInstanceRef.current?.panTo([p.lat, p.lng], { animate: true })
    }, 400)
  }

  const exportarExcel = async () => {
    if (!pontos.length) return
    const cols = [
      { key: "ordem", label: "Ordem" },
      { key: "latitude", label: "Latitude" },
      { key: "longitude", label: "Longitude" },
      { key: "timestamp", label: "Data/Hora" },
    ]
    await exportToXLSX(
      pontos.map((p, i) => ({
        ordem: i + 1,
        latitude: p.lat,
        longitude: p.lng,
        timestamp: new Date(p.ts).toLocaleString("pt-BR"),
      })),
      "historico-rota",
      cols
    )
  }

  const exportarPdf = async () => {
    if (!pontos.length) return
    const cols = [
      { key: "ordem", label: "#" },
      { key: "lat", label: "Lat" },
      { key: "lng", label: "Lng" },
      { key: "ts", label: "Data/Hora" },
    ]
    await exportToPDF(
      pontos.map((p, i) => ({
        ordem: i + 1,
        lat: p.lat.toFixed(6),
        lng: p.lng.toFixed(6),
        ts: new Date(p.ts).toLocaleString("pt-BR"),
      })),
      "historico-rota",
      `Histórico de Rota (${distanciaKm} km / ${duracaoMinutos} min)`,
      cols
    )
  }

  return (
    <div className="dashboard-page historico-rotas-page">
      <div className="page-header">
        <h1>Histórico e Replay de Rotas</h1>
      </div>

      <div className="historico-filters form-grid">
        <div className="form-group">
          <label>Cliente</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className="form-input">
            <option value="">Selecione</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Veículo</label>
          <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} className="form-input">
            <option value="">Selecione</option>
            {veiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.nome} — {v.placa || v.codigo}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Data início</label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label>Hora início</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label>Data fim</label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label>Hora fim</label>
          <input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="form-input" />
        </div>
      </div>

      <div className="historico-actions">
        <button type="button" className="btn-primary" onClick={carregarRota} disabled={loading}>
          {loading ? "Carregando…" : "Carregar rota"}
        </button>
        <button type="button" className="btn-secondary" onClick={iniciarReplay} disabled={replaying || pontos.length < 2}>
          Replay
        </button>
        <button type="button" className="btn-secondary" onClick={pararReplay} disabled={!replaying}>
          Parar
        </button>
        <button type="button" className="btn-secondary" onClick={exportarExcel} disabled={!pontos.length}>
          Excel
        </button>
        <button type="button" className="btn-secondary" onClick={exportarPdf} disabled={!pontos.length}>
          PDF
        </button>
      </div>

      <div className="historico-stats">
        <span>Distância: <strong>{distanciaKm} km</strong></span>
        <span>Duração: <strong>{duracaoMinutos} min</strong></span>
        <span>Pontos: <strong>{pontos.length}</strong></span>
        {replaying && <span>Replay: {replayIndex + 1}/{pontos.length}</span>}
      </div>

      <div ref={mapRef} className="map historico-map" />
    </div>
  )
}

export default HistoricoRotas
