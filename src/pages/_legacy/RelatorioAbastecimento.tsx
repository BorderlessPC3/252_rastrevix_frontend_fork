import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioAbastecimento: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório abastecimento:', dados);
    alert('Relatório Abastecimento gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - ABASTECIMENTO"
      descricao="Este relatório exibe informações sobre abastecimentos realizados, consumo de combustível e custos relacionados."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioAbastecimento;
