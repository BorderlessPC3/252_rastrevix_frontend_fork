import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioEntrega: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório entrega:', dados);
    alert('Relatório Entrega gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - ENTREGA"
      descricao="Este relatório apresenta informações sobre entregas realizadas, incluindo status, tempo de entrega e localização."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioEntrega;
