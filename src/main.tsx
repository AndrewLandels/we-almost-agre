import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { PaperBookProvider } from './hooks/usePaperBook'
import { WalletProvider } from './hooks/useWallet'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <PaperBookProvider>
          <App />
        </PaperBookProvider>
      </WalletProvider>
    </BrowserRouter>
  </StrictMode>,
)
