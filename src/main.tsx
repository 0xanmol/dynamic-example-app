import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import { ZeroDevSmartWalletConnectors } from '@dynamic-labs/ethereum-aa'
import './index.css'
import App from './App.tsx'

const dynamicSettings = {
  environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || '',
  walletConnectors: [EthereumWalletConnectors, ZeroDevSmartWalletConnectors],
  initialAuthenticationMode: 'connect-only',
  // Enhanced Account Abstraction settings
  multiWallet: true,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DynamicContextProvider settings={dynamicSettings}>
      <App />
    </DynamicContextProvider>
  </StrictMode>,
)