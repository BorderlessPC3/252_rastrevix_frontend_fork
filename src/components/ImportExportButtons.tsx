import React, { useRef, useState } from 'react';
import { Upload, FileText, FileCode, FileSpreadsheet } from 'lucide-react';
import { exportToPDF, exportToXML, exportToXLSX, importFromXML, importFromXLSX, getDefaultColumns } from '../utils/exportUtils';
import { showSuccess, showError } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';
import { canImportData } from '../utils/rbac';

interface ImportExportButtonsProps {
  data: any[];
  filename: string;
  title: string;
  columns?: { key: string; label: string; width?: number }[];
  onImport?: (data: any[]) => void | Promise<void>;
  exportEnabled?: boolean;
  importEnabled?: boolean;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  data,
  filename,
  title,
  columns,
  onImport,
  exportEnabled = true,
  importEnabled = true
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const allowImport = importEnabled && canImportData(user?.role);

  const handleExportPDF = async () => {
    if (data.length === 0) {
      showError('Não há dados para exportar');
      return;
    }

    try {
      setIsExporting(true);
      const exportColumns = columns || getDefaultColumns(data);
      await exportToPDF(data, filename, title, exportColumns);
      showSuccess('Dados exportados em PDF com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      showError('Erro ao exportar dados em PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXML = () => {
    if (data.length === 0) {
      showError('Não há dados para exportar');
      return;
    }

    try {
      setIsExporting(true);
      exportToXML(data, filename, 'items');
      showSuccess('Dados exportados em XML com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XML:', error);
      showError('Erro ao exportar dados em XML');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLSX = async () => {
    if (data.length === 0) {
      showError('Não há dados para exportar');
      return;
    }

    try {
      setIsExporting(true);
      const exportColumns = columns || getDefaultColumns(data);
      await exportToXLSX(data, filename, exportColumns);
      showSuccess('Dados exportados em XLSX com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      showError('Erro ao exportar dados em XLSX');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isXML = fileName.endsWith('.xml');
    const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isXML && !isXLSX) {
      showError('Por favor, selecione um arquivo XML ou XLSX');
      return;
    }

    try {
      setIsImporting(true);
      console.log('Iniciando importação do arquivo:', file.name, 'Tipo:', isXLSX ? 'XLSX' : 'XML');

      let importedData: any[];

      if (isXLSX) {
        importedData = await importFromXLSX(file);
      } else {
        importedData = await importFromXML(file);
      }

      console.log('Arquivo processado com sucesso. Total de registros:', importedData.length);

      if (importedData.length === 0) {
        showError('Nenhum registro encontrado no arquivo. Verifique se o arquivo contém dados.');
        return;
      }

      if (onImport) {
        console.log('Chamando função onImport com', importedData.length, 'registros');
        await onImport(importedData);
        // A mensagem de sucesso será exibida pela função onImport
      } else {
        showSuccess(`Arquivo processado: ${importedData.length} registro(s) encontrado(s)`);
      }
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Erro ao importar arquivo. Verifique o formato e tente novamente.';
      showError(errorMessage);
    } finally {
      setIsImporting(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="import-export-buttons">
      {exportEnabled && (
        <div className="export-buttons">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting || data.length === 0}
            className="btn-export btn-export-pdf"
            title="Exportar para PDF"
          >
            <FileText size={18} />
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </button>
          <button
            type="button"
            onClick={handleExportXML}
            disabled={isExporting || data.length === 0}
            className="btn-export btn-export-xml"
            title="Exportar para XML"
          >
            <FileCode size={18} />
            {isExporting ? 'Exportando...' : 'Exportar XML'}
          </button>
          <button
            type="button"
            onClick={handleExportXLSX}
            disabled={isExporting || data.length === 0}
            className="btn-export btn-export-xlsx"
            title="Exportar para Excel (XLSX)"
          >
            <FileSpreadsheet size={18} />
            {isExporting ? 'Exportando...' : 'Exportar XLSX'}
          </button>
        </div>
      )}

      {allowImport && onImport && (
        <div className="import-buttons">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml,.xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={handleImportClick}
            disabled={isImporting}
            className="btn-import"
            title="Importar de XML ou XLSX"
          >
            <Upload size={18} />
            {isImporting ? 'Importando...' : 'Importar XML/XLSX'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportExportButtons;
