import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioCustoViagem: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório custo de viagem:', dados);
    alert('Relatório Custo de Viagem gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - CUSTO DE VIAGEM"
      descricao="Este relatório calcula e apresenta os custos totais de cada viagem, incluindo combustível, pedágios, manutenção e outros gastos."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioCustoViagem;
