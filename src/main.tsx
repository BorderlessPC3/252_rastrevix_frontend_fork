import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import './styles/auth.css'
import './styles/page-feedback.css'
import AppRouter from './router/AppRouter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
