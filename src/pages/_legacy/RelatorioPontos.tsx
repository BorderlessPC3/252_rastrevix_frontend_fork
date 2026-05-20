import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioPontos: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório pontos:', dados);
    alert('Relatório Pontos gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - PONTOS"
      descricao="Este relatório exibe informações sobre pontos de interesse, paradas frequentes e locais visitados pelos veículos."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioPontos;
