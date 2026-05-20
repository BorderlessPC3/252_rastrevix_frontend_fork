import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioChecklist: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório checklist:', dados);
    alert('Relatório Checklist gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - CHECKLIST"
      descricao="Este relatório exibe os checklists realizados nos veículos, incluindo itens verificados, status e observações."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioChecklist;
