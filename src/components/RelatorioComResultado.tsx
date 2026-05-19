import React, { useState } from 'react';
import RelatorioBase, { type RelatorioFormData } from './RelatorioBase';
import { buildReportPayload } from '../utils/relatorioPayload';
import { exportToPDF, exportToXLSX } from '../utils/exportUtils';
import { showError, showSuccess } from '../utils/toast';
import '../styles/relatorios.css';

export interface ReportColumn {
  key: string;
  label: string;
}

interface RelatorioComResultadoProps {
  titulo: string;
  descricao: string;
  fetchReport: (payload: ReturnType<typeof buildReportPayload>) => Promise<unknown>;
  columns: ReportColumn[];
  mapRows: (data: unknown) => Record<string, unknown>[];
  camposExtras?: React.ReactNode;
  extraPayload?: (form: RelatorioFormData) => Record<string, unknown>;
}

const RelatorioComResultado: React.FC<RelatorioComResultadoProps> = ({
  titulo,
  descricao,
  fetchReport,
  columns,
  mapRows,
  camposExtras,
  extraPayload
}) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [rawData, setRawData] = useState<unknown>(null);

  const handlePesquisar = async (form: RelatorioFormData) => {
    try {
      setLoading(true);
      const base = buildReportPayload(form);
      const payload = { ...base, ...(extraPayload?.(form) ?? {}) };
      const res = await fetchReport(payload);
      const data =
        res && typeof res === 'object' && 'data' in res
          ? (res as { data: unknown }).data
          : res;
      setRawData(data);
      const mapped = mapRows(data);
      setRows(mapped);
      showSuccess(`${mapped.length} registro(s) no relatório`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportar = async (tipo: 'pdf' | 'xlsx') => {
    if (!rows.length) {
      showError('Gere o relatório antes de exportar');
      return;
    }
    const filename = titulo.replace(/\s+/g, '_').toLowerCase();
    if (tipo === 'pdf') await exportToPDF(rows, filename, titulo, columns);
    else exportToXLSX(rows, filename, columns);
  };

  return (
    <div className="relatorio-com-resultado">
      <RelatorioBase
        titulo={titulo}
        descricao={descricao}
        camposExtras={camposExtras}
        onPesquisar={handlePesquisar}
      />

      {loading && <p className="relatorio-loading">Gerando relatório…</p>}

      {rows.length > 0 && (
        <div className="relatorio-resultado">
          <div className="relatorio-toolbar">
            <button type="button" className="btn-secondary" onClick={() => exportar('pdf')}>
              Exportar PDF
            </button>
            <button type="button" className="btn-secondary" onClick={() => exportar('xlsx')}>
              Exportar Excel
            </button>
          </div>

          <div className="table-container relatorio-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key}>{String(row[c.key] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rawData != null && (
            <details className="relatorio-raw-json">
              <summary>Detalhes (JSON)</summary>
              <pre>{JSON.stringify(rawData, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default RelatorioComResultado;
