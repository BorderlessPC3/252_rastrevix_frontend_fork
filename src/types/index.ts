export type MaquinaFilters = {
    search?: string;
    status?: string;
    tipo?: string;
    localizacao?: string;
};

export type Maquina = {
    id: string;
    codigo: string;
    nome: string;
    tipo: 'torno' | 'fresa' | 'soldadora' | 'prensa' | 'cnc' | 'outras';
    status: 'ativa' | 'inativa' | 'manutencao' | 'calibracao';
    fabricante?: string;
    modelo?: string;
    localizacao?: string;
    responsavel?: string;
    eficiencia?: number;
    latitude?: number;
    longitude?: number;
    clienteId?: string;
    rastreadorId?: string;
    placa?: string;
    grupo?: string;
    equipamento?: string;
    equipamentoNumero?: string;
    dataInstalacaoEquipamento?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
};

export type MaquinaResponse = {
    message: string;
    data: {
        maquinas: Maquina[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
};

// Cliente types
export interface Cliente {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
    status: 'ativo' | 'inativo' | 'pendente';
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cnpj?: string;
    observacoes?: string;
    contatoResponsavel?: string;
    telefoneResponsavel?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
}

export interface ClienteCreateData {
    nome: string;
    email: string;
    telefone?: string;
    empresa: string;
    status?: 'ativo' | 'inativo' | 'pendente';
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cnpj?: string;
    observacoes?: string;
    contatoResponsavel?: string;
    telefoneResponsavel?: string;
}

// Colaborador types
export interface Colaborador {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
    status: 'ativo' | 'inativo' | 'treinamento';
    salario?: number;
    dataContratacao: string;
    dataDemissao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    observacoes?: string;
    supervisorId?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
}

export interface ColaboradorCreateData {
    nome: string;
    email: string;
    telefone: string;
    cargo: string;
    departamento: 'tecnologia' | 'gestao' | 'analise' | 'design' | 'comercial' | 'administrativo' | 'rh' | 'financeiro' | 'operacoes' | 'marketing';
    status?: 'ativo' | 'inativo' | 'treinamento';
    salario?: number;
    dataContratacao: string;
    dataDemissao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    cpf?: string;
    rg?: string;
    dataNascimento?: string;
    observacoes?: string;
    supervisorId?: string;
}

// Rastreador types
export interface Rastreador {
    id: string;
    numeroSerial: string;
    imei: string;
    status: 'ativo' | 'inativo' | 'manutencao' | 'bloqueado';
    modelo?: string;
    fabricante?: string;
    versaoFirmware?: string;
    observacoes?: string;
    placa?: string;
    nome?: string;
    condutor?: string;
    tipoVeiculo?: 'onibus' | 'caminhao' | 'carro';
    bloqueado?: boolean;
    tipoTransmissao?: string;
    dataCadastro: string;
    ultimaAtualizacao: string;
    ultimaComunicacao?: string;
    ultimaLatitude?: number;
    ultimaLongitude?: number;
    ultimaVelocidade?: number;
    ultimaDirecao?: number;
    ultimaIgnicao?: boolean;
    ultimaPosicaoGps?: string;
}

export interface DadosRastreador {
    id: string;
    rastreadorId: string;
    timestamp: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    velocidade?: number;
    direcao?: number;
    satelites?: number;
    ignicao?: boolean;
    odometro?: number;
    horimetro?: number;
    tensaoEntrada?: number;
    tensaoBateria?: number;
    velocidadeCAN?: number;
    rpm?: number;
    combustivel?: number;
    temperatura?: number;
    canAtivo?: boolean;
    eventoId?: number;
    eventoStatus?: string;
    eventoNome?: string;
}

export interface RastreadorComPosicao extends Rastreador {
    posicaoAtual?: DadosRastreador;
}

export interface RastreadorListResponse {
    message: string;
    data: {
        rastreadores: Rastreador[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

export interface RastreadorPosicaoResponse {
    message: string;
    data: {
        posicao: DadosRastreador;
    };
}

export interface RastreadorDadosResponse {
    message: string;
    data: {
        rastreador: Rastreador;
        dados: DadosRastreador[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

// Tipos de eventos de telemetria
export const RastreadorEventType = {
    PANICO: 111,
    SOS: 112,
    IGNICAO_LIGADA: 113,
    IGNICAO_DESLIGADA: 114,
    MOVIMENTO_INICIADO: 115,
    MOVIMENTO_PARADO: 116,
    VELOCIDADE_EXCEDIDA: 117,
    BATERIA_BAIXA: 118,
    ANTENA_CORTADA: 119,
    CERCA_ENTRADA: 120,
    CERCA_SAIDA: 121,
    ACELERACAO_BRUSCA: 122,
    FRENAGEM_BRUSCA: 123,
    CURVA_BRUSCA: 124,
    COLISAO: 125,
    IDENTIFICACAO_RS232: 126,
    OUTROS: 127
} as const;

export type RastreadorEventType = typeof RastreadorEventType[keyof typeof RastreadorEventType];

export interface EventoRastreador {
    id: string;
    rastreadorId: string;
    timestamp: string;
    eventoId: number;
    eventoStatus?: string;
    eventoNome?: string;
    descricao?: string;
    processado: boolean;
    dataRecebimento: string;
}

export interface RastreadorEventosResponse {
    message: string;
    data: {
        rastreador: Rastreador;
        eventos: EventoRastreador[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
}

// Mapeamento de nomes de eventos
export const EVENTOS_TELEMETRIA: Record<number, string> = {
    111: 'Pânico',
    112: 'SOS',
    113: 'Ignição Ligada',
    114: 'Ignição Desligada',
    115: 'Movimento Iniciado',
    116: 'Movimento Parado',
    117: 'Velocidade Excedida',
    118: 'Bateria Baixa',
    119: 'Antena Cortada',
    120: 'Cerca Entrada',
    121: 'Cerca Saída',
    122: 'Aceleração Brusca',
    123: 'Frenagem Brusca',
    124: 'Curva Brusca',
    125: 'Colisão',
    126: 'Identificação RS232',
    127: 'Outros'
};
