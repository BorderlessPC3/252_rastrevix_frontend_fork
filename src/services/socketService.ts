import { io, type Socket } from 'socket.io-client';
import type { DadosRastreador, EventoRastreador } from '../types';

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

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(accessToken: string): Socket {
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

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.token = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  subscribeRastreador(rastreadorId: string): void {
    this.socket?.emit('rastreador:filtros', { rastreadorId });
  }

  subscribeAll(): void {
    this.socket?.emit('rastreador:filtros', {});
  }

  onPosicaoAtualizada(handler: (payload: PosicaoAtualizadaPayload) => void): () => void {
    const fn = (payload: PosicaoAtualizadaPayload) => handler(payload);
    this.socket?.on('rastreador:posicao:atualizada', fn);
    return () => {
      this.socket?.off('rastreador:posicao:atualizada', fn);
    };
  }

  onEventoNovo(handler: (payload: EventoNovoPayload) => void): () => void {
    const fn = (payload: EventoNovoPayload) => handler(payload);
    this.socket?.on('rastreador:evento:novo', fn);
    return () => {
      this.socket?.off('rastreador:evento:novo', fn);
    };
  }

  onDadosNovo(handler: (payload: { rastreadorId: string; dados: DadosRastreador }) => void): () => void {
    const fn = (payload: { rastreadorId: string; dados: DadosRastreador }) => handler(payload);
    this.socket?.on('rastreador:dados:novo', fn);
    return () => {
      this.socket?.off('rastreador:dados:novo', fn);
    };
  }
}

export const socketService = new SocketService();
export default socketService;
