import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { tokens } from '@rotatrucks/back/tokens'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SettingsProvider } from './contexts/SettingsContext.tsx'
import { applyTheme, readSettings } from './lib/settings.ts'
import './index.css'

applyTheme(readSettings().theme)

const rootStyle = document.documentElement.style
rootStyle.setProperty('--color-brand', tokens.color.brand)
rootStyle.setProperty('--color-accent', tokens.color.accent)
rootStyle.setProperty('--color-fog', tokens.color.fog)
rootStyle.setProperty('--color-ink', tokens.color.ink)

const root = document.getElementById('root')
if (!root) {
  throw new Error('Elemento #root nao encontrado.')
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
