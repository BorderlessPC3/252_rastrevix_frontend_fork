import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  Users,
  Car,
  Loader,
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  FileText
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';
import { importApiService } from '../services/importApiService';
import '../styles/integracao.css';

interface IntegrationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'cadastro';
}

interface ImportProgress {
  total: number;
  success: number;
  errors: number;
  current: number;
}

interface ImportLogResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount?: number;
  errors?: Array<{ row: number; message: string }>;
}

function notifyImportResult(log: ImportLogResult, label: string) {
  const skipped = log.skippedCount ?? 0;
  const summary = `${label}: ${log.successCount} ok, ${skipped} ignorados, ${log.errorCount} erros (total ${log.totalRows})`;

  if (log.errorCount > 0) {
    const first = log.errors?.slice(0, 3).map((e) => `Linha ${e.row}: ${e.message}`).join(' · ');
    toast.warning(`${summary}${first ? ` — ${first}` : ''}`, { autoClose: 8000 });
    if (log.errors && log.errors.length > 3) {
      console.warn(`[Importação ${label}] demais erros:`, log.errors);
    }
  } else if (skipped > 0 && log.successCount === 0) {
    toast.info(summary, { autoClose: 5000 });
  } else {
    toast.success(summary, { autoClose: 4000 });
  }
}

