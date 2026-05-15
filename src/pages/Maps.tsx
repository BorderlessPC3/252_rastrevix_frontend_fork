"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "../styles/maps.css"
import { frotaService, type VeiculoFrota } from "../services/frotaService"
import { socketService } from "../services/socketService"
import { apiService } from "../services/api"
import { Link } from "react-router-dom"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const Maps: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const tileLayerRef = useRef<L.TileLayer | null>(null)
  const veiculosRef = useRef<VeiculoFrota[]>([])

  const [veiculos, setVeiculos] = useState<VeiculoFrota[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapType, setMapType] = useState<"mapa" | "satelite">("mapa")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [eventosRecentes, setEventosRecentes] = useState<string[]>([])

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleString("pt-BR")
    } catch {
      return "N/A"
    }
  }

  const getVehicleIcon = (tipo?: string, isSelected = false) => {
    const size = isSelected ? 32 : 24
    const color = "#22c55e"
    const isBus = tipo === "onibus"
    return L.divIcon({
      className: "vehicle-marker",
      html: isBus
        ? `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${color}" d="M4 6h16v11H4V6zm2 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm12 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>`
        : `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="${color}" d="M5 11l1.5-5h11L19 11v8H5v-8zm2 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    })
  }

  const updateMarker = useCallback((v: VeiculoFrota, animate = false) => {
    const map = mapInstanceRef.current
    const pos = v.posicaoAtual
    if (!map || !pos?.latitude || !pos?.longitude) return

    const latLng: L.LatLngExpression = [pos.latitude, pos.longitude]
    const placa = v.placa || v.codigo
    const vel = Math.round(pos.velocidade || 0)
    const isSelected = selectedId === v.id
    const tipo = v.tipoVeiculo || "carro"

    let marker = markersRef.current.get(v.id)
    if (!marker) {
      marker = L.marker(latLng, { icon: getVehicleIcon(tipo, isSelected) }).addTo(map)
      marker.on("click", () => {
        setSelectedId(v.id)
        document.getElementById(`veiculo-${v.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      })
      markersRef.current.set(v.id, marker)
    } else {
      if (animate) {
        marker.setLatLng(latLng)
      } else {
        marker.setLatLng(latLng)
      }
      marker.setIcon(getVehicleIcon(tipo, isSelected))
    }

    marker.bindPopup(
      `<div style="text-align:center"><b>${v.nome}</b><br/>${placa}<br/>${vel} km/h</div>`
    )
  }, [selectedId])

  const syncMarkers = useCallback((lista: VeiculoFrota[]) => {
    lista.forEach((v) => updateMarker(v))
    const ids = new Set(lista.map((v) => v.id))
    markersRef.current.forEach((marker, id) => {
      if (!ids.has(id)) {
        mapInstanceRef.current?.removeLayer(marker)
        markersRef.current.delete(id)
      }
    })
  }, [updateMarker])

  const applyPosicaoUpdate = useCallback((rastreadorId: string, posicao: VeiculoFrota["posicaoAtual"]) => {
    setVeiculos((prev) => {
      const next = prev.map((v) => {
        const rid = v.rastreadorId || v.id
        if (rid !== rastreadorId) return v
        return { ...v, posicaoAtual: posicao }
      })
      veiculosRef.current = next
      const updated = next.find((v) => (v.rastreadorId || v.id) === rastreadorId)
      if (updated) updateMarker(updated, true)
      return next
    })
  }, [updateMarker])

  const loadVeiculos = async () => {
    try {
      setLoading(true)
      setError(null)
      const lista = await frotaService.listarMapa()
      veiculosRef.current = lista
      setVeiculos(lista)
      syncMarkers(lista)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar frota")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([-14.235, -51.9253], 5)
      tileLayerRef.current = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap", maxZoom: 19 }
      ).addTo(map)
      mapInstanceRef.current = map
      loadVeiculos()
    }
    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    syncMarkers(veiculos)
  }, [veiculos, selectedId, syncMarkers])

  useEffect(() => {
    const token = apiService.getAccessToken()
    if (!token) return

    const socket = socketService.connect(token)
    socketService.subscribeAll()

    const onConnect = () => setWsConnected(true)
    const onDisconnect = () => setWsConnected(false)
    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    if (socket.connected) setWsConnected(true)

    const unsubPos = socketService.onPosicaoAtualizada(({ rastreadorId, posicao }) => {
      applyPosicaoUpdate(rastreadorId, posicao)
    })

    const unsubEvt = socketService.onEventoNovo(({ rastreadorId, evento }) => {
      const label = `${evento.eventoNome || evento.eventoId} — ${rastreadorId.slice(0, 8)}`
      setEventosRecentes((prev) => [label, ...prev].slice(0, 8))
    })

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      unsubPos()
      unsubEvt()
    }
  }, [applyPosicaoUpdate])

  const toggleMapType = (newType: "mapa" | "satelite") => {
    const map = mapInstanceRef.current
    if (!map || mapType === newType) return
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current)
    tileLayerRef.current =
      newType === "satelite"
        ? L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            { attribution: "© Esri", maxZoom: 19 }
          )
        : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
            maxZoom: 19,
          })
    tileLayerRef.current.addTo(map)
    setMapType(newType)
  }

  const centerOn = (v: VeiculoFrota) => {
    const pos = v.posicaoAtual
    if (!pos?.latitude || !pos?.longitude || !mapInstanceRef.current) return
    mapInstanceRef.current.setView([pos.latitude, pos.longitude], 15)
    setSelectedId(v.id)
  }

  return (
    <div className="maps-container">
      <div className="maps-status-bar">
        <span className={wsConnected ? "ws-on" : "ws-off"}>
          {wsConnected ? "● Tempo real ativo" : "○ Reconectando..."}
        </span>
        <Link to="/mapa/historico" className="btn-link-mapa">
          Histórico / Replay
        </Link>
      </div>
      {eventosRecentes.length > 0 && (
        <div className="maps-eventos-feed">
          {eventosRecentes.map((e, i) => (
            <span key={i} className="evento-chip">{e}</span>
          ))}
        </div>
      )}
      <div className="vehicles-cards-container">
        <div className="vehicles-cards-scroll">
          {loading && veiculos.length === 0 ? (
            <div className="loading-cards">Carregando veículos...</div>
          ) : veiculos.length === 0 ? (
            <div className="no-vehicles">Nenhum veículo com posição GPS</div>
          ) : (
            veiculos.map((v) => {
              const pos = v.posicaoAtual
              const vel = Math.round(pos?.velocidade || 0)
              const placa = v.placa || v.codigo
              const isSelected = selectedId === v.id
              return (
                <div
                  key={v.id}
                  id={`veiculo-${v.id}`}
                  className={`vehicle-card ${isSelected ? "selected" : ""}`}
                  onClick={() => centerOn(v)}
                >
                  <div className="vehicle-card-content">
                    <div className="vehicle-card-header">
                      <span className="vehicle-name">{v.nome}</span>
                      <span className="vehicle-placa">{placa}</span>
                    </div>
                    <div className="vehicle-card-info">
                      <span>Atualização: {formatDateTime(pos?.timestamp)}</span>
                      <span>{vel} km/h</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <div ref={mapRef} className="map">
        <div className="map-controls">
          <button
            type="button"
            className={`map-control-btn ${mapType === "mapa" ? "active" : ""}`}
            onClick={() => toggleMapType("mapa")}
          >
            Mapa
          </button>
          <button
            type="button"
            className={`map-control-btn ${mapType === "satelite" ? "active" : ""}`}
            onClick={() => toggleMapType("satelite")}
          >
            Satélite
          </button>
        </div>
      </div>
      {error && <div className="error-message maps-error">{error}</div>}
    </div>
  )
}

export default Maps
