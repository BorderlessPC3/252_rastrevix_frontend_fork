"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { frotaService, type VeiculoFrota } from "../services/frotaService"
import { clienteService, type Cliente } from "../services/clienteService"
import { exportToPDF, exportToXLSX } from "../utils/exportUtils"
import { showError, showSuccess } from "../utils/toast"
import GoogleMapContainer from "../components/GoogleMapContainer"
import { useGoogleMap } from "../hooks/useGoogleMap"
import { createReplayMarkerIcon } from "../lib/googleMapsMarkers"
import { loadGoogleMaps } from "../lib/googleMapsLoader"
import "../styles/maps.css"
import "../styles/dashboard-pages.css"

const HistoricoRotas: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  const replayMarkerRef = useRef<google.maps.Marker | null>(null)
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { mapRef, ready, error } = useGoogleMap(mapContainerRef)
  const mapLoading = !ready && !error

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

  const clearRouteLayers = useCallback(() => {
    polylineRef.current?.setMap(null)
    polylineRef.current = null
    replayMarkerRef.current?.setMap(null)
    replayMarkerRef.current = null
  }, [])

  const desenharRota = useCallback(
    async (coords: Array<{ lat: number; lng: number }>) => {
      const map = mapRef.current
      if (!map) return

      clearRouteLayers()
      if (coords.length === 0) return

      await loadGoogleMaps()

      const path = coords.map((c) => ({ lat: c.lat, lng: c.lng }))

      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#00d9ff",
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      })

      const bounds = new google.maps.LatLngBounds()
      path.forEach((p) => bounds.extend(p))
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })

      replayMarkerRef.current = new google.maps.Marker({
        position: path[0],
        map,
        icon: createReplayMarkerIcon(),
      })
    },
    [mapRef, clearRouteLayers]
  )

  const buildIsoRange = () => {
    const ini = `${dataInicio}T${horaInicio}:00`
    const fim = `${dataFim}T${horaFim}:59`
    return { dataInicio: new Date(ini).toISOString(), dataFim: new Date(fim).toISOString() }
  }

  const carregarRota = async () => {
    if (!veiculoId || !dataInicio || !dataFim) {
      showError("Selecione veículo e período")
      return
    }
    if (!ready) {
      showError(error ?? "Aguarde o mapa carregar")
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
      await desenharRota(pts)
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
      replayMarkerRef.current?.setPosition({ lat: p.lat, lng: p.lng })
      mapRef.current?.panTo({ lat: p.lat, lng: p.lng })
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

  useEffect(() => () => clearRouteLayers(), [clearRouteLayers])

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
        <button type="button" className="btn-primary" onClick={carregarRota} disabled={loading || !ready}>
          {loading ? "Carregando…" : "Carregar rota"}
        </button>
        <button type="button" className="btn-secondary" onClick={iniciarReplay} disabled={replaying || pontos.length < 2 || !ready}>
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

      <GoogleMapContainer
        mapRef={mapContainerRef}
        className="map historico-map"
        error={error}
        loading={mapLoading}
      />
    </div>
  )
}

export default HistoricoRotas
