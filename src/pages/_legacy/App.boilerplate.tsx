"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"

function App() {
  const [count, setCount] = useState(0)
  const location = useLocation()

  return (
    <div className="app-container">
      <div className="welcome-section">
        <h1>Bem-vindo ao Rastrevix</h1>
        <p>Você está logado com sucesso e visualizando a área protegida.</p>
        <p>
          Rota atual: <code>{location.pathname}</code>
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div className="card card-elevated">
          <h2>Contador Interativo</h2>
          <button onClick={() => setCount((count) => count + 1)}>Contador: {count}</button>
          <p>Este é um componente protegido que apenas usuários autenticados podem ver.</p>
        </div>

        <div className="card card-elevated">
          <h2>Navegação</h2>
          <p>Use a barra de navegação para:</p>
          <ul>
            <li>Navegar entre diferentes seções</li>
            <li>Fazer logout quando terminar</li>
            <li>Acessar conteúdo protegido</li>
            <li>Gerenciar suas configurações</li>
          </ul>
        </div>

        <div className="card card-elevated">
          <h2>Recursos Avançados</h2>
          <p>Explore as funcionalidades premium:</p>
          <ul>
            <li>Dashboard personalizado</li>
            <li>Relatórios em tempo real</li>
            <li>Integração com APIs</li>
            <li>Suporte prioritário</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
