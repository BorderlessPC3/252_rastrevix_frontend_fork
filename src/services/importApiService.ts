import { apiService } from './api';
import { useFirebaseDirect } from '../config/firebase';
import * as fb from '../firebase/entities';

export type ImportEntityType = 'clientes' | 'motoristas' | 'veiculos' | 'pontos';

export interface ImportLogResult {
  id: string;
  entityType: string;
  status: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors?: Array<{ row: number; message: string }>;
  startedAt: string;
  finishedAt?: string;
}

class ImportApiService {
  async batchImport(params: {
    entityType: ImportEntityType;
    rows: Record<string, unknown>[];
    idempotencyKey?: string;
  }) {
    if (useFirebaseDirect()) return fb.batchImport(params);

    return apiService.request<{ message: string; data: { log: ImportLogResult } }>(
      '/import/batch',
      {
        method: 'POST',
        body: JSON.stringify(params)
      }
    );
  }

  async listLogs() {
    if (useFirebaseDirect()) return fb.listImportLogs();

    return apiService.request<{ message: string; data: { logs: ImportLogResult[] } }>(
      '/import/logs'
    );
  }

  async getLog(id: string) {
    if (useFirebaseDirect()) return fb.getImportLog(id);

    return apiService.request<{ message: string; data: { log: ImportLogResult } }>(
      `/import/logs/${id}`
    );
  }
}

export const importApiService = new ImportApiService();
export default importApiService;
