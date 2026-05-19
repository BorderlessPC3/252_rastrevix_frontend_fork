import type React from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from "../components/Layout"
import RedirectHome from "../components/RedirectHome"
import { AuthProvider } from "../contexts/AuthContext"
import { ThemeProvider } from "../contexts/ThemeContext"
import { isPublicRegisterEnabled } from "../config/env"
import { LEGACY_DISABLED_PATHS } from "../config/productMenu"
import CadastroCliente from "../pages/CadastroCliente"
import CadastroColaborador from "../pages/CadastroColaborador"
import CadastroMaquina from "../pages/CadastroMaquina"
import CadastroRastreador from "../pages/CadastroRastreador"
import Dashboard from "../pages/Dashboard"
import EstoqueChipGSM from "../pages/EstoqueChipGSM"
import EstoqueEquipamento from "../pages/EstoqueEquipamento"
import EstoqueFornecedorChipGSM from "../pages/EstoqueFornecedorChipGSM"
import Integracao from "../pages/Integracao"
import Login from "../pages/Login"
import Maps from "../pages/Maps"
import Perfil from "../pages/Perfil"
import Register from "../pages/Register"
import RelatorioDesempenho from "../pages/RelatorioDesempenho"
import RelatorioFinanceiro from "../pages/RelatorioFinanceiro"
import RelatorioFrota from "../pages/RelatorioFrota"
import RelatorioHistorico from "../pages/RelatorioHistorico"
import RelatorioLogistica from "../pages/RelatorioLogistica"
import RelatorioManutencao from "../pages/RelatorioManutencao"
import RelatorioParadaDeslocamento from "../pages/RelatorioParadaDeslocamento"
import RelatorioViagem from "../pages/RelatorioViagem"
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
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={
              isPublicRegisterEnabled ? (
                <Register />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

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
            <Route path="/relatorios/logistica" element={<RelatorioLogistica />} />
            <Route path="/relatorios/manutencao" element={<RelatorioManutencao />} />
            <Route path="/relatorios/viagem" element={<RelatorioViagem />} />
            <Route path="/relatorios/financeiro" element={<RelatorioFinanceiro />} />
            <Route path="/relatorios/frota" element={<RelatorioFrota />} />
            <Route path="/relatorios/desempenho" element={<RelatorioDesempenho />} />
            <Route path="/telemetria/evento" element={<TelemetriaEvento />} />
            <Route path="/gerencia/integracao" element={<Integracao />} />
            <Route path="/profile" element={<Perfil />} />
            {LEGACY_DISABLED_PATHS.map((path) => (
              <Route key={path} path={path} element={<RedirectHome />} />
            ))}
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

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
