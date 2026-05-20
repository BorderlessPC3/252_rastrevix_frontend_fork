import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioVinculo: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório vínculo:', dados);
    alert('Relatório Vínculo gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - VÍNCULO"
      descricao="Este relatório apresenta os vínculos entre veículos, motoristas, clientes e outros elementos do sistema."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioVinculo;
