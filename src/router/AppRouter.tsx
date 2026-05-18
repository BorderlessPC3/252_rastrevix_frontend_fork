import type React from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from "../components/Layout"
import { AuthProvider } from "../contexts/AuthContext"
import { ThemeProvider } from "../contexts/ThemeContext"
import CadastroCliente from "../pages/CadastroCliente"
import CadastroColaborador from "../pages/CadastroColaborador"
import CadastroMaquina from "../pages/CadastroMaquina"
import CadastroRastreador from "../pages/CadastroRastreador"
import Configuracoes from "../pages/Configuracoes"
import Dashboard from "../pages/Dashboard"
import EstoqueChipGSM from "../pages/EstoqueChipGSM"
import EstoqueEquipamento from "../pages/EstoqueEquipamento"
import EstoqueFornecedorChipGSM from "../pages/EstoqueFornecedorChipGSM"
import Integracao from "../pages/Integracao"
import Login from "../pages/Login"
import Maps from "../pages/Maps"
import Perfil from "../pages/Perfil"
import PerimetrosCerca from "../pages/PerimetrosCerca"
import PerimetrosPonto from "../pages/PerimetrosPonto"
import PerimetrosRota from "../pages/PerimetrosRota"
import Register from "../pages/Register"
import RelatorioAbastecimento from "../pages/RelatorioAbastecimento"
import RelatorioAtraso from "../pages/RelatorioAtraso"
import RelatorioCercas from "../pages/RelatorioCercas"
import RelatorioChecklist from "../pages/RelatorioChecklist"
import RelatorioCustoViagem from "../pages/RelatorioCustoViagem"
import RelatorioEntrega from "../pages/RelatorioEntrega"
import RelatorioEvento from "../pages/RelatorioEvento"
import RelatorioFinanceiro from "../pages/RelatorioFinanceiro"
import RelatorioFrota from "../pages/RelatorioFrota"
import RelatorioHistorico from "../pages/RelatorioHistorico"
import RelatorioLogistica from "../pages/RelatorioLogistica"
import RelatorioManutencao from "../pages/RelatorioManutencao"
import RelatorioMatrizCliente from "../pages/RelatorioMatrizCliente"
import RelatorioMotoristaJornada from "../pages/RelatorioMotoristaJornada"
import RelatorioMulta from "../pages/RelatorioMulta"
import RelatorioParadaDeslocamento from "../pages/RelatorioParadaDeslocamento"
import RelatorioPontos from "../pages/RelatorioPontos"
import RelatorioViagem from "../pages/RelatorioViagem"
import RelatorioVinculo from "../pages/RelatorioVinculo"
import TelemetriaEvento from "../pages/TelemetriaEvento"
import HistoricoRotas from "../pages/HistoricoRotas"
import '../styles/toast-custom.css'
import RoleProtectedRoute from "./RoleProtectedRoute"

const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes with Layout */}
          <Route path="/" element={
            <RoleProtectedRoute>
              <Layout />
            </RoleProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="/mapa" element={<Maps />} />
            <Route path="/mapa/historico" element={<HistoricoRotas />} />
            <Route path="/cadastro/cliente" element={<CadastroCliente />} />
            <Route path="/cadastro/maquina" element={<CadastroMaquina />} />
            <Route path="/cadastro/colaborador" element={<CadastroColaborador />} />
            <Route path="/cadastro/rastreador" element={<CadastroRastreador />} />
            <Route path="/estoque/chip-gsm" element={<EstoqueChipGSM />} />
            <Route path="/estoque/equipamento" element={<EstoqueEquipamento />} />
            <Route path="/estoque/fornecedor-chip-gsm" element={<EstoqueFornecedorChipGSM />} />
            <Route path="/relatorios/historico" element={<RelatorioHistorico />} />
            <Route path="/relatorios/parada-deslocamento" element={<RelatorioParadaDeslocamento />} />
            <Route path="/relatorios/motorista-jornada" element={<RelatorioMotoristaJornada />} />
            <Route path="/relatorios/logistica" element={<RelatorioLogistica />} />
            <Route path="/relatorios/evento" element={<RelatorioEvento />} />
            <Route path="/relatorios/manutencao" element={<RelatorioManutencao />} />
            <Route path="/relatorios/abastecimento" element={<RelatorioAbastecimento />} />
            <Route path="/relatorios/multa" element={<RelatorioMulta />} />
            <Route path="/relatorios/viagem" element={<RelatorioViagem />} />
            <Route path="/relatorios/custo-viagem" element={<RelatorioCustoViagem />} />
            <Route path="/relatorios/entrega" element={<RelatorioEntrega />} />
            <Route path="/relatorios/checklist" element={<RelatorioChecklist />} />
            <Route path="/relatorios/vinculo" element={<RelatorioVinculo />} />
            <Route path="/relatorios/pontos" element={<RelatorioPontos />} />
            <Route path="/relatorios/cercas" element={<RelatorioCercas />} />
            <Route path="/relatorios/atraso" element={<RelatorioAtraso />} />
            <Route path="/relatorios/matriz-cliente" element={<RelatorioMatrizCliente />} />
            <Route path="/relatorios/financeiro" element={<RelatorioFinanceiro />} />
            <Route path="/relatorios/frota" element={<RelatorioFrota />} />
            <Route path="/perimetros/ponto" element={<PerimetrosPonto />} />
            <Route path="/perimetros/cerca" element={<PerimetrosCerca />} />
            <Route path="/perimetros/rota" element={<PerimetrosRota />} />
            <Route path="/telemetria/evento" element={<TelemetriaEvento />} />
            <Route path="/gerencia/integracao" element={<Integracao />} />
            <Route path="/profile" element={<Perfil />} />
            <Route path="/settings" element={<Configuracoes />} />
            {/* Add other protected routes here as needed */}
            {/* <Route path="/help" element={<Help />} /> */}
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          {/* Catch all route - redirect to login for unauthenticated users */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Toast Container - notificações globais */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={false}
          pauseOnHover={true}
          limit={5}
          theme="colored"
          closeButton={true}
          style={{ zIndex: 9999 }}
        />
      </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default AppRouter
