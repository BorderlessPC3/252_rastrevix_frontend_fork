import type { RelatorioFormData } from '../components/RelatorioBase';

export function buildReportPayload(form: RelatorioFormData) {
  const dataInicio = new Date(`${form.dataInicio}T${form.horaInicio}:00`).toISOString();
  const dataFim = new Date(`${form.dataFim}T${form.horaFim}:59`).toISOString();
  return {
    dataInicio,
    dataFim,
    clienteId: form.clienteId || undefined,
    veiculosIds: form.veiculosIds.length ? form.veiculosIds : undefined
  };
}
