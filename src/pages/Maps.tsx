"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import "../styles/maps.css"
import { frotaService, type VeiculoFrota } from "../services/frotaService"
import { socketService } from "../services/socketService"
import { apiService } from "../services/api"
import { useFirebaseDirect } from "../config/firebase"
import { Link } from "react-router-dom"
import PageFeedback from "../components/PageFeedback"
import GoogleMapContainer from "../components/GoogleMapContainer"
import { useGoogleMap, type GoogleMapType } from "../hooks/useGoogleMap"
import { createVehicleMarkerIcon } from "../lib/googleMapsMarkers"

const Maps: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const veiculosRef = useRef<VeiculoFrota[]>([])

  const { mapRef, ready, error, setMapType } = useGoogleMap(mapContainerRef)
  const mapLoading = !ready && !error

  const [veiculos, setVeiculos] = useState<VeiculoFrota[]>([])
  const [loading, setLoading] = useState(false)
  const [errorFrota, setErrorFrota] = useState<string | null>(null)
  const [mapType, setMapTypeState] = useState<"mapa" | "satelite">("mapa")
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

  const updateMarker = useCallback((v: VeiculoFrota) => {
    const map = mapRef.current
    const pos = v.posicaoAtual
    if (!map || !pos?.latitude || !pos?.longitude) return

    const position = { lat: pos.latitude, lng: pos.longitude }
    const placa = v.placa || v.codigo
    const vel = Math.round(pos.velocidade || 0)
    const isSelected = selectedId === v.id
    const tipo = v.tipoVeiculo || "carro"
    const icon = createVehicleMarkerIcon(tipo, isSelected)

    let marker = markersRef.current.get(v.id)
    if (!marker) {
      marker = new google.maps.Marker({
        position,
        map,
        icon,
        title: v.nome,
      })
      marker.addListener("click", () => {
        setSelectedId(v.id)
        document.getElementById(`veiculo-${v.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
        if (!infoWindowRef.current) {
          infoWindowRef.current = new google.maps.InfoWindow()
        }
        infoWindowRef.current.setContent(
          `<div style="text-align:center"><b>${v.nome}</b><br/>${placa}<br/>${vel} km/h</div>`
        )
        infoWindowRef.current.open({ map, anchor: marker })
      })
      markersRef.current.set(v.id, marker)
    } else {
      marker.setPosition(position)
      marker.setIcon(icon)
    }
  }, [mapRef, selectedId])

  const syncMarkers = useCallback((lista: VeiculoFrota[]) => {
    lista.forEach((v) => updateMarker(v))
    const ids = new Set(lista.map((v) => v.id))
    markersRef.current.forEach((marker, id) => {
      if (!ids.has(id)) {
        marker.setMap(null)
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
      if (updated) updateMarker(updated)
      return next
    })
  }, [updateMarker])

  const loadVeiculos = async () => {
    try {
      setLoading(true)
      setErrorFrota(null)
      const lista = await frotaService.listarMapa()
      veiculosRef.current = lista
      setVeiculos(lista)
      if (ready) syncMarkers(lista)
    } catch (err) {
      setErrorFrota(err instanceof Error ? err.message : "Erro ao carregar frota")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ready) {
      loadVeiculos()
    }
    return () => {
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current.clear()
      infoWindowRef.current?.close()
      infoWindowRef.current = null
    }
  }, [ready])

  useEffect(() => {
    if (ready) syncMarkers(veiculos)
  }, [veiculos, selectedId, ready, syncMarkers])

  useEffect(() => {
    let cancelled = false

    const setupRealtime = async () => {
      const token = (await apiService.getAccessTokenAsync()) || apiService.getAccessToken()
      if (!token || cancelled) return

      const socket = socketService.connect(token)
      socketService.subscribeAll()

      const onConnect = () => setWsConnected(true)
      const onDisconnect = () => setWsConnected(false)
      if (socket) {
        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        if (socket.connected) setWsConnected(true)
      } else if (useFirebaseDirect()) {
        setWsConnected(socketService.isConnected())
      }

      const unsubPos = socketService.onPosicaoAtualizada(({ rastreadorId, posicao }) => {
        applyPosicaoUpdate(rastreadorId, posicao)
      })

      const unsubEvt = socketService.onEventoNovo(({ rastreadorId, evento }) => {
        const label = `${evento.eventoNome || evento.eventoId} — ${rastreadorId.slice(0, 8)}`
        setEventosRecentes((prev) => [label, ...prev].slice(0, 8))
      })

      return () => {
        if (socket) {
          socket.off("connect", onConnect)
          socket.off("disconnect", onDisconnect)
        }
        unsubPos()
        unsubEvt()
      }
    }

    let cleanup: (() => void) | undefined
    void setupRealtime().then((fn) => {
      cleanup = fn
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [applyPosicaoUpdate])

  const toggleMapType = (newType: "mapa" | "satelite") => {
    if (mapType === newType) return
    const googleType: GoogleMapType = newType === "satelite" ? "satellite" : "roadmap"
    setMapType(googleType)
    setMapTypeState(newType)
  }

  const centerOn = (v: VeiculoFrota) => {
    const pos = v.posicaoAtual
    if (!pos?.latitude || !pos?.longitude || !mapRef.current) return
    mapRef.current.setCenter({ lat: pos.latitude, lng: pos.longitude })
    mapRef.current.setZoom(15)
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
            <PageFeedback loading loadingMessage="Carregando veículos…" />
          ) : veiculos.length === 0 ? (
            <PageFeedback empty emptyMessage="Nenhum veículo com posição GPS no momento." />
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
      <GoogleMapContainer
        mapRef={mapContainerRef}
        className="map"
        error={error}
        loading={mapLoading}
      >
        <div className="map-controls">
          <button
            type="button"
            className={`map-control-btn ${mapType === "mapa" ? "active" : ""}`}
            onClick={() => toggleMapType("mapa")}
            disabled={!ready}
          >
            Mapa
          </button>
          <button
            type="button"
            className={`map-control-btn ${mapType === "satelite" ? "active" : ""}`}
            onClick={() => toggleMapType("satelite")}
            disabled={!ready}
          >
            Satélite
          </button>
        </div>
      </GoogleMapContainer>
      {errorFrota && (
        <div className="maps-error-banner">
          <PageFeedback error={errorFrota} onRetry={() => void loadVeiculos()} />
        </div>
      )}
    </div>
  )
}

export default Maps
