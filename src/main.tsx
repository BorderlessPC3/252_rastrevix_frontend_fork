import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './global.css'
import './styles/auth.css'
import './styles/page-feedback.css'
import AppRouter from './router/AppRouter'
import { useFirebaseDirect } from './config/firebase'
import { getFirebaseAnalytics } from './firebase/app'

if (useFirebaseDirect()) {
  void getFirebaseAnalytics()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
)
