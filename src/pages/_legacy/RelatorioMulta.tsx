import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioMulta: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório multa:', dados);
    alert('Relatório Multa gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - MULTA"
      descricao="Este relatório apresenta todas as multas registradas para os veículos da frota, incluindo tipo, valor e status."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioMulta;
