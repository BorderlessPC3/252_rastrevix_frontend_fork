import React from 'react';
import RelatorioBase, { type RelatorioFormData } from '../components/RelatorioBase';

const RelatorioCercas: React.FC = () => {
  const handlePesquisar = (dados: RelatorioFormData) => {
    console.log('Gerar relatório cercas:', dados);
    alert('Relatório Cercas gerado com sucesso! (Funcionalidade em desenvolvimento)');
  };

  return (
    <RelatorioBase
      titulo="RELATÓRIO - CERCAS"
      descricao="Este relatório apresenta informações sobre cercas virtuais configuradas, entradas e saídas das áreas delimitadas."
      onPesquisar={handlePesquisar}
    />
  );
};

export default RelatorioCercas;