const Integracao: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const integrationCards: IntegrationCard[] = [
    {
      id: 'clientes',
      title: 'Migração',
      description: 'Clientes',
      icon: <Users size={40} />,
      category: 'cadastro'
    },
    {
      id: 'motoristas',
      title: 'Motorista',
      description: 'Colaboradores e motoristas',
      icon: <Users size={40} />,
      category: 'cadastro'
    },
    {
      id: 'veiculos',
      title: 'Veículos',
      description: 'Veículos e máquinas',
      icon: <Car size={40} />,
      category: 'cadastro'
    }
  ];

  const handleImportClick = (cardId: string) => {
    fileInputRefs.current[cardId]?.click();
  };

  const handleFileChange = async (cardId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedCard(cardId);
    setIsImporting(true);
    setImportProgress({ total: 0, success: 0, errors: 0, current: 0 });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setImportProgress({ total: jsonData.length, success: 0, errors: 0, current: 0 });

      // Processar importação de acordo com o tipo
      switch (cardId) {
        case 'clientes':
          await importClientes(jsonData);
          break;
        case 'motoristas':
          await importMotoristas(jsonData);
          break;
        case 'veiculos':
          await importVeiculos(jsonData);
          break;
        default:
          toast.error('Tipo de importação não implementado');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      const msg = error instanceof Error ? error.message : 'Erro ao processar arquivo de importação';
      toast.error(msg);
    } finally {
      setIsImporting(false);
      setSelectedCard(null);

      // Aguardar um pouco antes de fechar o modal para o usuário ver o resultado
      setTimeout(() => {
        setImportProgress(null);
      }, 2000);

      // Limpar o input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const importClientes = async (data: any[]) => {
    const rows = data.map((item) => ({
      nome: item.nome || item.Nome || '',
      email: item.email || item.Email || '',
      telefone: item.telefone || item.Telefone || '',
      endereco: item.endereco || item.Endereco || item.Endereço || '',
      empresa: item.empresa || item.Empresa || item.nome || item.Nome || 'Importado'
    }));
    const key = `clientes-${Date.now()}`;
    const res = await importApiService.batchImport({
      entityType: 'clientes',
      rows,
      idempotencyKey: key
    });
    const log = res.data.log;
    setImportProgress({
      total: log.totalRows,
      success: log.successCount,
      errors: log.errorCount,
      current: log.totalRows
    });
    notifyImportResult(log, 'Clientes');
  };

  const importMotoristas = async (data: any[]) => {
    const rows = data.map((item) => ({
      nome: item.nome || item.Nome || '',
      email: item.email || item.Email || '',
      telefone: item.telefone || item.Telefone || '',
      cargo: item.cargo || item.Cargo || 'Motorista',
      clienteEmail:
        item.clienteEmail || item.ClienteEmail || item.emailCliente || item.EmailCliente || '',
      dataContratacao:
        item.dataContratacao || item.DataContratacao || new Date().toISOString().split('T')[0]
    }));
    const res = await importApiService.batchImport({
      entityType: 'motoristas',
      rows,
      idempotencyKey: `motoristas-${Date.now()}`
    });
    const log = res.data.log;
    setImportProgress({
      total: log.totalRows,
      success: log.successCount,
      errors: log.errorCount,
      current: log.totalRows
    });
    notifyImportResult(log, 'Motoristas');
  };

  const importVeiculos = async (data: any[]) => {
    const rows = data.map((item) => {
      const codigo = item.codigo || item.Codigo || item.placa || item.Placa || '';
      const nome = item.nome || item.Nome || item.modelo || item.Modelo || codigo;
      const tipo = String(item.tipo || item.Tipo || 'outras').toLowerCase();
      return {
        codigo: String(codigo).trim(),
        nome: String(nome).trim(),
        tipo,
        status: String(item.status || item.Status || 'ativa').toLowerCase(),
        placa: item.placa || item.Placa,
        fabricante: item.fabricante || item.Fabricante,
        modelo: item.modelo || item.Modelo,
        clienteEmail:
          item.clienteEmail || item.ClienteEmail || item.emailCliente || item.EmailCliente || ''
      };
    });
    const res = await importApiService.batchImport({
      entityType: 'veiculos',
      rows,
      idempotencyKey: `veiculos-${Date.now()}`
    });
    const log = res.data.log;
    setImportProgress({
      total: log.totalRows,
      success: log.successCount,
      errors: log.errorCount,
      current: log.totalRows
    });
    notifyImportResult(log, 'Veículos');
  };

  const handleDownloadTemplate = (cardId: string) => {
    let templateData: any[] = [];
    let filename = '';

    switch (cardId) {
      case 'clientes':
        templateData = [{
          nome: 'João Silva',
          email: 'joao@email.com',
          telefone: '(11) 98765-4321',
          endereco: 'Rua ABC, 123, São Paulo - SP'
        }];
        filename = 'template_clientes.xlsx';
        break;
      case 'motoristas':
        templateData = [{
          nome: 'Carlos Santos',
          email: 'carlos@email.com',
          clienteEmail: 'joao@email.com',
          telefone: '(11) 91234-5678',
          cargo: 'Motorista',
          dataContratacao: '2024-01-15'
        }];
        filename = 'template_motoristas.xlsx';
        break;
      case 'veiculos':
        templateData = [
          {
            codigo: 'VEI001',
            nome: 'Caminhão Mercedes Atego',
            clienteEmail: 'joao@email.com',
            tipo: 'outras',
            status: 'ativa',
            placa: 'ABC-1234',
            fabricante: 'Mercedes-Benz',
            modelo: 'Atego 1719'
          },
          {
            codigo: 'VEI002',
            nome: 'Van Sprinter',
            clienteEmail: 'joao@email.com',
            tipo: 'outras',
            status: 'ativa',
            placa: 'XYZ-5678',
            fabricante: 'Mercedes-Benz',
            modelo: 'Sprinter 515'
          }
        ];
        filename = 'template_veiculos.xlsx';
        break;
      case 'pontos':
        templateData = [{
          nome: 'Base Principal',
          latitude: '-23.5505',
          longitude: '-46.6333',
          descricao: 'Sede da empresa',
          tipo: 'base',
          endereco: 'Av. Paulista, 1000 - São Paulo - SP'
        }];
        filename = 'template_pontos.xlsx';
        break;
      default:
        toast.error('Template não disponível');
        return;
    }

    // Criar workbook e worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Baixar arquivo
    XLSX.writeFile(workbook, filename);
    toast.success('Template baixado com sucesso!');
  };

  const handleExport = async (cardId: string) => {
    setSelectedCard(cardId);
    setIsExporting(true);

    try {
      let endpoint = '';
      let filename = '';

      switch (cardId) {
        case 'clientes':
          endpoint = '/clientes';
          filename = 'clientes.xlsx';
          break;
        case 'motoristas':
          endpoint = '/colaboradores';
          filename = 'motoristas.xlsx';
          break;
        case 'veiculos':
          endpoint = '/maquinas';
          filename = 'veiculos.xlsx';
          break;
        default:
          toast.error('Tipo de exportação não implementado');
          return;
      }

      const responseData = await apiService.request<any>(endpoint, {
        method: 'GET'
      });

      let data = responseData;

      // Se a resposta é um objeto com array dentro, extrair o array
      if (responseData.data && Array.isArray(responseData.data)) {
        data = responseData.data;
      } else if (!Array.isArray(responseData)) {
        data = [responseData];
      }

      if (data.length === 0) {
        toast.warning('Nenhum registro encontrado para exportar');
        return;
      }

      // Criar workbook e worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

      // Baixar arquivo
      XLSX.writeFile(workbook, filename);
      toast.success(`Exportação concluída! ${data.length} registros exportados.`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
      setSelectedCard(null);
    }
  };

  const [showHelp, setShowHelp] = useState(false);

  const getHelpContent = (cardId: string) => {
    switch (cardId) {
      case 'clientes':
        return {
          title: 'Campos para Importação de Clientes',
          required: ['nome', 'email'],
          optional: ['telefone', 'endereco'],
          example: {
            nome: 'João Silva',
            email: 'joao@email.com',
            telefone: '(11) 98765-4321',
            endereco: 'Rua ABC, 123'
          }
        };
      case 'motoristas':
        return {
          title: 'Campos para Importação de Motoristas',
          required: ['nome', 'email', 'clienteEmail (e-mail do cliente já cadastrado)'],
          optional: ['telefone', 'cargo', 'dataContratacao'],
          example: {
            nome: 'Carlos Santos',
            email: 'carlos@email.com',
            clienteEmail: 'joao@email.com',
            telefone: '(11) 91234-5678',
            cargo: 'Motorista',
            dataContratacao: '2024-01-15'
          }
        };
      case 'veiculos':
        return {
          title: 'Campos para Importação de Veículos',
          required: ['codigo', 'clienteEmail (e-mail do cliente já cadastrado)'],
          optional: ['nome', 'tipo', 'status', 'placa', 'modelo', 'fabricante'],
          example: {
            codigo: 'VEI001',
            nome: 'Caminhão Mercedes Atego',
            clienteEmail: 'joao@email.com',
            tipo: 'outras',
            status: 'ativa',
            placa: 'ABC-1234',
            fabricante: 'Mercedes-Benz',
            modelo: 'Atego 1719'
          }
        };
      default:
        return null;
    }
  };

  const cadastroCards = integrationCards.filter((c) => c.category === 'cadastro');

  return (
    <div className="integracao-container">
      <div className="integracao-header">
        <div className="header-title-row">
          <h1 className="integracao-title">Integrações</h1>
          <button
            className="btn-help"
            onClick={() => setShowHelp(!showHelp)}
            title="Ver ajuda sobre formatos de importação"
          >
            <Info size={20} />
            {showHelp ? 'Ocultar Ajuda' : 'Ver Formato dos Arquivos'}
          </button>
        </div>
      </div>

      {/* Seção de Ajuda */}
      {showHelp && (
        <div className="help-panel">
          <div className="help-panel-header">
            <FileText size={24} />
            <h2>Guia de Importação</h2>
          </div>
          <div className="help-panel-content">
            {integrationCards.map((card) => {
              const help = getHelpContent(card.id);
              if (!help) return null;

              return (
                <div key={card.id} className="help-item">
                  <h3>{help.title}</h3>
                  <div className="help-fields">
                    <div className="field-group">
                      <strong>Campos Obrigatórios:</strong>
                      <ul>
                        {help.required.map((field) => (
                          <li key={field}><code>{field}</code></li>
                        ))}
                      </ul>
                    </div>
                    <div className="field-group">
                      <strong>Campos Opcionais:</strong>
                      <ul>
                        {help.optional.map((field) => (
                          <li key={field}><code>{field}</code></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="help-example">
                    <strong>Exemplo:</strong>
                    <pre>{JSON.stringify(help.example, null, 2)}</pre>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="help-panel-footer">
            <p>
              <AlertTriangle size={16} />
              <strong>Importante:</strong> Os arquivos devem estar no formato XLSX, XLS ou CSV.
              Certifique-se de que as colunas tenham os nomes exatos dos campos listados acima.
            </p>
            <div className="template-buttons">
              <h4>Baixar Templates de Exemplo:</h4>
              <div className="template-buttons-grid">
                {integrationCards.map((card) => (
                  <button
                    key={`template-${card.id}`}
                    className="btn-template"
                    onClick={() => handleDownloadTemplate(card.id)}
                  >
                    <Download size={16} />
                    Template {card.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Progresso */}
      {importProgress && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <div className="import-modal-header">
              <h3>Importando dados...</h3>
              <button
                className="import-modal-close"
                onClick={() => {
                  setIsImporting(false);
                  setImportProgress(null);
                }}
                disabled={isImporting}
              >
                <X size={20} />
              </button>
            </div>
            <div className="import-modal-body">
              <div className="progress-info">
                <div className="progress-item">
                  <span className="progress-label">Total:</span>
                  <span className="progress-value">{importProgress.total}</span>
                </div>
                <div className="progress-item success">
                  <CheckCircle size={16} />
                  <span className="progress-label">Sucesso:</span>
                  <span className="progress-value">{importProgress.success}</span>
                </div>
                <div className="progress-item error">
                  <AlertTriangle size={16} />
                  <span className="progress-label">Erros:</span>
                  <span className="progress-value">{importProgress.errors}</span>
                </div>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(importProgress.current / importProgress.total) * 100}%`
                  }}
                />
              </div>
              <p className="progress-text">
                Processando {importProgress.current} de {importProgress.total} registros...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cadastro */}
      <section className="integration-section">
        <h2 className="section-title">Cadastro</h2>
        <div className="integration-grid-large">
          {cadastroCards.map((card) => (
            <div key={card.id} className="integration-card-wrapper">
              <input
                type="file"
                ref={(el) => { fileInputRefs.current[card.id] = el; }}
                onChange={(e) => handleFileChange(card.id, e)}
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
              />
              <div className="integration-card-large">
                <div className="card-icon-large">{card.icon}</div>
                <div className="card-label">{card.title}</div>
                <div className="card-actions-inline">
                  <button
                    className="btn-action import"
                    onClick={() => handleImportClick(card.id)}
                    disabled={isImporting && selectedCard === card.id}
                    title="Importar"
                  >
                    {isImporting && selectedCard === card.id ? (
                      <Loader size={18} className="spinner" />
                    ) : (
                      <Upload size={18} />
                    )}
                  </button>
                  <button
                    className="btn-action export"
                    onClick={() => handleExport(card.id)}
                    disabled={isExporting && selectedCard === card.id}
                    title="Exportar"
                  >
                    {isExporting && selectedCard === card.id ? (
                      <Loader size={18} className="spinner" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Integracao;
