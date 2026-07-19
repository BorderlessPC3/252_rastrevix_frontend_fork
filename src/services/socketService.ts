import { collection, onSnapshot } from 'firebase/firestore';
import { io, type Socket } from 'socket.io-client';
import type { DadosRastreador, EventoRastreador } from '../types';
import { useFirebaseDirect } from '../config/firebase';
import { getDb } from '../firebase/app';
import { COLLECTIONS } from '../firebase/collections';
import { docToRecord, toNumber } from '../firebase/helpers';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export type PosicaoAtualizadaPayload = {
  rastreadorId: string;
  posicao: DadosRastreador;
  timestamp: string;
};

export type EventoNovoPayload = {
  rastreadorId: string;
  evento: EventoRastreador;
  timestamp: string;
};

type Handler<T> = (payload: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private firestoreUnsubs: Array<() => void> = [];
  private posicaoHandlers = new Set<Handler<PosicaoAtualizadaPayload>>();
  private eventoHandlers = new Set<Handler<EventoNovoPayload>>();
  private dadosHandlers = new Set<Handler<{ rastreadorId: string; dados: DadosRastreador }>>();
  private filteredRastreadorId: string | null = null;
  private lastPosicaoByRastreador = new Map<string, string>();

  connect(accessToken: string): Socket | null {
    if (useFirebaseDirect()) {
      this.token = accessToken;
      this.startFirestoreListeners();
      return null;
    }

    if (this.socket?.connected && this.token === accessToken) {
      return this.socket;
    }

    this.disconnect();
    this.token = accessToken;

    this.socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      reconnectionAttempts: Infinity,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.info('[Socket] Conectado', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Desconectado:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Erro de conexão:', err.message);
    });

    return this.socket;
  }

  /** Firestore em tempo real (modo VITE_USE_FIREBASE=true). */
  connectFirestoreRealtime(): void {
    if (!useFirebaseDirect()) return;
    this.startFirestoreListeners();
  }

  private normalizeDados(raw: Record<string, unknown>): DadosRastreador {
    return {
      id: String(raw.id),
      rastreadorId: String(raw.rastreadorId ?? ''),
      timestamp: String(raw.timestamp ?? new Date().toISOString()),
      latitude: toNumber(raw.latitude),
      longitude: toNumber(raw.longitude),
      altitude: toNumber(raw.altitude),
      velocidade: toNumber(raw.velocidade),
      direcao: toNumber(raw.direcao),
      satelites: toNumber(raw.satelites),
      ignicao: raw.ignicao as boolean | undefined,
      odometro: toNumber(raw.odometro),
      horimetro: toNumber(raw.horimetro),
      tensaoEntrada: toNumber(raw.tensaoEntrada),
      tensaoBateria: toNumber(raw.tensaoBateria),
      velocidadeCAN: toNumber(raw.velocidadeCAN),
      rpm: toNumber(raw.rpm),
      combustivel: toNumber(raw.combustivel),
      temperatura: toNumber(raw.temperatura),
      canAtivo: raw.canAtivo as boolean | undefined,
      eventoId: toNumber(raw.eventoId),
      eventoStatus: raw.eventoStatus as string | undefined,
      eventoNome: raw.eventoNome as string | undefined
    };
  }

  private startFirestoreListeners(): void {
    this.stopFirestoreListeners();

    const dadosQ = collection(getDb(), COLLECTIONS.dadosRastreador);

    this.firestoreUnsubs.push(
      onSnapshot(dadosQ, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') return;
          const raw = docToRecord(change.doc.id, change.doc.data() as Record<string, unknown>);
          const dados = this.normalizeDados(raw);
          const rastreadorId = dados.rastreadorId;
          if (!rastreadorId) return;
          if (dados.latitude == null || dados.longitude == null) return;
          if (this.filteredRastreadorId && this.filteredRastreadorId !== rastreadorId) return;

          const dedupeKey = `${rastreadorId}:${raw.timestamp}`;
          if (this.lastPosicaoByRastreador.get(rastreadorId) === dedupeKey) return;
          this.lastPosicaoByRastreador.set(rastreadorId, dedupeKey);

          const payload: PosicaoAtualizadaPayload = {
            rastreadorId,
            posicao: dados,
            timestamp: String(raw.timestamp ?? new Date().toISOString())
          };

          this.dadosHandlers.forEach((h) => h({ rastreadorId, dados }));
          this.posicaoHandlers.forEach((h) => h(payload));
        });
      })
    );

    const eventosQ = collection(getDb(), COLLECTIONS.eventosRastreador);

    this.firestoreUnsubs.push(
      onSnapshot(eventosQ, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') return;
          const raw = docToRecord(change.doc.id, change.doc.data() as Record<string, unknown>);
          const evento = raw as unknown as EventoRastreador;
          const rastreadorId = String(raw.rastreadorId ?? '');
          if (!rastreadorId) return;
          if (this.filteredRastreadorId && this.filteredRastreadorId !== rastreadorId) return;

          this.eventoHandlers.forEach((h) =>
            h({
              rastreadorId,
              evento,
              timestamp: String(raw.timestamp ?? new Date().toISOString())
            })
          );
        });
      })
    );

    const rastreadoresQ = collection(getDb(), COLLECTIONS.rastreadores);

    this.firestoreUnsubs.push(
      onSnapshot(rastreadoresQ, (snap) => {
        snap.docChanges().forEach((change) => {
          if (change.type === 'removed') return;
          const raw = docToRecord(change.doc.id, change.doc.data() as Record<string, unknown>);
          const rastreadorId = String(raw.id ?? change.doc.id);
          const lat = toNumber(raw.ultimaLatitude);
          const lng = toNumber(raw.ultimaLongitude);
          if (lat == null || lng == null) return;

          const dados: DadosRastreador = {
            id: `cache-${rastreadorId}`,
            rastreadorId,
            timestamp: String(raw.ultimaPosicaoGps ?? raw.ultimaComunicacao ?? new Date().toISOString()),
            latitude: lat,
            longitude: lng,
            velocidade: toNumber(raw.ultimaVelocidade),
            direcao: toNumber(raw.ultimaDirecao),
            ignicao: raw.ultimaIgnicao as boolean | undefined
          };

          const dedupeKey = `${rastreadorId}:${dados.timestamp}:${lat}:${lng}`;
          if (this.lastPosicaoByRastreador.get(rastreadorId) === dedupeKey) return;
          this.lastPosicaoByRastreador.set(rastreadorId, dedupeKey);

          const payload: PosicaoAtualizadaPayload = {
            rastreadorId,
            posicao: dados,
            timestamp: dados.timestamp
          };

          this.dadosHandlers.forEach((h) => h({ rastreadorId, dados }));
          this.posicaoHandlers.forEach((h) => h(payload));
        });
      })
    );

    console.info('[Firestore] Listeners de tempo real ativos (dados_rastreador + rastreadores)');
  }

  private stopFirestoreListeners(): void {
    this.firestoreUnsubs.forEach((u) => u());
    this.firestoreUnsubs = [];
    this.lastPosicaoByRastreador.clear();
  }

  disconnect(): void {
    this.stopFirestoreListeners();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
    this.filteredRastreadorId = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    if (useFirebaseDirect()) return this.firestoreUnsubs.length > 0;
    return !!this.socket?.connected;
  }

  subscribeRastreador(rastreadorId: string): void {
    if (useFirebaseDirect()) {
      this.filteredRastreadorId = rastreadorId;
      return;
    }
    this.socket?.emit('rastreador:filtros', { rastreadorId });
  }

  subscribeAll(): void {
    if (useFirebaseDirect()) {
      this.filteredRastreadorId = null;
      return;
    }
    this.socket?.emit('rastreador:filtros', {});
  }

  onPosicaoAtualizada(handler: Handler<PosicaoAtualizadaPayload>): () => void {
    if (useFirebaseDirect()) {
      this.posicaoHandlers.add(handler);
      return () => this.posicaoHandlers.delete(handler);
    }

    const fn = (payload: PosicaoAtualizadaPayload) => handler(payload);
    this.socket?.on('rastreador:posicao:atualizada', fn);
    return () => {
      this.socket?.off('rastreador:posicao:atualizada', fn);
    };
  }

  onEventoNovo(handler: Handler<EventoNovoPayload>): () => void {
    if (useFirebaseDirect()) {
      this.eventoHandlers.add(handler);
      return () => this.eventoHandlers.delete(handler);
    }

    const fn = (payload: EventoNovoPayload) => handler(payload);
    this.socket?.on('rastreador:evento:novo', fn);
    return () => {
      this.socket?.off('rastreador:evento:novo', fn);
    };
  }

  onDadosNovo(handler: Handler<{ rastreadorId: string; dados: DadosRastreador }>): () => void {
    if (useFirebaseDirect()) {
      this.dadosHandlers.add(handler);
      return () => this.dadosHandlers.delete(handler);
    }

    const fn = (payload: { rastreadorId: string; dados: DadosRastreador }) => handler(payload);
    this.socket?.on('rastreador:dados:novo', fn);
    return () => {
      this.socket?.off('rastreador:dados:novo', fn);
    };
  }
}

export const socketService = new SocketService();
export default socketService;
